import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

const FEATURES = [
  'Cinematic Scroll Experience',
  'React-Powered Components',
  'Frame-by-Frame Video Storytelling',
  'AI-Generated Logo, Copy & Design',
]

const COMPETITORS = ['Wix', 'Squarespace', 'WordPress', 'GoDaddy']

/* ──────────────────────────────────────────
   Liquid Image — WebGL grayscale→color reveal
   + mouse-driven ripple distortion
   ────────────────────────────────────────── */
function LiquidImageBg() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    /* ── Canvas ── */
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'
    el.appendChild(canvas)

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) { el.removeChild(canvas); return }

    /* ── Shaders ── */
    const vs = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        v_uv.y = 1.0 - v_uv.y;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `
    const fs = `
      precision highp float;
      uniform sampler2D u_tex;
      uniform float     u_color;
      uniform vec2      u_mouse;
      uniform float     u_time;
      uniform vec2      u_res;
      uniform float     u_imgAspect;
      varying vec2 v_uv;

      void main() {
        vec2 uv = v_uv;

        /* Correct cover-fit using actual image aspect ratio */
        float canAspect = u_res.x / u_res.y;
        if (u_imgAspect > canAspect) {
          /* Image wider than canvas — crop sides, center */
          float s = canAspect / u_imgAspect;
          uv.x = uv.x * s + (1.0 - s) * 0.5;
        } else {
          /* Image taller than canvas — crop top/bottom, center */
          float s = u_imgAspect / canAspect;
          uv.y = uv.y * s + (1.0 - s) * 0.5;
        }

        /* Ripple at cursor */
        vec2  d    = uv - u_mouse;
        float dist = length(d);
        float wave = sin(dist * 30.0 - u_time * 5.5)
                   * exp(-dist * 9.0)
                   * 0.018
                   * u_color;
        uv += normalize(d + 0.0001) * wave;

        vec4  c = texture2D(u_tex, clamp(uv, 0.0, 1.0));

        /* Grayscale ↔ colour */
        float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));
        c.rgb = mix(vec3(g), c.rgb, u_color);

        gl_FragColor = c;
      }
    `

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER,   vs))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    /* ── Fullscreen quad ── */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    /* ── Uniforms ── */
    const uTex       = gl.getUniformLocation(prog, 'u_tex')
    const uColor     = gl.getUniformLocation(prog, 'u_color')
    const uMouse     = gl.getUniformLocation(prog, 'u_mouse')
    const uTime      = gl.getUniformLocation(prog, 'u_time')
    const uRes       = gl.getUniformLocation(prog, 'u_res')
    const uImgAspect = gl.getUniformLocation(prog, 'u_imgAspect')
    let imgAspect    = 16 / 9 /* fallback until image loads */

    /* ── Texture ── */
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    /* 1×1 dark placeholder */
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([6, 5, 15, 255]))

    const img = new Image()
    img.src = '/comparisonbackground3.png'
    img.onload = () => {
      imgAspect = img.naturalWidth / img.naturalHeight
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    }

    /* ── State ── */
    let colorAmt = 0, targetColor = 0
    let mx = 0.5, my = 0.5
    let tmx = 0.5, tmy = 0.5
    let t = 0, raf

    /* ── Resize ── */
    const resize = () => {
      canvas.width  = el.offsetWidth
      canvas.height = el.offsetHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    /* ── Mouse tracking (on the section, not just the canvas) ── */
    const section = el.parentElement
    const onEnter = () => { targetColor = 1 }
    const onLeave = () => { targetColor = 0; tmx = 0.5; tmy = 0.5 }
    const onMove  = (e) => {
      const r = section.getBoundingClientRect()
      tmx = (e.clientX - r.left)  / r.width
      tmy = (e.clientY - r.top)   / r.height
    }
    section.addEventListener('mouseenter', onEnter)
    section.addEventListener('mouseleave', onLeave)
    section.addEventListener('mousemove',  onMove)

    /* ── Render loop ── */
    const loop = () => {
      t += 0.016
      colorAmt += (targetColor - colorAmt) * 0.045   /* smooth transition */
      mx += (tmx - mx) * 0.09
      my += (tmy - my) * 0.09

      gl.uniform1i(uTex,        0)
      gl.uniform1f(uColor,      colorAmt)
      gl.uniform2f(uMouse,      mx, my)
      gl.uniform1f(uTime,       t)
      gl.uniform2f(uRes,        canvas.width, canvas.height)
      gl.uniform1f(uImgAspect,  imgAspect)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      section.removeEventListener('mouseenter', onEnter)
      section.removeEventListener('mouseleave', onLeave)
      section.removeEventListener('mousemove',  onMove)
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
    }
  }, [])

  return <div ref={ref} style={{ position: 'absolute', inset: 0, zIndex: 0 }} aria-hidden="true" />
}

export default function Comparison() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="cmp-section">

      <LiquidImageBg />
      <div className="cmp-overlay" />

      <div className="cmp-inner">

        <motion.div
          className="cmp-header"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="cmp-eyebrow">
            <span className="cmp-eyebrow-dot" />
            The Comparison
          </p>
          <h2 className="cmp-title">
            Why Everyone Is Switching to{' '}
            <span className="cmp-title-green">QuikWebsites</span>
          </h2>
          <p className="cmp-subtitle">Same category. Completely different universe.</p>
        </motion.div>

        <motion.div
          className="cmp-table-wrap"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cmp-table">
            <div className="cmp-row cmp-row-header">
              <div className="cmp-cell cmp-cell-feature" />
              {COMPETITORS.map(c => (
                <div key={c} className="cmp-cell cmp-cell-comp">
                  <span className="cmp-comp-name">{c}</span>
                  <span className="cmp-comp-badge">BASIC</span>
                </div>
              ))}
              <div className="cmp-cell cmp-cell-qw">
                <span className="cmp-qw-name">QuikWebsites</span>
                <span className="cmp-qw-badge">✦ NEXT-GEN</span>
              </div>
            </div>

            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                className="cmp-row cmp-row-feat"
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.35 + i * 0.07 }}
              >
                <div className="cmp-cell cmp-cell-feature">
                  <span className="cmp-feat-label">{feat}</span>
                </div>
                {COMPETITORS.map(c => (
                  <div key={c} className="cmp-cell cmp-cell-comp cmp-cell-x">
                    <span className="cmp-x">✕</span>
                  </div>
                ))}
                <div className="cmp-cell cmp-cell-qw cmp-cell-check">
                  <span className="cmp-check">✓</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="cmp-cta-wrap"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.85 }}
        >
          <button className="cmp-cta-btn">Build My Website Free →</button>
          <p className="cmp-cta-note">Free to start. Upgrade when you're ready.</p>
        </motion.div>

      </div>

      <style>{`
        .cmp-section {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: #000;
        }

        /* Dark vignette so table stays readable — lifts on hover via section:hover */
        .cmp-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: rgba(0, 0, 0, 0.58);
          pointer-events: none;
          transition: background 0.8s ease;
        }
        .cmp-section:hover .cmp-overlay {
          background: rgba(0, 0, 0, 0.38);
        }

        .cmp-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
        }

        .cmp-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .cmp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 6px 16px;
          border-radius: 100px;
          margin: 0;
        }
        .cmp-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #ff3e3e;
          display: inline-block;
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(255,62,62,0.7);
        }
        .cmp-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(26px, 3.8vw, 50px);
          font-weight: 800;
          color: #fff;
          line-height: 1.12;
          letter-spacing: -1.5px;
          margin: 0;
        }
        .cmp-title-green { color: #00C65A; }
        .cmp-subtitle {
          font-family: 'Sora', sans-serif;
          font-size: clamp(14px, 1.5vw, 18px);
          font-weight: 600;
          font-style: italic;
          color: rgba(255,255,255,0.45);
          margin: 0;
        }

        .cmp-table-wrap { width: 100%; }
        .cmp-table {
          width: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .cmp-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.4fr;
          align-items: stretch;
        }
        .cmp-row-header {
          background: rgba(0,0,0,0.65);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .cmp-row-feat {
          background: rgba(0,0,0,0.55);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.2s;
        }
        .cmp-row-feat:last-child { border-bottom: none; }
        .cmp-row-feat:hover { background: rgba(0,0,0,0.20); }

        .cmp-cell {
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .cmp-cell:last-child { border-right: none; }
        .cmp-cell-feature {
          align-items: flex-start;
          text-align: left;
          padding-left: 20px;
        }
        .cmp-feat-label {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
        }
        .cmp-comp-name {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          display: block;
          margin-bottom: 4px;
        }
        .cmp-comp-badge {
          font-family: 'Inter', sans-serif;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .cmp-cell-qw {
          background: rgba(0,198,90,0.07);
          border-left: 1px solid rgba(0,198,90,0.25) !important;
          border-right: none !important;
          animation: cmp-col-glow 3.5s ease-in-out infinite;
        }
        @keyframes cmp-col-glow {
          0%,100% { background: rgba(0,198,90,0.07); }
          50%      { background: rgba(0,198,90,0.12); }
        }
        .cmp-qw-name {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: #00C65A;
          display: block;
          margin-bottom: 4px;
          text-shadow: 0 0 12px rgba(0,198,90,0.5);
        }
        .cmp-qw-badge {
          font-family: 'Inter', sans-serif;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
          color: #00C65A;
          background: rgba(0,198,90,0.1);
          border: 1px solid rgba(0,198,90,0.3);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .cmp-x {
          font-size: 14px;
          color: #ff5a5a;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(0,0,0,0.8);
        }
        .cmp-check {
          font-size: 16px;
          color: #00C65A;
          font-weight: 900;
          text-shadow: 0 0 10px rgba(0,198,90,0.6);
        }
        .cmp-cell-x { animation: cmp-glitch-cell 12s linear infinite; }
        .cmp-cell-x:nth-child(2) { animation-delay: 0s; }
        .cmp-cell-x:nth-child(3) { animation-delay: 2s; }
        .cmp-cell-x:nth-child(4) { animation-delay: 4s; }
        .cmp-cell-x:nth-child(5) { animation-delay: 1s; }
        @keyframes cmp-glitch-cell {
          0%,90%,100% { opacity:1; transform:none; }
          92% { opacity:0.5; transform:translateX(-1px); }
          94% { opacity:1; transform:translateX(1px); }
          96% { opacity:0.7; transform:none; }
        }

        .cmp-cta-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .cmp-cta-btn {
          background: linear-gradient(135deg, #00C65A 0%, #00a348 100%);
          color: #001a08;
          border: none;
          padding: 15px 40px;
          border-radius: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: -0.2px;
          box-shadow: 0 8px 32px rgba(0,198,90,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cmp-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(0,198,90,0.45);
        }
        .cmp-cta-note {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          margin: 0;
        }

        @media (max-width: 860px) {
          .cmp-inner { padding: 80px 24px; gap: 36px; }
        }
        @media (max-width: 640px) {
          .cmp-inner        { padding: 64px 12px; gap: 28px; }
          .cmp-title        { letter-spacing: -1px; }
          .cmp-row          { grid-template-columns: 1.6fr 0.55fr 0.55fr 0.55fr 0.55fr 0.8fr; }
          .cmp-cell         { padding: 11px 4px; }
          .cmp-cell-feature { padding-left: 10px; padding-right: 6px; }
          .cmp-comp-badge,
          .cmp-qw-badge     { display: none; }
          .cmp-feat-label   { font-size: 10.5px; line-height: 1.3; }
          .cmp-comp-name    { font-size: 10px; margin-bottom: 0; }
          .cmp-qw-name      { font-size: 10px; margin-bottom: 0; }
          .cmp-x            { font-size: 13px; color: #ff5a5a; text-shadow: 0 0 6px rgba(0,0,0,0.9); }
          .cmp-check        { font-size: 14px; }
          .cmp-table        { border-radius: 14px; }
          .cmp-row-header   { background: rgba(0,0,0,0.75); }
          .cmp-row-feat     { background: rgba(0,0,0,0.70); }
        }
      `}</style>
    </section>
  )
}
