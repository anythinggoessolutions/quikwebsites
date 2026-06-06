import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Aurora from '../components/backgrounds/Aurora/Aurora'

const REVIEWS = [
  {
    name: 'Sarah Mitchell',
    business: 'Bloom Floral Studio',
    initials: 'SM',
    color: '#F472B6',
    text: 'I described my flower shop in two sentences and had a live site I\'m genuinely proud of. Bookings doubled in the first month.',
  },
  {
    name: 'James Okafor',
    business: 'Okafor & Associates Law',
    initials: 'JO',
    color: '#4ADE80',
    text: 'Professional, polished, and it actually converts clients. I\'ve tried three other builders — none came close.',
  },
  {
    name: 'Priya Nair',
    business: 'Nair Wellness Clinic',
    initials: 'PN',
    color: '#38BDF8',
    text: 'Our new site looks like we spent $15,000 on a design agency. Patients constantly compliment it. Setup took 8 minutes.',
  },
  {
    name: 'Carlos Vega',
    business: 'Vega Personal Training',
    initials: 'CV',
    color: '#FB923C',
    text: 'The animations make clients say wow every single time. My competitors keep asking who built my site.',
  },
  {
    name: 'Amy Henderson',
    business: 'AH Creative Agency',
    initials: 'AH',
    color: '#A78BFA',
    text: 'What used to take weeks takes an afternoon. Completely changed my business model.',
  },
  {
    name: 'Tony Russo',
    business: 'Russo\'s Plumbing Co.',
    initials: 'TR',
    color: '#4ADE80',
    text: 'More calls in the first two weeks than the entire previous year. My phone hasn\'t stopped ringing.',
  },
  {
    name: 'Emma Park',
    business: 'Park Life Coaching',
    initials: 'EP',
    color: '#818CF8',
    text: 'I\'ve tried Wix, Squarespace, Webflow. This is on a completely different level.',
  },
  {
    name: 'Mike Dawson',
    business: 'Dawson Real Estate',
    initials: 'MD',
    color: '#4ADE80',
    text: 'The AI wrote better copy than the agency I paid $3,000. I couldn\'t believe how good it was.',
  },
  {
    name: 'Lisa Nguyen',
    business: 'Pho Saigon Restaurant',
    initials: 'LN',
    color: '#FB923C',
    text: 'Foot traffic up 40% since we launched. Customers walk in saying they loved how our site looked.',
  },
  {
    name: 'Rachel Kim',
    business: 'Lens & Light Photography',
    initials: 'RK',
    color: '#F472B6',
    text: 'My portfolio has never looked this good. Inquiries went through the roof. I literally cried.',
  },
  {
    name: 'David Marsh',
    business: 'Marsh Boutique Hotel',
    initials: 'DM',
    color: '#A78BFA',
    text: 'Direct bookings up 60%. The site sells the experience better than we ever could ourselves.',
  },
  {
    name: 'Ben Oliver',
    business: 'Oliver Dental Group',
    initials: 'BO',
    color: '#38BDF8',
    text: 'The AI chatbot alone saves me 20 hours a week. It answers questions, books appointments, never sleeps.',
  },
]

// Duplicate for seamless loop
const ITEMS = [...REVIEWS, ...REVIEWS]

function ReviewCard({ review }) {
  return (
    <div className="rv-card">
      <div className="rv-stars">★★★★★</div>
      <p className="rv-text">"{review.text}"</p>
      <div className="rv-author">
        <div
          className="rv-avatar"
          style={{ background: `${review.color}20`, border: `1px solid ${review.color}40` }}
        >
          <span style={{ color: review.color }}>{review.initials}</span>
        </div>
        <div>
          <div className="rv-name">{review.name}</div>
          <div className="rv-biz">{review.business}</div>
        </div>
      </div>
    </div>
  )
}

export default function Reviews() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="rv-section">


      {/* ── Aurora background ── */}
      <div className="rv-aurora" aria-hidden="true">
        <Aurora
          colorStops={['#00C65A', '#5b50e8', '#00C65A']}
          amplitude={0.9}
          blend={0.6}
          speed={0.6}
        />
      </div>

      {/* Title */}
      <motion.div
        ref={ref}
        className="rv-header"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
      >
        <p className="rv-label">
          <span className="rv-dot" /> Customer Reviews
        </p>
        <h2 className="rv-title">
          Here's what people<br />
          <span className="rv-green">are saying.</span>
        </h2>
      </motion.div>

      {/* Single marquee strip */}
      <motion.div
        className="rv-strip-wrap"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.25 }}
      >
        <div className="rv-track">
          {ITEMS.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>
      </motion.div>

      {/* Edge fades */}
      <div className="rv-fade-l" />
      <div className="rv-fade-r" />

      <style>{`
        .rv-section {
          position: relative;
          background: #05040f;
          padding: 80px 0 90px;
          overflow: hidden;
        }

        /* ── Aurora layer ── */
        .rv-aurora {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.55;
        }
        .rv-aurora .aurora-container,
        .rv-aurora canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }

        /* ── Header ── */
        .rv-header {
          position: relative;
          z-index: 2;
          text-align: center;
          margin-bottom: 48px;
          padding: 0 24px;
        }
        .rv-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin: 0 0 16px;
        }
        .rv-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4ADE80;
          box-shadow: 0 0 6px rgba(74,222,128,0.6);
        }
        .rv-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(26px, 4vw, 48px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -1.5px;
          margin: 0;
        }
        .rv-green { color: #4ADE80; }

        /* ── Marquee strip ── */
        .rv-strip-wrap {
          position: relative;
          z-index: 2;
          overflow: hidden;
          width: 100%;
          cursor: default;
        }
        .rv-track {
          display: flex;
          gap: 14px;
          width: max-content;
          animation: rv-scroll 55s linear infinite;
        }
        .rv-strip-wrap:hover .rv-track {
          animation-play-state: paused;
        }
        @keyframes rv-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── Card ── */
        .rv-card {
          flex-shrink: 0;
          width: 300px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 20px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color 0.2s, background 0.2s;
        }
        .rv-card:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(74,222,128,0.22);
        }
        .rv-stars {
          color: #4ADE80;
          font-size: 12px;
          letter-spacing: 2px;
        }
        .rv-text {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.72);
          line-height: 1.65;
          margin: 0;
          font-style: italic;
        }
        .rv-author {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 2px;
        }
        .rv-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 800;
        }
        .rv-name {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        .rv-biz {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          color: rgba(255,255,255,0.3);
          margin-top: 1px;
        }

        /* ── Edge fades ── */
        .rv-fade-l,
        .rv-fade-r {
          position: absolute;
          top: 0; bottom: 0;
          width: 140px;
          pointer-events: none;
          z-index: 3;
        }
        .rv-fade-l {
          left: 0;
          background: linear-gradient(to right, #05040f 0%, transparent 100%);
        }
        .rv-fade-r {
          right: 0;
          background: linear-gradient(to left, #05040f 0%, transparent 100%);
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .rv-section { padding: 60px 0 70px; }
          .rv-header  { margin-bottom: 36px; }
          .rv-title   { letter-spacing: -1px; }
          .rv-card    { width: 252px; padding: 16px 16px 14px; }
          .rv-fade-l, .rv-fade-r { width: 40px; }
        }
      `}</style>
    </section>
  )
}
