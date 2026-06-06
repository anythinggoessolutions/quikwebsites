export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="ft-footer">

      {/* ── Top divider glow ── */}
      <div className="ft-divider" />

      <div className="ft-inner">

        {/* ── Brand col ── */}
        <div className="ft-brand">
          <img src="/logo.webp" className="ft-logo" alt="QuikWebsites" />
          <p className="ft-tagline">
            This is what a website<br />should feel like.
          </p>
          <p className="ft-copy">© {year} QuikWebsites. All rights reserved.</p>
        </div>

        {/* ── Links ── */}
        <div className="ft-links">
          <div className="ft-col">
            <p className="ft-col-label">Product</p>
            <a className="ft-link" href="#">How It Works</a>
            <a className="ft-link" href="#">Live Examples</a>
            <a className="ft-link" href="#">Pricing</a>
            <a className="ft-link" href="#">FAQ</a>
          </div>
          <div className="ft-col">
            <p className="ft-col-label">Company</p>
            <a className="ft-link" href="#">About</a>
            <a className="ft-link" href="#">Blog</a>
            <a className="ft-link" href="#">Careers</a>
            <a className="ft-link" href="#">Contact</a>
          </div>
          <div className="ft-col">
            <p className="ft-col-label">Legal</p>
            <a className="ft-link" href="#">Privacy Policy</a>
            <a className="ft-link" href="#">Terms of Service</a>
            <a className="ft-link" href="#">Cookie Policy</a>
          </div>
        </div>

      </div>

      {/* ── Bottom strip ── */}
      <div className="ft-bottom">
        <p className="ft-bottom-text">
          Built with QuikWebsites — the platform that builds itself.
        </p>
        <div className="ft-socials">
          <a className="ft-social" href="#" aria-label="Twitter / X">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a className="ft-social" href="#" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a className="ft-social" href="#" aria-label="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
        </div>
      </div>

      <style>{`

        .ft-footer {
          background: #05040d;
          position: relative;
        }

        /* ── Top glow divider ── */
        .ft-divider {
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(0,198,90,0.25) 30%,
            rgba(139,92,246,0.2) 70%,
            transparent
          );
        }

        /* ── Inner grid ── */
        .ft-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 72px 40px 56px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 80px;
          align-items: start;
        }

        /* ── Brand ── */
        .ft-brand {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .ft-logo {
          height: 100px;
          width: auto;
          object-fit: contain;
          object-position: left center;
          margin: -28px -20px -28px 0;
          filter: brightness(0) invert(1);
          opacity: 0.9;
        }
        .ft-tagline {
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.32);
          line-height: 1.65;
          margin: 0 0 20px;
          font-style: italic;
        }
        .ft-copy {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          margin: 0;
        }

        /* ── Link columns ── */
        .ft-links {
          display: flex;
          gap: 64px;
        }
        .ft-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ft-col-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin: 0 0 4px;
        }
        .ft-link {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.42);
          text-decoration: none;
          transition: color 0.18s;
        }
        .ft-link:hover { color: rgba(255,255,255,0.85); }

        /* ── Bottom strip ── */
        .ft-bottom {
          max-width: 1160px;
          margin: 0 auto;
          padding: 20px 40px 32px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .ft-bottom-text {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.18);
          margin: 0;
        }
        .ft-socials {
          display: flex;
          gap: 12px;
        }
        .ft-social {
          width: 34px; height: 34px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.18s, border-color 0.18s, background 0.18s;
        }
        .ft-social:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05);
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ft-inner {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 56px 24px 40px;
          }
          .ft-links { gap: 40px; }
        }
        @media (max-width: 640px) {
          .ft-links  { flex-wrap: wrap; gap: 32px; }
          .ft-bottom { flex-direction: column; align-items: flex-start; padding: 20px 24px 28px; }
          .ft-logo   { height: 80px; margin: -20px -16px -20px 0; }
        }
      `}</style>
    </footer>
  )
}
