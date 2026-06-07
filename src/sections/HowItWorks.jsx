import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    step: '01',
    title: 'Tell us your\nbusiness story.',
    desc: 'Share your business name, what you do, and who you serve. No tech knowledge needed — takes under 60 seconds.',
  },
  {
    step: '02',
    title: 'AI crafts your\nexperience.',
    desc: 'Our AI builds a cinematic, story-driven website tailored to your brand — logo, copy, and design all included. Nothing like it exists anywhere else.',
  },
  {
    step: '03',
    title: 'Make it\nperfectly yours.',
    desc: 'Browse your personalized variations, pick your favorite, and fine-tune any details. Your story, your way.',
  },
  {
    step: '04',
    title: 'Go live and\nget remembered.',
    desc: 'Your experience goes live in minutes — hosted, SSL-secured, and connected to your custom domain. Ready to impress from day one.',
  },
]

/* ─── Seeded PRNG ─── */
const makeRand = seed => {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

/* ─── Explosion shards ─── */
function buildShards(w, h) {
  const rand = makeRand(3571)
  const cols = 7, rows = 5
  const pts  = []
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const bx = (c / cols) * w
      const by = (r / rows) * h
      const dx = (c === 0 || c === cols) ? 0 : (rand() - 0.5) * (w / cols) * 0.6
      const dy = (r === 0 || r === rows) ? 0 : (rand() - 0.5) * (h / rows) * 0.6
      pts.push([bx + dx, by + dy])
    }
  }
  const shards = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tl = pts[r * (cols+1) + c],     tr = pts[r * (cols+1) + c+1]
      const br = pts[(r+1)*(cols+1) + c+1], bl = pts[(r+1)*(cols+1) + c]
      const cx = (tl[0]+tr[0]+br[0]+bl[0]) / 4
      const cy = (tl[1]+tr[1]+br[1]+bl[1]) / 4
      const ang = Math.atan2(cy - h/2, cx - w/2)
      const spd = 280 + rand() * 360
      shards.push({ poly:[tl,tr,br,bl], cx, cy,
        vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
        rot: (rand()-0.5)*5, delay: rand()*0.09 })
    }
  }
  return shards
}

/* ─────────────────────────────────────────────
   WebGL Voronoi crack shader
   Cracks reveal from all four corners inward,
   converging toward the center (where the text is).
───────────────────────────────────────────── */
const VERT_SRC = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`
const FRAG_SRC = `
  precision highp float;
  uniform float u_progress;
  uniform float u_time;
  uniform vec2  u_res;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
    return fract(sin(p) * 43758.5453);
  }

  /* Voronoi edge distance — returns distance to nearest Voronoi boundary */
  float voronoiEdge(vec2 x) {
    vec2 n = floor(x), f = fract(x);
    float md = 8.0;
    vec2  mr = vec2(0.0), mg = vec2(0.0);

    for (int j=-1; j<=1; j++) for (int i=-1; i<=1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + hash2(n+g) - f;
      float d = dot(r,r);
      if (d < md) { md = d; mr = r; mg = g; }
    }

    float ed = 8.0;
    for (int j=-2; j<=2; j++) for (int i=-2; i<=2; i++) {
      vec2 g = vec2(float(i), float(j));
      if (dot(g-mg,g-mg) < 0.0001) continue;
      vec2 r = g + hash2(n+g) - f;
      ed = min(ed, dot(0.5*(mr+r), normalize(r-mr)));
    }
    return max(0.0, ed);
  }

  void main() {
    if (u_progress < 0.01) { gl_FragColor = vec4(0.0); return; }

    vec2 uv = gl_FragCoord.xy / u_res;
    uv.y = 1.0 - uv.y;

    /* Distance from nearest corner — 0 at corners, ~0.707 at center */
    float cornerDist = min(
      min(length(uv), length(uv - vec2(1.0,0.0))),
      min(length(uv - vec2(0.0,1.0)), length(uv - vec2(1.0,1.0)))
    );

    /* Cracks reveal from corners inward as progress grows */
    float reveal = u_progress * 0.76;
    float showFactor = 1.0 - smoothstep(reveal - 0.07, reveal + 0.03, cornerDist);
    if (showFactor < 0.005) { gl_FragColor = vec4(0.0); return; }

    float t = u_time * 0.04;

    /* Three scales of Voronoi = large cracks + sub-cracks + hairlines */
    float e1 = voronoiEdge(uv * 3.2);
    float e2 = voronoiEdge(uv * 6.8 + t) * 0.52;
    float e3 = voronoiEdge(uv * 14.0 - t*0.5) * 0.26;
    float edge = min(e1, min(e2, e3));

    /* Glow blazes in the final 30% before explosion */
    float glowPower = smoothstep(0.45, 1.0, u_progress);
    float crackW    = 0.016;
    float glowW     = crackW * (3.5 + glowPower * 5.0);

    float crackLine = 1.0 - smoothstep(0.0, crackW, edge);
    float crackGlow = 1.0 - smoothstep(0.0, glowW,  edge);

    /* Brand green #00C65A → rgb(0, 0.776, 0.353) */
    vec3 green = vec3(0.0, 0.776, 0.353);
    vec3 col   = green * (1.0 + glowPower * 1.8);

    float alpha = (crackLine * 0.92 + crackGlow * glowPower * 0.5) * showFactor;
    gl_FragColor = vec4(col, alpha);
  }
`

function useWebGLCracks(canvasRef, progressRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src); gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VERT_SRC))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const uProgress = gl.getUniformLocation(prog, 'u_progress')
    const uTime     = gl.getUniformLocation(prog, 'u_time')
    const uRes      = gl.getUniformLocation(prog, 'u_res')

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf
    const loop = ts => {
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uProgress, progressRef.current)
      gl.uniform1f(uTime,     ts * 0.001)
      gl.uniform2f(uRes,      canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
}

/* ─── Explosion canvas (Canvas 2D) ─── */
function useExplosion(canvasRef, shardsRef, explodingRef, explodeStartRef, crackCanvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      shardsRef.current = buildShards(canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const DURATION = 1.4
    let raf
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (explodingRef.current) {
        const t = (performance.now() - explodeStartRef.current) / 1000

        /* Fade out WebGL crack canvas */
        if (crackCanvasRef.current) {
          crackCanvasRef.current.style.opacity = Math.max(0, 1 - t * 3).toFixed(3)
        }

        /* Green flash */
        if (t < 0.15) {
          ctx.fillStyle = `rgba(0,200,90,${(1 - t/0.15) * 0.88})`
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        /* Flying shards */
        if (t < DURATION && shardsRef.current) {
          shardsRef.current.forEach(s => {
            const el    = Math.max(0, t - s.delay)
            const alpha = Math.max(0, 1 - (el / DURATION) * 1.5)
            if (alpha <= 0) return
            const dx = s.vx * el
            const dy = s.vy * el + 0.5 * 200 * el * el
            ctx.save()
            ctx.globalAlpha = alpha
            ctx.translate(s.cx+dx, s.cy+dy)
            ctx.rotate(s.rot * el)
            ctx.translate(-s.cx, -s.cy)
            ctx.beginPath()
            ctx.moveTo(s.poly[0][0], s.poly[0][1])
            s.poly.forEach(([px,py]) => ctx.lineTo(px,py))
            ctx.closePath()
            ctx.fillStyle   = '#f4f3fc'
            ctx.fill()
            ctx.strokeStyle = 'rgba(0,198,90,0.6)'
            ctx.lineWidth   = 1
            ctx.shadowColor = '#00C65A'
            ctx.shadowBlur  = 4
            ctx.stroke()
            ctx.restore()
          })
        }
      } else {
        /* Restore crack canvas opacity when scrolling back */
        if (crackCanvasRef.current) {
          crackCanvasRef.current.style.opacity = '1'
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
}

/* ─── Camera shake (earthquake rumble) ─── */
function useShake(stickyRef, crackProgressRef, explodingRef, explodeStartRef) {
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    let raf, lastT = 0
    const loop = t => {
      if (t - lastT > 45) {   /* ~22fps — classic earthquake stutter */
        lastT = t
        const p = crackProgressRef.current
        let intensity
        if (explodingRef.current) {
          const elapsed = (performance.now() - explodeStartRef.current) / 1000
          /* Hard shake for 0.5s then decay to 0 over 0.4s */
          intensity = elapsed < 0.5 ? 18 : Math.max(0, 18 * (1 - (elapsed - 0.5) / 0.4))
        } else {
          intensity = p * p * 9     /* ramps quadratically — barely felt at start */
        }
        if (intensity > 0.5) {
          el.style.transform = `translate(${(Math.random()-0.5)*intensity}px,${(Math.random()-0.5)*intensity*0.55}px)`
        } else {
          el.style.transform = ''
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); el.style.transform = '' }
  }, [])
}

/* ══════════════════════════════════════════ */
export default function HowItWorks() {
  const sectionRef      = useRef(null)
  const stickyRef       = useRef(null)
  const revealRef       = useRef(null)
  const crackCanvasRef  = useRef(null)   /* WebGL */
  const explodeCanvasRef = useRef(null)  /* Canvas 2D */
  const stepRefs        = useRef([])
  const pipRefs         = useRef([])

  const crackProgressRef = useRef(0)
  const explodingRef     = useRef(false)
  const explodeStartRef  = useRef(0)
  const shardsRef        = useRef(null)

  useWebGLCracks(crackCanvasRef, crackProgressRef)
  useExplosion(explodeCanvasRef, shardsRef, explodingRef, explodeStartRef, crackCanvasRef)
  useShake(stickyRef, crackProgressRef, explodingRef, explodeStartRef)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const reveal  = revealRef.current
    if (!section || !reveal) return

    reveal.style.clipPath = 'circle(0vmax at 50% 100%)'
    stepRefs.current.forEach(el => {
      if (!el) return
      el.style.opacity = '0'; el.style.transform = 'translateY(28px)'
    })

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh()

      const easeOut    = t => 1 - Math.pow(1-t, 2)
      const easeIn     = t => Math.pow(t, 2)
      const REVEAL_END = 0.11
      const STEPS_S    = 0.14
      const STEPS_E    = 0.82
      const EXPLODE_AT = 0.91
      const FADE       = 0.22

      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start:   'top top',
          end:     'bottom bottom',
          scrub:   0.6,
          onUpdate(self) {
            const p = self.progress

            /* Circle reveal */
            const revP = Math.min(p / REVEAL_END, 1)
            reveal.style.clipPath = `circle(${Math.pow(revP, 0.65)*155}vmax at 50% 100%)`

            /* Crack progress — feeds WebGL shader + shake */
            crackProgressRef.current = Math.max(0,
              Math.min(1, (p - REVEAL_END) / (EXPLODE_AT - REVEAL_END))
            )

            /* Trigger explosion */
            if (p >= EXPLODE_AT && !explodingRef.current) {
              explodingRef.current    = true
              explodeStartRef.current = performance.now()
            }

            /* Reset explosion on scroll back */
            if (p < EXPLODE_AT - 0.04 && explodingRef.current) {
              explodingRef.current = false
              if (crackCanvasRef.current) crackCanvasRef.current.style.opacity = '1'
            }

            /* Steps */
            const stepsP = Math.max(0, Math.min(1, (p-STEPS_S)/(STEPS_E-STEPS_S)))
            const ap = stepsP * steps.length

            stepRefs.current.forEach((el, i) => {
              if (!el) return
              const sp = ap - i, isLast = i === steps.length - 1
              let opacity = 0, ty = 28
              if      (sp>0 && sp<FADE)                   { const et=easeOut(sp/FADE);          opacity=et;    ty=28*(1-et) }
              else if (sp>=FADE && (isLast||sp<=1-FADE))  { opacity=1; ty=0 }
              else if (sp>1-FADE && sp<=1)                { const et=easeIn((sp-(1-FADE))/FADE); opacity=1-et; ty=-22*et }
              else if (sp>1)                              { opacity=0; ty=-22 }
              el.style.opacity   = opacity
              el.style.transform = `translateY(${ty}px)`
            })

            const active = Math.min(Math.floor(stepsP * steps.length), steps.length - 1)
            pipRefs.current.forEach((pip, i) => {
              if (!pip) return
              pip.style.opacity    = p >= EXPLODE_AT ? '0' : '1'
              pip.style.background = i===active ? '#00C65A' : 'rgba(0,0,0,0.15)'
              pip.style.transform  = i===active ? 'scaleX(1.2)' : 'scaleX(1)'
            })
          },
        })
      }, section)
      return () => ctx.revert()
    })

    return () => {
      cancelAnimationFrame(raf)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <>
      <section ref={sectionRef} className="hiw-section">
        <div ref={stickyRef} className="hiw-sticky">

          <div className="hiw-dark-base" />

          <div ref={revealRef} className="hiw-reveal">

            {/* WebGL Voronoi crack shader */}
            <canvas ref={crackCanvasRef}  className="hiw-canvas hiw-crack-canvas" />

            {/* Canvas 2D explosion shards */}
            <canvas ref={explodeCanvasRef} className="hiw-canvas hiw-explode-canvas" />

            <div className="hiw-eyebrow">
              <span className="hiw-dot" />
              How It Works
            </div>

            {steps.map((s, i) => (
              <div key={i} ref={el => { stepRefs.current[i] = el }} className="hiw-step">
                <p className="hiw-step-num">Step {s.step}</p>
                <h2 className="hiw-step-title">
                  {s.title.split('\n').map((line, j, arr) => (
                    <span key={j}>{line}{j < arr.length-1 && <br />}</span>
                  ))}
                </h2>
                <p className="hiw-step-desc">{s.desc}</p>
              </div>
            ))}

            <div className="hiw-pips">
              {steps.map((_, i) => (
                <span key={i} ref={el => { pipRefs.current[i] = el }} className="hiw-pip" />
              ))}
            </div>

          </div>
        </div>
      </section>

      <style>{`
        .hiw-section { height: 600vh; position: relative; }

        .hiw-sticky {
          position: sticky;
          top: 0; width: 100%; height: 100vh;
          overflow: hidden;
          will-change: transform;
        }
        .hiw-dark-base { position: absolute; inset: 0; background: #07051a; z-index: 0; }

        .hiw-reveal {
          position: absolute; inset: 0;
          background: #f4f3fc;
          clip-path: circle(0vmax at 50% 100%);
          z-index: 2; overflow: hidden; will-change: clip-path;
        }

        /* Both canvases stack in the same space */
        .hiw-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          display: block; pointer-events: none;
        }
        .hiw-crack-canvas   { z-index: 2; }
        .hiw-explode-canvas { z-index: 3; }

        .hiw-eyebrow {
          position: absolute; top: 96px; left: 48px; z-index: 10;
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Inter',sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: rgba(10,8,40,0.55);
          padding: 6px 16px 6px 12px;
          background: rgba(10,8,40,0.06); border: 1px solid rgba(10,8,40,0.10);
          border-radius: 50px;
        }
        .hiw-dot {
          width:6px; height:6px; border-radius:50%;
          background:#00C65A; box-shadow:0 0 6px rgba(0,198,90,0.7); flex-shrink:0;
        }

        .hiw-step {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 0 32px; text-align: center;
          z-index: 10; opacity: 0; will-change: opacity, transform;
        }
        .hiw-step-num {
          font-family:'Inter',sans-serif; font-size:12px; font-weight:800;
          letter-spacing:2.5px; text-transform:uppercase; color:#00C65A; margin:0 0 16px;
        }
        .hiw-step-title {
          font-family:'Sora',sans-serif;
          font-size: clamp(42px, 6.5vw, 80px);
          font-weight:800; color:#0d0b1f; line-height:1.05;
          letter-spacing:-2.5px; margin:0 0 22px;
        }
        .hiw-step-desc {
          font-family:'Inter',sans-serif;
          font-size: clamp(15px, 1.5vw, 18px);
          color:rgba(20,15,60,0.50); line-height:1.75; max-width:480px; margin:0 auto;
        }

        .hiw-pips {
          position:absolute; bottom:42px; right:52px; z-index:10;
          display:flex; gap:10px; align-items:center;
        }
        .hiw-pip {
          display:block; width:32px; height:3px; border-radius:2px;
          background:rgba(0,0,0,0.15);
          transition: background 0.3s, transform 0.3s, opacity 0.3s;
          transform-origin: left center;
        }

        @media (max-width: 640px) {
          .hiw-section    { height: 650vh; }
          .hiw-eyebrow    { left: 20px; top: 72px; }
          .hiw-pips       { right: 20px; }
          .hiw-step-title { letter-spacing:-1.5px; font-size: clamp(36px,9vw,56px); }
          .hiw-step-desc  { font-size: 14px; }
        }
      `}</style>
    </>
  )
}
