import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─── Mini website preview cards ─── */
const websitePreviews = [
  { id: 1,  accent: '#e8562a', bg: '#1a0a05', label: 'Restaurant',  nav: ['Menu','Reserve','About'],     heroColor: 'linear-gradient(135deg,#e8562a,#c94a20)', heroText: 'Authentic Italian\nCuisine',        blocks: ['#3a1a10','#2a1008','#3a1a10'] },
  { id: 2,  accent: '#6366f1', bg: '#0f0e1a', label: 'SaaS',         nav: ['Product','Pricing','Docs'],   heroColor: 'linear-gradient(135deg,#6366f1,#8b5cf6)', heroText: 'Ship Faster\nWith AI',              blocks: ['#1e1d35','#181730','#1e1d35'] },
  { id: 3,  accent: '#c9a84c', bg: '#0d0b08', label: 'Hotel',        nav: ['Rooms','Spa','Dining'],       heroColor: 'linear-gradient(135deg,#c9a84c,#8b6914)', heroText: 'True Luxury is\nin the Nature',     blocks: ['#1e1a0f','#181408','#1e1a0f'] },
  { id: 4,  accent: '#f4a261', bg: '#1a0f08', label: 'Bakery',       nav: ['Menu','Order','Story'],       heroColor: 'linear-gradient(135deg,#f4a261,#e76f51)', heroText: 'Fresh Baked\nWith Love',           blocks: ['#2e1a0e','#241408','#2e1a0e'] },
  { id: 5,  accent: '#334155', bg: '#080d14', label: 'Law Firm',     nav: ['Practice','Team','Contact'],  heroColor: 'linear-gradient(135deg,#1e40af,#1e3a5f)', heroText: 'Justice.\nExperience.\nResults.',  blocks: ['#0f1a2a','#0a1520','#0f1a2a'] },
  { id: 6,  accent: '#22c55e', bg: '#050f08', label: 'Fitness',      nav: ['Classes','Trainers','Join'],  heroColor: 'linear-gradient(135deg,#22c55e,#16a34a)', heroText: 'Transform\nYour Body',             blocks: ['#0a1f0e','#081a0b','#0a1f0e'] },
  { id: 7,  accent: '#e2e8f0', bg: '#0a0a0a', label: 'Photography',  nav: ['Portfolio','Services','Book'],heroColor: 'linear-gradient(135deg,#1a1a2e,#16213e)', heroText: 'Capturing\nMoments',               blocks: ['#1a1a1a','#141414','#1a1a1a'] },
  { id: 8,  accent: '#fbbf24', bg: '#080c0e', label: 'Solar',        nav: ['Solutions','Savings','Install'],heroColor:'linear-gradient(135deg,#0ea5e9,#0284c7)', heroText: 'Store Energy &\nLower Your Bills', blocks: ['#0f1e2a','#0a1820','#0f1e2a'] },
  { id: 9,  accent: '#ec4899', bg: '#12040e', label: 'E-commerce',   nav: ['Shop','Sale','New In'],       heroColor: 'linear-gradient(135deg,#ec4899,#be185d)', heroText: 'Style That\nSpeaks Yours',         blocks: ['#22091a','#1c0715','#22091a'] },
  { id: 10, accent: '#f59e0b', bg: '#0e0a04', label: 'Coaching',     nav: ['Programs','Results','Book'],  heroColor: 'linear-gradient(135deg,#f59e0b,#d97706)', heroText: 'Meal Prep That\nWows You',         blocks: ['#1f1508','#1a1006','#1f1508'] },
  { id: 11, accent: '#0ea5e9', bg: '#040c14', label: 'Medical',      nav: ['Services','Team','Book'],     heroColor: 'linear-gradient(135deg,#0ea5e9,#0369a1)', heroText: 'Your Health\nOur Priority',        blocks: ['#081a28','#061520','#081a28'] },
  { id: 12, accent: '#8b5cf6', bg: '#0c0814', label: 'Real Estate',  nav: ['Buy','Sell','Rent'],          heroColor: 'linear-gradient(135deg,#7c3aed,#6d28d9)', heroText: 'Find Your\nDream Home',           blocks: ['#180f28','#130b20','#180f28'] },
]

function PreviewCard({ site }) {
  const lines = site.heroText.split('\n')
  return (
    <div className="preview-card" style={{ background: site.bg }}>
      <div className="pc-nav" style={{ borderBottomColor: `${site.accent}22` }}>
        <div className="pc-logo" style={{ background: site.accent }} />
        <div className="pc-nav-links">
          {site.nav.map(n => <div key={n} className="pc-nav-link" />)}
        </div>
      </div>
      <div className="pc-hero" style={{ background: site.heroColor }}>
        <div className="pc-hero-content">
          {lines.map((line, i) => (
            <div key={i} className="pc-hero-line" style={{
              width: i === 0 ? '80%' : '65%',
              opacity: i === 0 ? 1 : 0.75,
              height: i === 0 ? 8 : 6,
              marginBottom: i === 0 ? 6 : 0,
            }} />
          ))}
          <div className="pc-cta-row">
            <div className="pc-cta-btn" style={{ background: site.accent }} />
            <div className="pc-cta-ghost" />
          </div>
        </div>
      </div>
      <div className="pc-body">
        {site.blocks.map((c, i) => (
          <div key={i} className="pc-block" style={{ background: c }}>
            <div className="pc-block-bar" style={{ width: ['70%','55%','65%'][i] }} />
            <div className="pc-block-bar" style={{ width: '45%', opacity: 0.5 }} />
          </div>
        ))}
      </div>
      <div className="pc-label" style={{ color: site.accent }}>{site.label}</div>
    </div>
  )
}

const COL_COUNT  = 4
const columns    = Array.from({ length: COL_COUNT }, (_, ci) => websitePreviews.filter((_, i) => i % COL_COUNT === ci))
const directions = ['up', 'down', 'up', 'down']
const speeds     = [28, 22, 32, 25]

function PreviewColumn({ cards, direction, speed, colRef }) {
  const doubled = [...cards, ...cards]
  return (
    <div className="preview-col" ref={colRef}>
      <div className={`preview-col-inner scroll-${direction}`} style={{ animationDuration: `${speed}s` }}>
        {doubled.map((site, i) => <PreviewCard key={`${site.id}-${i}`} site={site} />)}
      </div>
    </div>
  )
}

export default function Hero() {
  const [businessName, setBusinessName] = useState('')
  const [description,  setDescription]  = useState('')

  const sectionRef   = useRef(null)
  const gridRef      = useRef(null)
  const cardRef      = useRef(null)
  const tintRef      = useRef(null)
  const headlineRef  = useRef(null)
  const col0Ref      = useRef(null)
  const col1Ref      = useRef(null)
  const col2Ref      = useRef(null)
  const col3Ref      = useRef(null)
  const colRefs      = [col0Ref, col1Ref, col2Ref, col3Ref]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (businessName.trim() || description.trim()) {
      alert(`Building website for "${businessName}" 🚀`)
    }
  }

  useEffect(() => {
    const section  = sectionRef.current
    const grid     = gridRef.current
    const card     = cardRef.current
    const tint     = tintRef.current
    const headline = headlineRef.current
    const cols     = colRefs.map(r => r.current).filter(Boolean)
    if (!section || !card || !headline || !cols.length) return

    const mobile = window.matchMedia('(max-width: 640px)').matches

    const ctx = gsap.context(() => {

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end:   mobile ? '+=160%' : '+=220%',
          pin:   true,
          scrub: mobile ? 0.8 : 1.2,
          anticipatePin: 1,
          refreshPriority: 1,
        }
      })

      /* ── Phase 1 (0–30%): Glass card fades, columns spread ── */
      tl.to(card, {
        opacity:  0,
        scale:    0.88,
        y:        -40,
        duration: 0.3,
        ease:     'power2.in',
      }, 0)

      /* Tint lifts slightly so grid pops */
      tl.to(tint, { opacity: 0.45, duration: 0.3 }, 0)

      /* Columns spread outward */
      tl.to(cols[0], { x: '-18%', scale: 1.06, duration: 0.45, ease: 'power1.inOut' }, 0)
      tl.to(cols[1], { x: '-8%',  scale: 1.04, duration: 0.45, ease: 'power1.inOut' }, 0)
      tl.to(cols[2], { x:  '8%',  scale: 1.04, duration: 0.45, ease: 'power1.inOut' }, 0)
      tl.to(cols[3], { x:  '18%', scale: 1.06, duration: 0.45, ease: 'power1.inOut' }, 0)
      tl.to(grid, { scale: 1.08, duration: 0.45, ease: 'power1.inOut' }, 0)

      /* ── Phase 2 (30–65%): Headline appears ── */
      tl.fromTo(headline,
        { opacity: 0, y: 60,  scale: 0.92 },
        { opacity: 1, y: 0,   scale: 1, duration: 0.3, ease: 'power3.out' },
      0.3)

      /* ── Phase 3 (65–100%): Headline fades, grid resets for exit ── */
      tl.to(headline, {
        opacity:  0,
        y:       -50,
        scale:    1.04,
        duration: 0.3,
        ease:     'power2.in',
      }, 0.7)

      tl.to(grid,  { scale: 1,   duration: 0.3, ease: 'power2.inOut' }, 0.7)
      tl.to(cols[0], { x: '0%', duration: 0.3 }, 0.7)
      tl.to(cols[1], { x: '0%', duration: 0.3 }, 0.7)
      tl.to(cols[2], { x: '0%', duration: 0.3 }, 0.7)
      tl.to(cols[3], { x: '0%', duration: 0.3 }, 0.7)
      tl.to(tint,   { opacity: 1, duration: 0.3 }, 0.7)

    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" ref={sectionRef}>

      {/* ── Scrolling background grid ── */}
      <div className="preview-grid" ref={gridRef} aria-hidden="true">
        {columns.map((cards, ci) => (
          <PreviewColumn
            key={ci}
            cards={cards}
            direction={directions[ci]}
            speed={speeds[ci]}
            colRef={colRefs[ci]}
          />
        ))}
      </div>

      {/* ── Tint overlay ── */}
      <div className="hero-tint" ref={tintRef} />

      {/* ── Cinematic headline (scroll phase 2) ── */}
      <div className="hero-cinematic" ref={headlineRef} aria-hidden="true">
        <p className="cinematic-eyebrow">QuikWebsites</p>
        <h2 className="cinematic-headline">
          The website<br />
          <span className="cinematic-green">you always</span><br />
          wanted.
        </h2>
      </div>

      {/* ── Center frosted glass card ── */}
      <div className="hero-center">
        {/* Outer div: GSAP scroll animations */}
        <div ref={cardRef} style={{ width: '100%' }}>
        {/* Inner motion.div: entrance animation only */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1
            className="hero-headline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Launch a Website People Actually{' '}
            <span className="headline-green">Remember</span>{' '}— in Minutes
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
          >
            QuikWebsites uses AI to build cinematic, story-driven websites in minutes — the kind of presence that used to cost tens of thousands. Built to impress. Designed to convert.
          </motion.p>

          <motion.div
            className="form-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.55 }}
          >
            <div className="form-header">
              <span className="form-sparkle">✦</span>
              Try It Now For Free
            </div>
            <form onSubmit={handleSubmit} className="hero-form">
              <div className="field-group">
                <label className="field-label">Business Name</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Your Business Name"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Describe Your Business</label>
                <div className="textarea-wrap">
                  <textarea
                    className="field-textarea"
                    placeholder="We're a local bakery that creates custom wedding cakes and fresh pastries daily..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                  />
                  <motion.button
                    type="submit"
                    className="submit-btn"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Build My Website →
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>

          <motion.div
            className="trust-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {['Ready in minutes','Hosting included','Built to impress','Designed to convert'].map((badge, i) => (
              <div key={badge} className="trust-badge">
                <span className="trust-dot" style={{ background: ['#00C65A','#22d3ee','#a78bfa','#fbbf24'][i] }} />
                {badge}
              </div>
            ))}
          </motion.div>
        </motion.div>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #07051a;
          padding: 80px 24px 60px;
        }

        /* ── Preview grid ── */
        .preview-grid {
          position: absolute;
          inset: -60px -20px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          overflow: hidden;
          z-index: 0;
          align-content: start;
          transform-origin: center center;
        }
        .preview-col {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transform-origin: center center;
        }
        .preview-col-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
          will-change: transform;
        }
        .scroll-up   { animation: scrollUp   linear infinite; }
        .scroll-down { animation: scrollDown linear infinite; }
        @keyframes scrollUp   { from { transform: translateY(0);    } to { transform: translateY(-50%); } }
        @keyframes scrollDown { from { transform: translateY(-50%); } to { transform: translateY(0);    } }

        /* ── Preview card ── */
        .preview-card {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          opacity: 0.9;
        }
        .pc-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.25);
        }
        .pc-logo       { width: 32px; height: 8px; border-radius: 4px; opacity: 0.9; }
        .pc-nav-links  { display: flex; gap: 7px; }
        .pc-nav-link   { width: 26px; height: 5px; background: rgba(255,255,255,0.25); border-radius: 3px; }
        .pc-hero       { padding: 18px 12px 14px; min-height: 90px; }
        .pc-hero-content { display: flex; flex-direction: column; gap: 5px; }
        .pc-hero-line  { border-radius: 4px; background: rgba(255,255,255,0.9); }
        .pc-cta-row    { display: flex; gap: 7px; margin-top: 10px; align-items: center; }
        .pc-cta-btn    { width: 52px; height: 16px; border-radius: 8px; opacity: 0.95; }
        .pc-cta-ghost  { width: 40px; height: 16px; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.45); }
        .pc-body       { display: flex; flex-direction: column; gap: 0; }
        .pc-block      { padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; }
        .pc-block-bar  { height: 6px; background: rgba(255,255,255,0.14); border-radius: 3px; }
        .pc-label {
          position: absolute; top: 9px; right: 9px;
          font-size: 8px; font-weight: 800; letter-spacing: 0.8px;
          text-transform: uppercase; opacity: 0.8;
          font-family: 'Inter', sans-serif;
          background: rgba(0,0,0,0.35); padding: 2px 6px; border-radius: 4px;
        }

        /* ── Tint ── */
        .hero-tint {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(160deg, rgba(18,10,70,0.78) 0%, rgba(30,15,90,0.72) 40%, rgba(10,6,50,0.80) 100%);
          pointer-events: none;
        }

        /* ── Cinematic headline ── */
        .hero-cinematic {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
          opacity: 0;
          padding: 24px;
        }
        .cinematic-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin: 0 0 24px;
        }
        .cinematic-headline {
          font-family: 'Sora', sans-serif;
          font-size: clamp(52px, 9vw, 120px);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.0;
          letter-spacing: -3px;
          margin: 0;
          text-shadow:
            0 0 80px rgba(91,80,232,0.6),
            0 4px 40px rgba(0,0,0,0.5);
        }
        .cinematic-green {
          color: #00C65A;
          text-shadow: 0 0 60px rgba(0,198,90,0.5);
        }

        /* ── Center content ── */
        .hero-center {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 660px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Glass card ── */
        .glass-card {
          width: 100%;
          background: rgba(255,255,255,0.09);
          backdrop-filter: blur(32px) saturate(1.6);
          -webkit-backdrop-filter: blur(32px) saturate(1.6);
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 28px;
          padding: 40px 40px 32px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05) inset;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 20px;
        }
        .hero-headline {
          font-family: 'Sora', sans-serif;
          font-size: clamp(22px, 3.8vw, 40px);
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1.18;
          color: #ffffff;
          text-shadow: 0 2px 20px rgba(0,0,0,0.4);
        }
        .headline-green { color: #00C65A; }
        .hero-sub {
          font-size: clamp(13px, 1.4vw, 15px);
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          max-width: 460px;
        }

        /* ── Form card ── */
        .form-card {
          width: 100%;
          background: rgba(8,5,38,0.78);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          padding: 26px 26px 22px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.45);
        }
        .form-header {
          font-family: 'Sora', sans-serif;
          font-size: 16px; font-weight: 700; color: #fff;
          text-align: center; margin-bottom: 20px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .form-sparkle { color: #00C65A; font-size: 14px; }
        .hero-form    { display: flex; flex-direction: column; gap: 16px; }
        .field-group  { display: flex; flex-direction: column; gap: 8px; text-align: left; }
        .field-label  { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); font-family: 'Inter', sans-serif; }
        .field-input  {
          width: 100%; background: rgba(255,255,255,0.92);
          border: 1.5px solid rgba(255,255,255,0.2); border-radius: 12px;
          padding: 13px 16px; font-size: 14px; font-family: 'Inter', sans-serif;
          color: #111; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: #9CA3AF; }
        .field-input:focus { border-color: #00C65A; box-shadow: 0 0 0 3px rgba(0,198,90,0.18); }
        .textarea-wrap {
          position: relative; background: rgba(255,255,255,0.92);
          border: 1.5px solid rgba(255,255,255,0.2); border-radius: 12px;
          overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .textarea-wrap:focus-within { border-color: #00C65A; box-shadow: 0 0 0 3px rgba(0,198,90,0.18); }
        .field-textarea {
          width: 100%; background: transparent; border: none;
          padding: 13px 16px 48px; font-size: 14px; font-family: 'Inter', sans-serif;
          color: #111; outline: none; resize: none; display: block; line-height: 1.6;
        }
        .field-textarea::placeholder { color: #9CA3AF; }
        .submit-btn {
          position: absolute; bottom: 10px; right: 10px;
          background: linear-gradient(135deg, #5b50e8, #7c6af5);
          color: #fff; border: none; padding: 10px 20px; border-radius: 10px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Inter', sans-serif; white-space: nowrap;
          box-shadow: 0 4px 16px rgba(91,80,232,0.4); transition: background 0.2s;
        }
        .submit-btn:hover { background: linear-gradient(135deg, #4a40d4, #6b5ae0); }

        /* ── Trust badges ── */
        .trust-row {
          display: flex; align-items: center; justify-content: center;
          gap: 24px; flex-wrap: wrap;
        }
        .trust-badge {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7);
          font-family: 'Inter', sans-serif;
        }
        .trust-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .preview-grid { grid-template-columns: repeat(3, 1fr); }
          .preview-col:last-child { display: none; }
        }
        @media (max-width: 640px) {
          .hero { padding: 62px 14px 16px; min-height: 100svh; }
          .glass-card { padding: 22px 18px 18px; border-radius: 20px; gap: 14px; }
          .hero-headline { font-size: clamp(20px, 5.8vw, 28px); }
          .hero-sub { font-size: 12px; line-height: 1.6; }
          .form-card { padding: 16px 14px 14px; border-radius: 14px; }
          .form-header { font-size: 14px; margin-bottom: 14px; }
          .field-input { padding: 11px 14px; font-size: 13px; }
          .field-textarea { padding: 11px 14px 44px; font-size: 13px; }
          .submit-btn { padding: 9px 14px; font-size: 12px; bottom: 8px; right: 8px; }
          .preview-grid { grid-template-columns: repeat(2, 1fr); }
          .preview-col:nth-child(3), .preview-col:nth-child(4) { display: none; }
          .trust-row { gap: 10px; }
          .trust-badge { font-size: 11px; gap: 5px; }
          .trust-dot { width: 6px; height: 6px; }
          .cinematic-headline { letter-spacing: -2px; }
        }
      `}</style>
    </section>
  )
}
