import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="footer">
      {/* Wave top */}
      <div className="footer-wave">
        <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#00C65A"/>
        </svg>
      </div>

      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#00C65A"/>
                <path d="M7 14L11.5 18.5L21 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="footer-logo-text">QuikWebsites</span>
            </div>
            <p className="footer-tagline">
              The AI-powered 3D website builder for every business.
              Build smarter. Launch faster. Grow bigger.
            </p>
            <div className="footer-social">
              {['𝕏', 'in', 'f', '▶'].map((icon, i) => (
                <motion.div
                  key={i}
                  className="social-btn"
                  whileHover={{ scale: 1.1, background: '#00C65A' }}
                  transition={{ duration: 0.15 }}
                >
                  {icon}
                </motion.div>
              ))}
            </div>
          </div>
          <div className="footer-links">
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Templates', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Partners'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Privacy', 'Terms'] },
            ].map((col) => (
              <div key={col.title} className="footer-col">
                <h4>{col.title}</h4>
                {col.links.map((link) => (
                  <a key={link} href="#">{link}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} QuikWebsites. All rights reserved.</span>
          <span className="footer-made">Made with 💚 and AI</span>
        </div>
      </div>

      <style>{`
        .footer {
          background: #0A0A0A;
          padding: 0 24px 48px;
        }
        .footer-wave {
          width: 100%;
          height: 60px;
          overflow: hidden;
          line-height: 0;
        }
        .footer-wave svg { width: 100%; height: 100%; }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding-top: 48px;
        }
        .footer-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 48px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .footer-logo-text {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .footer-tagline {
          color: #4B5563;
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 24px;
        }
        .footer-social {
          display: flex;
          gap: 10px;
        }
        .social-btn {
          width: 36px; height: 36px;
          background: #1F1F1F;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6B7280;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .social-btn:hover { color: #fff; }
        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-col h4 {
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          margin-bottom: 4px;
        }
        .footer-col a {
          color: #4B5563;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-col a:hover { color: #00C65A; }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 28px;
          border-top: 1px solid #1F1F1F;
          font-size: 12px;
          color: #374151;
        }
        .footer-made { color: #4B5563; }
        @media (max-width: 768px) {
          .footer-top { grid-template-columns: 1fr; gap: 40px; }
          .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
        }
        @media (max-width: 480px) {
          .footer-links { grid-template-columns: repeat(2, 1fr); }
          .footer { padding: 0 20px 40px; }
        }
      `}</style>
    </footer>
  )
}
