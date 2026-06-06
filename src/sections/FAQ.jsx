import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const FAQS = [
  {
    q: 'How long does it take to get my website?',
    a: 'Most websites are ready in under 10 minutes. You give us your business name and a short description — our AI handles the rest. Logo, copy, layout, and design all generated automatically. You review, tweak, and go live.',
  },
  {
    q: 'Do I need any technical knowledge?',
    a: 'None. If you can describe what your business does, you can use QuikWebsites. No code, no plugins, no domain configuration headaches. We handle all of it.',
  },
  {
    q: 'What exactly is included?',
    a: 'Everything. AI-generated copy and design, a custom logo, cinematic scroll animations, hosting, SSL certificate, mobile optimization, and your custom domain. It\'s a complete web presence — not a starter pack.',
  },
  {
    q: 'Can I use my own domain name?',
    a: 'Yes. You can connect any domain you already own, or we\'ll help you set one up. Either way, your website goes live at your address — not ours.',
  },
  {
    q: 'Who owns the website?',
    a: 'You do. Entirely. Your content, your design, your domain. QuikWebsites builds it and hosts it — but everything created for your business belongs to you.',
  },
  {
    q: 'Can I make changes after it\'s built?',
    a: 'Yes. Every QuikWebsites site comes with a built-in editor — just log in and make changes directly on your website. Update text, swap images, add sections. No code, no support tickets, no waiting.',
  },
  {
    q: 'What kinds of businesses do you work with?',
    a: 'Restaurants, law firms, gyms, medical clinics, real estate agents, photographers, coaches, e-commerce brands, SaaS companies — if you need a professional web presence, QuikWebsites can build it.',
  },
]

export default function FAQ() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [open, setOpen] = useState(null)

  return (
    <section ref={ref} className="faq-section">

      {/* ── Header ── */}
      <motion.div
        className="faq-header"
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="faq-eyebrow">
          <span className="faq-eyebrow-dot" />
          FAQ
        </p>
        <h2 className="faq-title">
          Questions answered.<br />
          <span className="faq-title-dim">Doubts destroyed.</span>
        </h2>
      </motion.div>

      {/* ── Accordion ── */}
      <div className="faq-list">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <motion.div
              key={i}
              className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                className="faq-question"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="faq-q-text">{item.q}</span>
                <span className={`faq-icon ${isOpen ? 'faq-icon-open' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className="faq-answer-wrap"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="faq-answer">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <style>{`

        .faq-section {
          background: #07050f;
          padding: 120px 32px 130px;
          position: relative;
        }
        .faq-section::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 1px;
          height: 80px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent);
        }

        /* ── Header ── */
        .faq-header {
          text-align: center;
          margin-bottom: 72px;
        }
        .faq-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.38);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: 26px;
        }
        .faq-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00C65A;
          flex-shrink: 0;
        }
        .faq-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(30px, 4.5vw, 56px);
          font-weight: 800;
          color: #fff;
          line-height: 1.12;
          letter-spacing: -1.5px;
          margin: 0;
        }
        .faq-title-dim { color: rgba(255,255,255,0.28); }

        /* ── List ── */
        .faq-list {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Item ── */
        .faq-item {
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: border-color 0.25s;
        }
        .faq-item:first-child { border-top: 1px solid rgba(255,255,255,0.07); }
        .faq-item-open {
          border-bottom-color: rgba(0,198,90,0.22);
        }

        /* ── Question button ── */
        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 24px 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .faq-q-text {
          font-family: 'Sora', sans-serif;
          font-size: clamp(15px, 1.6vw, 18px);
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          line-height: 1.4;
          transition: color 0.2s;
        }
        .faq-item-open .faq-q-text { color: #fff; }

        .faq-icon {
          flex-shrink: 0;
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.4);
          transition: transform 0.35s ease, border-color 0.25s, color 0.25s, background 0.25s;
        }
        .faq-icon-open {
          transform: rotate(180deg);
          border-color: rgba(0,198,90,0.35);
          color: #00C65A;
          background: rgba(0,198,90,0.07);
        }

        /* ── Answer ── */
        .faq-answer-wrap { overflow: hidden; }
        .faq-answer {
          font-family: 'Inter', sans-serif;
          font-size: clamp(13px, 1.3vw, 15px);
          color: rgba(255,255,255,0.52);
          line-height: 1.78;
          padding: 0 48px 24px 0;
          margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .faq-section  { padding: 80px 20px 100px; }
          .faq-header   { margin-bottom: 48px; }
          .faq-title    { letter-spacing: -1px; }
          .faq-question { padding: 20px 0; }
          .faq-answer   { padding-right: 16px; padding-bottom: 20px; }
        }
      `}</style>
    </section>
  )
}
