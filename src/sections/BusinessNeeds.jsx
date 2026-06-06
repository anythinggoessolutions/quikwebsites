import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Stack from '../components/ui/Stack/Stack'

const FEATURES = [
  { num: '01', title: 'Scroll-Driven 3D Experience', desc: 'Cinematic scroll animations that make every visitor stop, feel, and remember you.', accent: '#00C65A', icon: '✦' },
  { num: '02', title: 'Custom Logo Design',           desc: 'A unique logo built by AI to match your brand identity and industry instantly.',    accent: '#818CF8', icon: '◈' },
  { num: '03', title: 'AI Copywriting',               desc: 'Headlines, taglines, and page copy that connects and converts — written in seconds.', accent: '#38BDF8', icon: '⌘' },
  { num: '04', title: 'Hosting & Domain',             desc: 'Blazing-fast global CDN, SSL, and 99.9% uptime. Fully managed, zero config.',       accent: '#00C65A', icon: '⬡' },
  { num: '05', title: 'Mobile Responsive',            desc: 'Every layout, animation, and button adapts perfectly to any screen size.',           accent: '#F472B6', icon: '▣' },
  { num: '06', title: 'Premium Visual Library',       desc: 'Millions of pro photos and videos, curated by AI to match your exact brand.',        accent: '#FB923C', icon: '◉' },
  { num: '07', title: 'AI Chat & Customization',      desc: 'A smart chatbot trained on your business, converting visitors 24/7.',                accent: '#A78BFA', icon: '⬟' },
]

const CARDS = FEATURES.map(f => (
  <div className="bn-card-inner" key={f.num} style={{ '--a': f.accent }}>
    <div className="bn-card-glow" />
    <div className="bn-card-num" style={{ color: f.accent }}>{f.num}</div>
    <div className="bn-card-icon" style={{ color: f.accent }}>{f.icon}</div>
    <div className="bn-card-title">{f.title}</div>
    <div className="bn-card-desc">{f.desc}</div>
    <div className="bn-card-bar" />
  </div>
))

export default function BusinessNeeds() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-120px' })

  return (
    <section className="bn-section">

      {/* ── Static robot background (replaced interactive Spline for performance) ── */}
      <div className="bn-spline-bg" aria-hidden="true">
        <picture>
          <source media="(max-width: 640px)" srcSet="/spline-robot-mobile.webp" />
          <img
            src="/spline-robot.webp"
            alt=""
            className="bn-robot-img"
            draggable={false}
          />
        </picture>
      </div>

      {/* ── Overlay to keep text readable ── */}
      <div className="bn-overlay" />

      {/* ── Content ── */}
      <div ref={ref} className="bn-content">

        <motion.p
          className="bn-eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="bn-dot" /> What's Included
        </motion.p>

        <motion.h2
          className="bn-title"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.1 }}
        >
          Everything you need.<br />
          <span className="bn-green">All in one place.</span>
        </motion.h2>

        <motion.p
          className="bn-sub"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.18 }}
        >
          Seven powerful features. One platform. Delivered by AI in minutes.
        </motion.p>

        {/* Card stack right under the title */}
        <motion.div
          className="bn-stack-wrap"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.28 }}
        >
          <Stack
            cards={CARDS}
            sensitivity={120}
            sendToBackOnClick={true}
            autoplay={true}
            autoplayDelay={3500}
            pauseOnHover={true}
            animationConfig={{ stiffness: 220, damping: 24 }}
          />
        </motion.div>

        <motion.p
          className="bn-hint"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          ← drag a card to cycle
        </motion.p>

      </div>

      <style>{`

        /* ── Section ── */
        .bn-section {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        /* ── Static robot background ── */
        .bn-spline-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: #c8c8ce;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bn-robot-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 60%;
        }
        .bn-spline-bg picture {
          width: 100%;
          height: 100%;
        }

        /* ── Subtle left-side overlay so text pops ── */
        .bn-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            to right,
            rgba(4,3,18,0.72) 0%,
            rgba(4,3,18,0.45) 45%,
            transparent 75%
          );
          pointer-events: none;
        }

        /* ── Content ── */
        .bn-content {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 100px 64px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
        }

        /* ── Eyebrow ── */
        .bn-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }
        .bn-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00C65A;
          box-shadow: 0 0 6px rgba(0,198,90,0.7);
          animation: bn-pulse 2s ease-in-out infinite;
        }
        @keyframes bn-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.7); }
        }

        /* ── Title ── */
        .bn-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(30px, 4vw, 56px);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin: 0;
          text-shadow: 0 2px 24px rgba(0,0,0,0.4);
        }
        .bn-green { color: #00C65A; }

        /* ── Sub ── */
        .bn-sub {
          font-family: 'Inter', sans-serif;
          font-size: clamp(13px, 1.2vw, 15px);
          color: rgba(255,255,255,0.55);
          line-height: 1.8;
          margin: 0;
          max-width: 380px;
        }

        /* ── Stack ── */
        .bn-stack-wrap {
          width: 340px;
          height: 260px;
          position: relative;
          margin-top: 8px;
        }

        /* ── Drag hint ── */
        .bn-hint {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          margin: 0;
          letter-spacing: 0.3px;
        }

        /* ── Cards ── */
        .bn-card-inner {
          width: 100%;
          height: 100%;
          background: rgba(8,6,28,0.95);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 26px 24px 22px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 56px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06);
          box-sizing: border-box;
          cursor: grab;
        }
        .bn-card-inner:active { cursor: grabbing; }
        .bn-card-glow {
          position: absolute;
          top: -24px; right: -24px;
          width: 90px; height: 90px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--a) 0%, transparent 70%);
          opacity: 0.15;
          pointer-events: none;
        }
        .bn-card-num {
          font-family: 'Inter', monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
          position: relative; z-index: 1;
        }
        .bn-card-icon {
          font-size: 26px;
          line-height: 1;
          margin: 2px 0;
          position: relative; z-index: 1;
        }
        .bn-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
          line-height: 1.25;
          position: relative; z-index: 1;
        }
        .bn-card-desc {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.42);
          line-height: 1.65;
          position: relative; z-index: 1;
        }
        .bn-card-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--a) 50%, transparent);
          border-radius: 0 0 20px 20px;
          opacity: 0.75;
        }

        /* ── Mobile ── */
        @media (max-width: 860px) {
          .bn-content   { padding: 80px 32px; }
          .bn-overlay   { background: linear-gradient(to bottom, rgba(4,3,18,0.65) 0%, rgba(4,3,18,0.45) 100%); }
        }
        @media (max-width: 640px) {
          .bn-section    { min-height: 100vh; }
          .bn-content    {
            padding: 72px 20px 36px;
            align-items: center;
            text-align: center;
            min-height: 100vh;
            justify-content: space-between;
            gap: 0;
          }
          .bn-eyebrow    { justify-content: center; }
          .bn-sub        { max-width: 100%; margin-bottom: 0; }
          /* Group text tightly at top */
          .bn-eyebrow,
          .bn-title,
          .bn-sub        { margin-bottom: 10px; }
          /* Push stack + hint to the bottom */
          .bn-stack-wrap {
            width: 290px;
            height: 225px;
            margin-top: auto;
            padding-top: 16px;
          }
          .bn-hint       { margin-top: 10px; }
          .bn-title      { letter-spacing: -1px; }
          /* Stronger overlay at top and bottom, transparent in middle so robot shows */
          .bn-overlay    {
            background: linear-gradient(
              to bottom,
              rgba(4,3,18,0.82) 0%,
              rgba(4,3,18,0.30) 35%,
              rgba(4,3,18,0.30) 65%,
              rgba(4,3,18,0.82) 100%
            );
          }
        }
      `}</style>
    </section>
  )
}
