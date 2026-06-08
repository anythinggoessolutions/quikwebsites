import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function ContactSupport() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    /* TODO: wire to backend / email service */
    setSubmitted(true)
  }

  return (
    <div className="cs-page">
      <nav className="cs-nav">
        <Link to="/" className="cs-nav-logo">
          <img src="/logo.webp" alt="QuikWebsites" className="cs-logo-img" />
        </Link>
        <Link to="/" className="cs-back">Back to Home</Link>
      </nav>

      <div className="cs-content">
        <div className="cs-header">
          <h1>Contact Support</h1>
          <p className="cs-subtitle">
            Have a question, issue, or feedback? We'd love to hear from you.
            Our team typically responds within 24 hours.
          </p>
        </div>

        <div className="cs-grid">

          {/* ── Form ── */}
          <div className="cs-form-card">
            {submitted ? (
              <div className="cs-success">
                <div className="cs-success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00C65A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2.5 2.5L16 9" />
                  </svg>
                </div>
                <h2>Message Sent</h2>
                <p>Thanks for reaching out! We'll get back to you soon.</p>
                <button className="cs-btn-reset" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="cs-field-row">
                  <div className="cs-field">
                    <label htmlFor="cs-name">Name</label>
                    <input
                      id="cs-name"
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cs-field">
                    <label htmlFor="cs-email">Email</label>
                    <input
                      id="cs-email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="cs-field">
                  <label htmlFor="cs-subject">Subject</label>
                  <select
                    id="cs-subject"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing & Account</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="cs-field">
                  <label htmlFor="cs-message">Message</label>
                  <textarea
                    id="cs-message"
                    placeholder="Describe your question or issue..."
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="cs-submit">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* ── Info sidebar ── */}
          <div className="cs-info">
            <div className="cs-info-card">
              <div className="cs-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3>Email Us</h3>
              <a href="mailto:support@quikwebsites.com">support@quikwebsites.com</a>
            </div>

            <div className="cs-info-card">
              <div className="cs-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>Response Time</h3>
              <p>We typically respond within 24 hours during business days.</p>
            </div>

            <div className="cs-info-card">
              <div className="cs-info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>FAQ</h3>
              <p>Check our <Link to="/#faq">frequently asked questions</Link> for quick answers.</p>
            </div>
          </div>

        </div>
      </div>

      <footer className="cs-footer">
        <p>&copy; {new Date().getFullYear()} QuikWebsites. All rights reserved.</p>
        <div className="cs-footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/">Home</Link>
        </div>
      </footer>

      <style>{`
        .cs-page {
          min-height: 100vh;
          background: #fafafa;
          color: #1a1a2e;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── Nav ── */
        .cs-nav {
          max-width: 1080px;
          margin: 0 auto;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
        }
        .cs-nav-logo { text-decoration: none; }
        .cs-logo-img {
          height: 80px;
          width: auto;
          margin: -24px -12px;
        }
        .cs-back {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        .cs-back:hover { color: #0A0A0A; }

        /* ── Content ── */
        .cs-content {
          max-width: 1080px;
          margin: 0 auto;
          padding: 20px 32px 80px;
          width: 100%;
          box-sizing: border-box;
          flex: 1;
        }
        .cs-header {
          margin-bottom: 48px;
        }
        .cs-header h1 {
          font-family: 'Sora', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: #0A0A0A;
          margin: 0 0 12px;
          letter-spacing: -0.5px;
        }
        .cs-subtitle {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
          max-width: 520px;
          line-height: 1.6;
        }

        /* ── Grid ── */
        .cs-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 48px;
          align-items: start;
        }

        /* ── Form card ── */
        .cs-form-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 36px;
        }
        .cs-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .cs-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }
        .cs-field label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.2px;
        }
        .cs-field input,
        .cs-field select,
        .cs-field textarea {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: #fafafa;
          color: #1a1a2e;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          resize: vertical;
        }
        .cs-field input:focus,
        .cs-field select:focus,
        .cs-field textarea:focus {
          border-color: #00C65A;
          box-shadow: 0 0 0 3px rgba(0, 198, 90, 0.1);
        }
        .cs-field input::placeholder,
        .cs-field textarea::placeholder {
          color: #9ca3af;
        }
        .cs-field select { cursor: pointer; }

        .cs-submit {
          width: 100%;
          padding: 13px 24px;
          background: #0A0A0A;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          margin-top: 4px;
        }
        .cs-submit:hover { background: #00C65A; }
        .cs-submit:active { transform: scale(0.98); }

        /* ── Success state ── */
        .cs-success {
          text-align: center;
          padding: 40px 20px;
        }
        .cs-success-icon { margin-bottom: 20px; }
        .cs-success h2 {
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0A0A0A;
          margin: 0 0 8px;
        }
        .cs-success p {
          font-size: 15px;
          color: #6b7280;
          margin: 0 0 28px;
        }
        .cs-btn-reset {
          padding: 10px 24px;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .cs-btn-reset:hover { border-color: #0A0A0A; color: #0A0A0A; }

        /* ── Info sidebar ── */
        .cs-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cs-info-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 24px;
        }
        .cs-info-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f0fdf4;
          color: #00C65A;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }
        .cs-info-card h3 {
          font-size: 15px;
          font-weight: 700;
          color: #0A0A0A;
          margin: 0 0 6px;
        }
        .cs-info-card p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          line-height: 1.55;
        }
        .cs-info-card a {
          font-size: 14px;
          color: #00C65A;
          text-decoration: none;
          font-weight: 500;
        }
        .cs-info-card a:hover { text-decoration: underline; }

        /* ── Footer ── */
        .cs-footer {
          max-width: 1080px;
          margin: 0 auto;
          padding: 24px 32px 40px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }
        .cs-footer p {
          font-size: 13px;
          color: #9ca3af;
          margin: 0;
        }
        .cs-footer-links {
          display: flex;
          gap: 24px;
        }
        .cs-footer-links a {
          font-size: 13px;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        .cs-footer-links a:hover { color: #0A0A0A; }

        @media (max-width: 840px) {
          .cs-grid {
            grid-template-columns: 1fr;
          }
          .cs-info {
            flex-direction: row;
            flex-wrap: wrap;
          }
          .cs-info-card { flex: 1; min-width: 200px; }
        }
        @media (max-width: 640px) {
          .cs-content { padding: 16px 20px 60px; }
          .cs-header h1 { font-size: 28px; }
          .cs-nav { padding: 16px 20px; }
          .cs-form-card { padding: 24px 20px; }
          .cs-field-row { grid-template-columns: 1fr; }
          .cs-info { flex-direction: column; }
          .cs-info-card { min-width: auto; }
          .cs-footer {
            padding: 20px 20px 32px;
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
