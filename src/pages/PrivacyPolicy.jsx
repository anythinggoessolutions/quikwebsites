import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <Link to="/" className="legal-nav-logo">
          <img src="/logo.webp" alt="QuikWebsites" className="legal-logo-img" />
        </Link>
        <Link to="/" className="legal-back">Back to Home</Link>
      </nav>

      <article className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: June 8, 2026</p>

        <p>
          QuikWebsites ("we," "our," or "us") respects your privacy and is
          committed to protecting the personal information you share with us.
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you visit our website
          <strong> quikwebsites.com</strong> or use our services.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>Information You Provide</h3>
        <ul>
          <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password.</li>
          <li><strong>Business Information:</strong> When you use our website builder, we collect the business name, description, and other details you provide to generate your website.</li>
          <li><strong>Payment Information:</strong> When you subscribe to a paid plan, payment is processed by our third-party payment processor. We do not store your full credit card number.</li>
          <li><strong>Communications:</strong> If you contact us for support or feedback, we collect the content of those communications.</li>
        </ul>

        <h3>Information Collected Automatically</h3>
        <ul>
          <li><strong>Usage Data:</strong> We collect information about how you interact with our services, including pages visited, features used, and actions taken.</li>
          <li><strong>Device Information:</strong> We collect device type, operating system, browser type, screen resolution, and unique device identifiers.</li>
          <li><strong>Log Data:</strong> Our servers automatically record information including your IP address, access times, and referring URLs.</li>
          <li><strong>Cookies & Similar Technologies:</strong> We use cookies, pixels, and similar technologies to enhance your experience and gather analytics. See Section 6 for details.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Generate and host your website based on the details you provide</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices, updates, and support messages</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze trends, usage, and activity</li>
          <li>Detect, investigate, and prevent fraud and other illegal activities</li>
          <li>Personalize and improve your experience</li>
        </ul>

        <h2>3. How We Share Your Information</h2>
        <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
        <ul>
          <li><strong>Service Providers:</strong> We share information with third-party vendors who perform services on our behalf, such as hosting, analytics, payment processing, and customer support.</li>
          <li><strong>Legal Requirements:</strong> We may disclose information if required by law, regulation, legal process, or governmental request.</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
          <li><strong>With Your Consent:</strong> We may share information with your consent or at your direction.</li>
        </ul>

        <h2>4. Data Retention</h2>
        <p>
          We retain your personal information for as long as your account is
          active or as needed to provide you services. We may also retain and
          use your information to comply with legal obligations, resolve
          disputes, and enforce our agreements. If you delete your account, we
          will delete or anonymize your personal information within 90 days,
          except where retention is required by law.
        </p>

        <h2>5. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your
          personal information, including encryption in transit (TLS/SSL) and
          at rest. However, no method of transmission over the internet or
          electronic storage is 100% secure, and we cannot guarantee absolute
          security.
        </p>

        <h2>6. Cookies & Tracking Technologies</h2>
        <p>We use the following types of cookies:</p>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for the operation of our website. They include session cookies and security tokens.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
          <li><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization, such as remembering your preferences.</li>
        </ul>
        <p>
          You can manage your cookie preferences through your browser settings.
          Disabling certain cookies may affect the functionality of our services.
        </p>

        <h2>7. Your Rights</h2>
        <p>Depending on your location, you may have the following rights:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
          <li><strong>Deletion:</strong> Request deletion of your personal information.</li>
          <li><strong>Portability:</strong> Request a copy of your data in a portable format.</li>
          <li><strong>Opt-Out:</strong> Opt out of marketing communications at any time.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{' '}
          <a href="mailto:privacy@quikwebsites.com">privacy@quikwebsites.com</a>.
        </p>

        <h2>8. Children's Privacy</h2>
        <p>
          Our services are not directed to individuals under 16 years of age.
          We do not knowingly collect personal information from children. If
          you believe we have collected information from a child, please
          contact us and we will promptly delete it.
        </p>

        <h2>9. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries
          other than your country of residence. These countries may have
          different data protection laws. We take appropriate safeguards to
          ensure your information remains protected in accordance with this
          Privacy Policy.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of material changes by posting the new policy on this page and
          updating the "Last updated" date. Your continued use of our services
          after changes are posted constitutes acceptance of the revised policy.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have questions or concerns about this Privacy Policy, please
          contact us:
        </p>
        <ul>
          <li>Email: <a href="mailto:privacy@quikwebsites.com">privacy@quikwebsites.com</a></li>
          <li>Website: <a href="https://quikwebsites.com">quikwebsites.com</a></li>
        </ul>
      </article>

      <footer className="legal-footer">
        <p>&copy; {new Date().getFullYear()} QuikWebsites. All rights reserved.</p>
        <div className="legal-footer-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/">Home</Link>
        </div>
      </footer>

      <style>{`
        .legal-page {
          min-height: 100vh;
          background: #fafafa;
          color: #1a1a2e;
          font-family: 'Inter', sans-serif;
        }

        /* ── Nav ── */
        .legal-nav {
          max-width: 880px;
          margin: 0 auto;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .legal-nav-logo { text-decoration: none; }
        .legal-logo-img {
          height: 80px;
          width: auto;
          margin: -24px -12px;
        }
        .legal-back {
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        .legal-back:hover { color: #0A0A0A; }

        /* ── Content ── */
        .legal-content {
          max-width: 720px;
          margin: 0 auto;
          padding: 20px 32px 80px;
          line-height: 1.75;
        }
        .legal-content h1 {
          font-family: 'Sora', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: #0A0A0A;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }
        .legal-updated {
          font-size: 14px;
          color: #9ca3af;
          margin: 0 0 40px;
        }
        .legal-content h2 {
          font-family: 'Sora', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0A0A0A;
          margin: 48px 0 16px;
          letter-spacing: -0.3px;
        }
        .legal-content h3 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin: 24px 0 12px;
        }
        .legal-content p {
          font-size: 15px;
          color: #4b5563;
          margin: 0 0 16px;
        }
        .legal-content ul {
          margin: 0 0 16px;
          padding-left: 24px;
        }
        .legal-content li {
          font-size: 15px;
          color: #4b5563;
          margin-bottom: 8px;
          line-height: 1.7;
        }
        .legal-content a {
          color: #00C65A;
          text-decoration: none;
          font-weight: 500;
        }
        .legal-content a:hover { text-decoration: underline; }

        /* ── Footer ── */
        .legal-footer {
          max-width: 720px;
          margin: 0 auto;
          padding: 24px 32px 40px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .legal-footer p {
          font-size: 13px;
          color: #9ca3af;
          margin: 0;
        }
        .legal-footer-links {
          display: flex;
          gap: 24px;
        }
        .legal-footer-links a {
          font-size: 13px;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        .legal-footer-links a:hover { color: #0A0A0A; }

        @media (max-width: 640px) {
          .legal-content { padding: 16px 20px 60px; }
          .legal-content h1 { font-size: 28px; }
          .legal-nav { padding: 16px 20px; }
          .legal-footer {
            padding: 20px 20px 32px;
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
