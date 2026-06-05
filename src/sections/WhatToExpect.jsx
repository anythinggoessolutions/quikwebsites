import { motion } from 'framer-motion'

const expectations = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3L17.5 10.5L25 12L19.5 17.5L21 25L14 21.5L7 25L8.5 17.5L3 12L10.5 10.5L14 3Z" fill="#FFD60A"/>
      </svg>
    ),
    title: 'Launch in Minutes',
    desc: 'From idea to live website in under 5 minutes. No waiting, no agencies, no back-and-forth.',
    bg: '#FFF7E0',
    border: '#FFE999',
    accent: '#FFD60A',
    tag: '⚡ Super Fast',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="3" width="22" height="22" rx="6" fill="#00C65A"/>
        <path d="M9 14L12.5 17.5L19 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'AI-Designed for You',
    desc: 'Our AI picks the perfect colors, fonts, layout, and 3D elements for your exact industry.',
    bg: '#E6FFF2',
    border: '#AAFFD0',
    accent: '#00C65A',
    tag: '🤖 Intelligent',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="11" fill="#3B82F6"/>
        <path d="M10 14L13 17L18 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Works Everywhere',
    desc: 'Pixel-perfect on mobile, tablet, and desktop. Your site adapts beautifully to every screen.',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    accent: '#3B82F6',
    tag: '📱 Responsive',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C8.48 4 4 8.48 4 14s4.48 10 10 10 10-4.48 10-10S19.52 4 14 4z" fill="#8B5CF6"/>
        <path d="M12 10v8l6-4-6-4z" fill="white"/>
      </svg>
    ),
    title: 'Stunning 3D Elements',
    desc: 'Interactive 3D animations and visuals that make your brand impossible to forget.',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    accent: '#8B5CF6',
    tag: '✨ 3D Magic',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4l2.6 7.4H24l-6.2 4.5 2.4 7.1L14 19l-6.2 4 2.4-7.1L4 11.4h7.4L14 4z" fill="#EC4899"/>
      </svg>
    ),
    title: 'SEO-Ready Out of the Box',
    desc: 'AI-written copy, structured data, meta tags, and sitemap — your site ranks from day one.',
    bg: '#FFF0F7',
    border: '#FBCFE8',
    accent: '#EC4899',
    tag: '📊 SEO Built-in',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="8" width="20" height="14" rx="4" fill="#FF6B35"/>
        <path d="M10 8V6a4 4 0 018 0v2" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="14" cy="15" r="2" fill="white"/>
      </svg>
    ),
    title: 'Secure & Blazing Fast',
    desc: 'SSL included, global CDN, 99.9% uptime. Your site loads in milliseconds, anywhere.',
    bg: '#FFF4F0',
    border: '#FED7C7',
    accent: '#FF6B35',
    tag: '🔒 Enterprise Grade',
  },
]

function ExpectCard({ item, index }) {
  return (
    <motion.div
      className="expect-card"
      style={{ background: item.bg, borderColor: item.border }}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="expect-icon-wrap">{item.icon}</div>
      <div className="expect-tag" style={{ color: item.accent, background: `${item.accent}18` }}>
        {item.tag}
      </div>
      <h3 className="expect-title">{item.title}</h3>
      <p className="expect-desc">{item.desc}</p>
      <div className="expect-arrow" style={{ color: item.accent }}>
        Learn more →
      </div>

      <style>{`
        .expect-card {
          border: 1.5px solid;
          border-radius: 20px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: default;
          transition: box-shadow 0.25s;
        }
        .expect-card:hover {
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
        }
        .expect-icon-wrap {
          width: 52px; height: 52px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 14px;
          background: rgba(255,255,255,0.7);
        }
        .expect-tag {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 50px;
          letter-spacing: 0.3px;
          width: fit-content;
        }
        .expect-title {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #0A0A0A;
          letter-spacing: -0.3px;
        }
        .expect-desc {
          font-size: 14px;
          color: #6B7280;
          line-height: 1.7;
        }
        .expect-arrow {
          font-size: 13px;
          font-weight: 600;
          margin-top: 4px;
        }
      `}</style>
    </motion.div>
  )
}

export default function WhatToExpect() {
  return (
    <section id="expect" className="expect-section">
      {/* Decorative SVG top wave */}
      <div className="expect-wave-top">
        <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#F3F4F6"/>
        </svg>
      </div>

      <div className="expect-inner">
        <div className="expect-header">
          <motion.div
            className="section-label"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#00C65A"/></svg>
            What to Expect
          </motion.div>

          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Everything you need,
            <br />
            <span className="gradient-text">nothing you don't.</span>
          </motion.h2>

          <motion.p
            className="section-sub"
            style={{ margin: '0 auto' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
          >
            QuikWebsites packs enterprise-grade power into a tool that anyone can use.
            No learning curve, no compromises.
          </motion.p>
        </div>

        <div className="expect-grid">
          {expectations.map((item, i) => (
            <ExpectCard key={item.title} item={item} index={i} />
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          className="expect-stats"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {[['12K+', 'Businesses Launched'], ['< 5min', 'Average Build Time'], ['4.9★', 'Google Rating'], ['99.9%', 'Uptime Guaranteed']].map(([num, label]) => (
            <div key={label} className="stat-item">
              <div className="stat-num">{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        .expect-section {
          position: relative;
          padding: 0 24px 100px;
          background: #F3F4F6;
        }
        .expect-wave-top {
          width: 100%;
          height: 60px;
          overflow: hidden;
          line-height: 0;
          background: #fff;
        }
        .expect-wave-top svg { width: 100%; height: 100%; }
        .expect-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding-top: 80px;
          text-align: center;
        }
        .expect-header {
          margin-bottom: 56px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .expect-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          text-align: left;
          margin-bottom: 60px;
        }
        .expect-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          background: #0A0A0A;
          border-radius: 20px;
          overflow: hidden;
        }
        .stat-item {
          padding: 32px 24px;
          border-right: 1px solid rgba(255,255,255,0.07);
          text-align: center;
        }
        .stat-item:last-child { border-right: none; }
        .stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          margin-bottom: 6px;
        }
        .stat-label {
          font-size: 12px;
          color: #6B7280;
          letter-spacing: 0.3px;
        }
        @media (max-width: 900px) {
          .expect-grid { grid-template-columns: repeat(2, 1fr); }
          .expect-stats { grid-template-columns: repeat(2, 1fr); }
          .stat-item:nth-child(2) { border-right: none; }
          .stat-item:nth-child(3) { border-top: 1px solid rgba(255,255,255,0.07); }
        }
        @media (max-width: 600px) {
          .expect-grid { grid-template-columns: 1fr; }
          .expect-stats { grid-template-columns: repeat(2, 1fr); }
          .expect-section { padding: 0 20px 80px; }
        }
      `}</style>
    </section>
  )
}
