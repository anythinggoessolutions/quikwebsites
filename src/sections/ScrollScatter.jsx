import { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────
   Each image gets its own component so hooks are never
   called inside a loop (Rules of Hooks compliance)
───────────────────────────────────────────────────────────── */
const SCATTER_DATA = [
  { x: -260, y: -340, endScale: 0.48, rotate: -6  },
  { x: -460, y: -200, endScale: 0.40, rotate: -8  },
  { x: -380, y:  210, endScale: 0.50, rotate:  7  },
  { x: -140, y:  350, endScale: 0.36, rotate:  4  },
  { x:  340, y: -400, endScale: 0.45, rotate:  5  },
  { x:  500, y: -260, endScale: 0.38, rotate: -5  },
  { x:  420, y:  220, endScale: 0.42, rotate:  4  },
  { x:  200, y:  360, endScale: 0.38, rotate: -7  },
]

const IMAGES = [
  '/images/bella-ambiance.webp',
  '/images/lens-portrait.webp',
  '/images/fitlife-gym.webp',
  '/images/lens-wedding.webp',
  '/images/bella-herodish.webp',
  '/images/fitlife-class.webp',
  '/images/lens-landscape.webp',
  '/images/care-sarah.webp',
]

function ScatterItem({ src, scatter, index, scrollYProgress }) {
  const stagger      = index * 0.06
  const start        = Math.min(0 + stagger * 0.15, 0.85)
  const end          = Math.min(0.7 + stagger * 0.15, 1)

  const x      = useTransform(scrollYProgress, [start, end], [0, scatter.x])
  const y      = useTransform(scrollYProgress, [start, end], [0, scatter.y])
  const scale  = useTransform(scrollYProgress, [start, end], [1, scatter.endScale])
  const rotate = useTransform(scrollYProgress, [start, end], [0, scatter.rotate * 8])
  const opacity = useTransform(scrollYProgress, [start, Math.min(end + 0.15, 1)], [1, 0])

  return (
    <motion.div
      className="ss-img-wrap"
      style={{ x, y, scale, rotate, opacity }}
    >
      <img src={src} alt="" className="ss-img" draggable={false} />
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Section
───────────────────────────────────────────────────────────── */
export default function ScrollScatter() {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  /* Title fade — comes in as images scatter out */
  const titleOpacity = useTransform(scrollYProgress, [0, 0.18, 0.55, 0.8], [0, 1, 1, 0])
  const titleY       = useTransform(scrollYProgress, [0, 0.18], [32, 0])

  return (
    <section ref={containerRef} className="ss-section">

      {/* Centered title */}
      <motion.div className="ss-title-wrap" style={{ opacity: titleOpacity, y: titleY }}>
        <p className="ss-label">
          <span className="ss-dot" />
          Built for every business
        </p>
        <h2 className="ss-title">
          Restaurants. Gyms.<br />
          Law firms. <span className="ss-green">All of them.</span>
        </h2>
      </motion.div>

      {/* Scatter stage */}
      <div className="ss-stage">
        {IMAGES.map((src, i) => (
          <ScatterItem
            key={i}
            src={src}
            scatter={SCATTER_DATA[i]}
            index={i}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>

      <style>{`
        .ss-section {
          position: relative;
          height: 280vh;
          background: #07050f;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
        }

        /* ── Title ── */
        .ss-title-wrap {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          pointer-events: none;
          text-align: center;
          padding: 0 24px;
        }
        .ss-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.32);
          margin: 0 0 20px;
        }
        .ss-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00C65A;
          box-shadow: 0 0 6px rgba(0,198,90,0.6);
        }
        .ss-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(30px, 5vw, 62px);
          font-weight: 800;
          color: #fff;
          line-height: 1.12;
          letter-spacing: -2px;
          margin: 0;
        }
        .ss-green { color: #00C65A; }

        /* ── Stage ── */
        .ss-stage {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          margin-top: -100vh;
          z-index: 5;
        }

        /* ── Image ── */
        .ss-img-wrap {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          will-change: transform, opacity;
        }
        .ss-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .ss-section    { height: 220vh; }
          .ss-title      { letter-spacing: -1px; }
          .ss-img-wrap   { width: 130px; height: 130px; border-radius: 14px; }
        }
      `}</style>
    </section>
  )
}
