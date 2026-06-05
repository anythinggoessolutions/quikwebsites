import { useState } from 'react'
import { motion } from 'framer-motion'

function BlobSVG({ color, style }) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      style={{ position: 'absolute', ...style, pointerEvents: 'none' }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
    >
      <path
        d="M47.1,-57.1C59.4,-46.7,67,-30.4,69.8,-13.2C72.5,4,70.3,22.1,61.4,35.4C52.5,48.7,36.9,57.2,20.1,62.5C3.3,67.8,-14.7,69.9,-30.1,64.2C-45.5,58.5,-58.3,45,-65.3,28.7C-72.3,12.4,-73.5,-6.7,-67.2,-22.7C-60.9,-38.7,-47.1,-51.6,-32.3,-61.4C-17.5,-71.2,-1.6,-77.8,13.5,-76.2C28.5,-74.6,34.8,-67.5,47.1,-57.1Z"
        transform="translate(100 100)"
        fill={color}
      />
    </motion.svg>
  )
}

export default function CTA() {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)

  return (
    <section className="cta-section">
      {/* Wave top */}
      <div className="cta-wave-top">
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0,80 C360,0 1080,0 1440,80 L1440,0 L0,0 Z" fill="#F3F4F6"/>
        </svg>
      </div>

      {/* Decorative blobs */}
      <div className="cta-blobs" aria-hidden="true">
        <BlobSVG color="rgba(255,255,255,0.08)" style={{ width: 400, height: 400, top: -80, left: -80 }} />
        <BlobSVG color="rgba(255,255,255,0.05)" style={{ width: 300, height: 300, bottom: -60, right: -60 }} />
        {/* Floating shapes */}
        <motion.div
          style={{ position: 'absolute', top: '20%', right: '8%', width: 60, height: 60, background: 'rgba(255,255,255,0.15)', borderRadius: '50%' }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          style={{ position: 'absolute', bottom: '25%', left: '6%', width: 40, height: 40, background: 'rgba(255,214,10,0.4)', borderRadius: '40%', transform: 'rotate(20deg)' }}
          animate={{ y: [0, 14, 0], rotate: [20, 40, 20] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          style={{ position: 'absolute', top: '60%', right: '15%', width: 28, height: 28, background: 'rgba(255,255,255,0.2)', borderRadius: '8px', transform: 'rotate(-15deg)' }}
          animate={{ y: [0, -10, 0], rotate: [-15, 15, -15] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Sparkle stars */}
        {[[15, 15], [85, 45], [45, 80], [75, 20]].map(([x, y], i) => (
          <motion.svg
            key={i}
            style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 20, height: 20 }}
            viewBox="0 0 24 24"
            animate={{ rotate: [0, 180, 360], opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3 + i, delay: i * 0.5, repeat: Infinity }}
          >
            <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z" fill="rgba(255,255,255,0.6)"/>
          </motion.svg>
        ))}
      </div>

      <div className="cta-inner">
        <motion.div
          className="cta-badge"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          🎉 Free to start — no credit card required
        </motion.div>

        <motion.h2
          className="cta-title"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          Ready to build something
          <br />
          extraordinary?
        </motion.h2>

        <motion.p
          className="cta-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Join 12,000+ businesses who launched their dream website with QuikWebsites.
          Your story starts with one sentence.
        </motion.p>

        <motion.form
          className={`cta-form ${focused ? 'focused' : ''}`}
          onSubmit={(e) => { e.preventDefault(); if (input.trim()) alert(`Building: "${input}" 🚀`) }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="cta-form-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Describe your business, we'll build your website."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="cta-input"
          />
          <motion.button
            type="submit"
            className="cta-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Build My Site →
          </motion.button>
        </motion.form>

        <motion.div
          className="cta-trust-row"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 }}
        >
          {['🔒 SSL Included', '⚡ Live in Minutes', '📱 Mobile-Ready', '✨ AI-Powered', '🌍 Global CDN'].map((t) => (
            <div key={t} className="cta-trust-item">{t}</div>
          ))}
        </motion.div>
      </div>

      <style>{`
        .cta-section {
          position: relative;
          background: #00C65A;
          padding: 0 24px 100px;
          overflow: hidden;
        }
        .cta-wave-top {
          width: 100%;
          height: 80px;
          overflow: hidden;
          line-height: 0;
        }
        .cta-wave-top svg { width: 100%; height: 100%; }
        .cta-blobs {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .cta-inner {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
          padding-top: 20px;
          padding-bottom: 40px;
        }
        .cta-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: 50px;
          margin-bottom: 28px;
          border: 1.5px solid rgba(255,255,255,0.3);
          letter-spacing: 0.2px;
        }
        .cta-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 800;
          letter-spacing: -2px;
          color: #fff;
          line-height: 1.08;
          margin-bottom: 20px;
        }
        .cta-sub {
          color: rgba(255,255,255,0.75);
          font-size: clamp(15px, 1.8vw, 18px);
          line-height: 1.7;
          margin-bottom: 44px;
        }
        .cta-form {
          display: flex;
          align-items: center;
          background: #fff;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 6px 6px 6px 16px;
          margin: 0 auto 24px;
          max-width: 580px;
          transition: box-shadow 0.25s;
        }
        .cta-form.focused {
          box-shadow: 0 0 0 4px rgba(255,255,255,0.4);
        }
        .cta-form-icon {
          flex-shrink: 0;
          margin-right: 8px;
          display: flex;
          align-items: center;
        }
        .cta-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #111;
          background: transparent;
          min-width: 0;
        }
        .cta-input::placeholder { color: #9CA3AF; }
        .cta-btn {
          background: #0A0A0A;
          color: #fff;
          border: none;
          padding: 13px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .cta-btn:hover { background: #009944; }
        .cta-trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .cta-trust-item {
          background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.9);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        @media (max-width: 640px) {
          .cta-section { padding: 0 20px 80px; }
          .cta-btn { padding: 12px 16px; font-size: 13px; }
        }
      `}</style>
    </section>
  )
}
