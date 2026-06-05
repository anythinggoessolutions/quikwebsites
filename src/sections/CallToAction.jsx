import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CallToAction() {
  const sectionRef  = useRef(null)
  const eyebrowRef  = useRef(null)
  const headlineRef = useRef(null)
  const subRef      = useRef(null)
  const cardRef     = useRef(null)
  const trustRef    = useRef(null)

  const [businessName, setBusinessName] = useState('')
  const [description,  setDescription]  = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (businessName.trim() || description.trim()) {
      alert(`Building website for "${businessName}" 🚀`)
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          once: true,
        },
      })
      tl.from(eyebrowRef.current,  { opacity: 0, y: 22,              duration: 0.55 })
        .from(headlineRef.current, { opacity: 0, y: 40,              duration: 0.80, ease: 'power3.out' }, '-=0.25')
        .from(subRef.current,      { opacity: 0, y: 26,              duration: 0.65 },                    '-=0.50')
        .from(cardRef.current,     { opacity: 0, scale: 0.95, y: 20, duration: 0.70, ease: 'power3.out' }, '-=0.40')
        .from(trustRef.current,    { opacity: 0, y: 14,              duration: 0.45 },                    '-=0.35')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="cta-section">

      {/* ── Video background ── */}
      <video
        className="cta-video cta-video--landscape"
        src="/horizontialcta.mov"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <video
        className="cta-video cta-video--portrait"
        src="/verticalcta.mov"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* ── Dark overlay so glass card reads cleanly ── */}
      <div className="cta-overlay" aria-hidden="true" />

      {/* ── Content ── */}
      <div className="cta-inner">
        <div className="cta-glass-card">

          <p ref={eyebrowRef} className="cta-eyebrow">
            <span className="cta-eyebrow-dot" />
            Start Building Today
          </p>

          <h2 ref={headlineRef} className="cta-headline">
            Build something{' '}
            <span className="cta-hl-green">people actually</span>{' '}
            remember.
          </h2>

          <p ref={subRef} className="cta-sub">
            Template builders make forgettable websites. QuikWebsites makes experiences.
            Your brand deserves something cinematic.
          </p>

          {/* Inner form card */}
          <div ref={cardRef} className="cta-form-card">
            <div className="cta-form-header">
              <span className="cta-form-sparkle">✦</span>
              Try It Now For Free
            </div>
            <form onSubmit={handleSubmit} className="cta-form">
              <div className="cta-field-group">
                <label className="cta-field-label">Business Name</label>
                <input
                  type="text"
                  className="cta-field-input"
                  placeholder="Your Business Name"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                />
              </div>
              <div className="cta-field-group">
                <label className="cta-field-label">Describe Your Business</label>
                <div className="cta-textarea-wrap">
                  <textarea
                    className="cta-field-textarea"
                    placeholder="We're a local bakery that creates custom wedding cakes and fresh pastries daily..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                  />
                  <button type="submit" className="cta-submit-btn">
                    Build My Website →
                  </button>
                </div>
              </div>
            </form>
            <p className="cta-form-note">Free to start. Upgrade when you're ready.</p>
          </div>

          <div ref={trustRef} className="cta-trust">
            {['Hosting included', 'Custom domain', 'AI-generated copy', 'Built in minutes'].map((t, i) => (
              <span key={i} className="cta-trust-item">
                <span className="cta-trust-check">✓</span>{t}
              </span>
            ))}
          </div>

        </div>
      </div>

      <style>{`

        /* ══════════════════════════
           SECTION
        ══════════════════════════ */
        .cta-section {
          position: relative;
          min-height: 100vh;
          background: #07050f;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 120px 32px;
        }

        /* ══════════════════════════
           VIDEO BACKGROUND
        ══════════════════════════ */
        .cta-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 1;
          pointer-events: none;
        }
        /* landscape video on desktop, portrait on mobile */
        .cta-video--portrait  { display: none; }
        .cta-video--landscape { display: block; }

        @media (max-width: 640px) {
          .cta-video--landscape { display: none; }
          .cta-video--portrait  { display: block; }
        }

        /* ══════════════════════════
           OVERLAY
        ══════════════════════════ */
        .cta-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(
            to bottom,
            rgba(7,5,26,0.62) 0%,
            rgba(7,5,26,0.45) 50%,
            rgba(7,5,26,0.72) 100%
          );
          pointer-events: none;
        }

        /* ══════════════════════════
           INNER
        ══════════════════════════ */
        .cta-inner {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 660px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ══════════════════════════
           GLASS CARD
        ══════════════════════════ */
        .cta-glass-card {
          width: 100%;
          background: rgba(7,5,26,0.55);
          backdrop-filter: blur(40px) saturate(1.8);
          -webkit-backdrop-filter: blur(40px) saturate(1.8);
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 28px;
          padding: 40px 40px 32px;
          box-shadow:
            0 40px 100px rgba(0,0,0,0.65),
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 0 80px rgba(0,198,90,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
        }

        /* ══════════════════════════
           EYEBROW
        ══════════════════════════ */
        .cta-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.42);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 16px;
          border-radius: 100px;
          margin: 0;
        }
        .cta-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00C65A;
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(0,198,90,0.7);
        }

        /* ══════════════════════════
           HEADLINE
        ══════════════════════════ */
        .cta-headline {
          font-family: 'Sora', sans-serif;
          font-size: clamp(22px, 3.8vw, 40px);
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -1px;
          color: #fff;
          margin: 0;
          text-shadow: 0 2px 24px rgba(0,0,0,0.6);
        }
        .cta-hl-green { color: #00C65A; }

        /* ══════════════════════════
           SUB
        ══════════════════════════ */
        .cta-sub {
          font-family: 'Inter', sans-serif;
          font-size: clamp(13px, 1.4vw, 15px);
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          max-width: 460px;
          margin: 0;
        }

        /* ══════════════════════════
           FORM CARD
        ══════════════════════════ */
        .cta-form-card {
          width: 100%;
          max-width: 560px;
          background: rgba(8,5,38,0.85);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 20px;
          padding: 28px 28px 20px;
          box-shadow: 0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
          animation: cta-card-glow 3.2s ease-in-out infinite;
        }
        @keyframes cta-card-glow {
          0%,100% { box-shadow: 0 8px 48px rgba(0,0,0,0.5), 0 0 40px rgba(0,198,90,0.06); }
          50%      { box-shadow: 0 8px 48px rgba(0,0,0,0.5), 0 0 60px rgba(0,198,90,0.14); }
        }
        .cta-form-header {
          font-family: 'Sora', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .cta-form-sparkle { color: #00C65A; font-size: 14px; }
        .cta-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .cta-field-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
          text-align: left;
        }
        .cta-field-label {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.1px;
        }
        .cta-field-input {
          width: 100%;
          background: rgba(255,255,255,0.92);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 11px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #111;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .cta-field-input::placeholder { color: #9CA3AF; }
        .cta-field-input:focus {
          border-color: #00C65A;
          box-shadow: 0 0 0 3px rgba(0,198,90,0.18);
        }
        .cta-textarea-wrap {
          position: relative;
          background: rgba(255,255,255,0.92);
          border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 11px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cta-textarea-wrap:focus-within {
          border-color: #00C65A;
          box-shadow: 0 0 0 3px rgba(0,198,90,0.18);
        }
        .cta-field-textarea {
          width: 100%;
          background: transparent;
          border: none;
          padding: 12px 14px 46px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #111;
          outline: none;
          resize: none;
          display: block;
          line-height: 1.6;
          box-sizing: border-box;
        }
        .cta-field-textarea::placeholder { color: #9CA3AF; }
        .cta-submit-btn {
          position: absolute;
          bottom: 9px;
          right: 9px;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          color: #fff;
          border: none;
          padding: 9px 18px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(91,80,232,0.4);
          transition: background 0.2s, transform 0.15s;
        }
        .cta-submit-btn:hover {
          background: linear-gradient(135deg, #4a40d4, #6b5ae0);
          transform: translateY(-1px);
        }
        .cta-form-note {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-align: center;
          margin: 14px 0 0;
        }

        /* ══════════════════════════
           TRUST ROW
        ══════════════════════════ */
        .cta-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        .cta-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.38);
        }
        .cta-trust-check {
          color: #00C65A;
          font-size: 12px;
          font-weight: 700;
        }

        /* ══════════════════════════
           RESPONSIVE
        ══════════════════════════ */
        @media (max-width: 640px) {
          .cta-section    { padding: 72px 16px; }
          .cta-glass-card { padding: 24px 18px 20px; border-radius: 20px; gap: 14px; }
          .cta-headline   { letter-spacing: -0.5px; }
          .cta-form-card  { padding: 16px 14px 14px; }
          .cta-trust      { gap: 12px; }
          .cta-trust-item { font-size: 11px; }
        }
      `}</style>
    </section>
  )
}
