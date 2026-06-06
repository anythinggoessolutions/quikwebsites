import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/*
  Cinematic intro — plays once per browser session.
  Timeline (≈ 2.4 s total):
    0.00 – 0.55 s  Logo rockets from off-left to center  (motion blur fades out)
    0.58 – 0.88 s  "QuikWebsites" wordmark fades in below
    0.88 – 1.88 s  1-second hold
    1.88 – 2.35 s  Screen explodes outward → hero revealed
*/

export default function IntroAnimation() {
  const [done, setDone] = useState(false)
  const overlayRef  = useRef(null)
  const logoRef     = useRef(null)
  const wordmarkRef = useRef(null)
  const taglineRef  = useRef(null)
  const blurFeRef   = useRef(null)   // <feGaussianBlur> element for horizontal motion blur

  useEffect(() => {
    if (sessionStorage.getItem('qw_intro_seen')) {
      setDone(true)
      return
    }

    const overlay  = overlayRef.current
    const logo     = logoRef.current
    const wordmark = wordmarkRef.current
    const tagline  = taglineRef.current

    // Place logo off-screen to the left
    gsap.set(logo,     { x: -(window.innerWidth + 400), opacity: 1 })
    gsap.set(wordmark, { opacity: 0, y: 20 })
    gsap.set(tagline,  { opacity: 0 })

    // Proxy for SVG feGaussianBlur stdDeviation (horizontal only)
    const blurProxy = { sd: 80 }

    const tl = gsap.timeline({
      onComplete() {
        sessionStorage.setItem('qw_intro_seen', '1')
        setDone(true)
      }
    })

    // ── Phase 1: rocket run-in ──────────────────────────────────────────────
    tl.to(logo, {
      x: 0,
      duration: 0.55,
      ease: 'power4.out',
    }, 0)

    // Blur fades from 80px → 0 as logo decelerates
    tl.to(blurProxy, {
      sd: 0,
      duration: 0.50,
      ease: 'power3.out',
      onUpdate() {
        if (blurFeRef.current) {
          blurFeRef.current.setAttribute('stdDeviation', `${blurProxy.sd.toFixed(2)} 0`)
        }
      },
    }, 0)

    // ── Phase 2: wordmark fades in ──────────────────────────────────────────
    tl.to(wordmark, {
      opacity: 1,
      y: 0,
      duration: 0.32,
      ease: 'power2.out',
    }, 0.58)

    // ── Phase 3: tagline fades in during the hold ──────────────────────────
    tl.to(tagline, {
      opacity: 1,
      duration: 0.28,
      ease: 'power2.out',
    }, 1.0)

    // ── Phase 4: EXPLODE outward (overlay + tagline fade together) ──────────
    tl.to(overlay, {
      scale: 7,
      opacity: 0,
      duration: 0.47,
      ease: 'power3.in',
    }, 1.88)

    return () => tl.kill()
  }, [])

  if (done) return null

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transformOrigin: 'center center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* ── SVG filter: horizontal-only motion blur ───────────────────────── */}
      <svg
        width="0"
        height="0"
        style={{ position: 'absolute', overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id="qw-motion-blur"
            x="-100%"
            width="300%"
            y="-10%"
            height="120%"
            colorInterpolationFilters="linearRGB"
          >
            <feGaussianBlur ref={blurFeRef} stdDeviation="80 0" />
          </filter>
        </defs>
      </svg>

      {/* ── Logo: compact fixed-height container shows only the bird region ── */}
      {/* backgroundSize:100% auto fills width and maintains aspect;
          backgroundPosition:center crops out the blank top/bottom padding */}
      <div
        ref={logoRef}
        style={{
          width: 'clamp(280px, 40vw, 520px)',
          height: 'clamp(68px, 9.5vw, 130px)',
          backgroundImage: 'url(/quikwebsites_logo.webp)',
          backgroundSize: '100% auto',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          filter: 'url(#qw-motion-blur) brightness(0) invert(1)',
          willChange: 'transform, filter',
          flexShrink: 0,
        }}
      />

      {/* ── "QuikWebsites" styled wordmark beneath the bird ─────────────────── */}
      <div
        ref={wordmarkRef}
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(26px, 3.8vw, 52px)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: '#fff',
          textShadow: '0 0 40px rgba(255,255,255,0.25)',
        }}
      >
        <span>Quik</span>
        <span style={{ color: '#22c55e' }}>Websites</span>
      </div>

      {/* ── Tagline ──────────────────────────────────────────────────────── */}
      <div
        ref={taglineRef}
        style={{
          marginTop: '14px',
          fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
          fontWeight: 300,
          fontSize: 'clamp(11px, 1.4vw, 18px)',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.72)',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '100vw',
        }}
      >
        This is what a website should feel like.
      </div>

      {/* ── Subtle vignette to keep focus on center ──────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
