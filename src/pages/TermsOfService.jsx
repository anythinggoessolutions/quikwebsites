import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function TermsOfService() {
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
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: June 8, 2026</p>

        <p>
          Welcome to QuikWebsites. These Terms of Service ("Terms") govern your
          access to and use of the QuikWebsites website, platform, and services
          (collectively, the "Services") operated by QuikWebsites ("we," "our,"
          or "us"). By accessing or using our Services, you agree to be bound
          by these Terms. If you do not agree, do not use our Services.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 16 years old to use our Services. By using
          QuikWebsites, you represent and warrant that you meet this age
          requirement and have the legal capacity to enter into these Terms. If
          you are using the Services on behalf of a business or organization,
          you represent that you have the authority to bind that entity to these
          Terms.
        </p>

        <h2>2. Account Registration</h2>
        <p>
          To access certain features, you must create an account. You agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information during registration</li>
          <li>Maintain the security of your password and account</li>
          <li>Promptly update your information if it changes</li>
          <li>Accept responsibility for all activity that occurs under your account</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate your account if any
          information provided is inaccurate, misleading, or violates these Terms.
        </p>

        <h2>3. Services Description</h2>
        <p>
          QuikWebsites provides an AI-powered platform that generates
          cinematic, story-driven websites for businesses. Our Services include:
        </p>
        <ul>
          <li>AI-generated website design, copy, and branding</li>
          <li>Website hosting and SSL certification</li>
          <li>Custom domain connection</li>
          <li>Website editing and customization tools</li>
        </ul>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of
          the Services at any time with reasonable notice.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to use our Services to:</p>
        <ul>
          <li>Violate any applicable law, regulation, or third-party rights</li>
          <li>Create websites that contain illegal, harmful, threatening, abusive, defamatory, or obscene content</li>
          <li>Distribute malware, viruses, or other harmful software</li>
          <li>Engage in phishing, fraud, or deceptive practices</li>
          <li>Infringe upon intellectual property rights of others</li>
          <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
          <li>Use the Services to send unsolicited marketing or spam</li>
          <li>Interfere with or disrupt the integrity or performance of the Services</li>
        </ul>
        <p>
          We reserve the right to remove any content or suspend any account
          that violates these terms, at our sole discretion.
        </p>

        <h2>5. Intellectual Property</h2>

        <h3>Our Property</h3>
        <p>
          The QuikWebsites platform, including its design, code, AI models,
          templates, logos, and all associated intellectual property, is owned
          by QuikWebsites and protected by copyright, trademark, and other
          intellectual property laws. You may not copy, modify, distribute, or
          create derivative works of our platform without our written consent.
        </p>

        <h3>Your Content</h3>
        <p>
          You retain ownership of the content you provide to create your
          website (business name, descriptions, images you upload, etc.). By
          using our Services, you grant us a limited, non-exclusive license to
          use this content solely to provide and improve the Services.
        </p>

        <h3>Generated Websites</h3>
        <p>
          Websites generated through our platform are licensed to you for your
          use. You may use, display, and publish your generated website for
          your business purposes. The underlying templates, AI-generated
          design patterns, and platform technology remain our property.
        </p>

        <h2>6. Payment & Subscriptions</h2>
        <ul>
          <li><strong>Free Tier:</strong> We may offer a free tier with limited features. We reserve the right to modify or discontinue the free tier at any time.</li>
          <li><strong>Paid Plans:</strong> Paid subscriptions are billed on a recurring basis (monthly or annually) as selected at the time of purchase.</li>
          <li><strong>Billing:</strong> You authorize us to charge your payment method for all fees associated with your selected plan. All fees are in U.S. dollars unless otherwise stated.</li>
          <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial billing periods.</li>
          <li><strong>Price Changes:</strong> We may change our pricing with at least 30 days' written notice. Continued use after a price change constitutes acceptance.</li>
        </ul>

        <h2>7. Website Hosting</h2>
        <p>
          We provide hosting for websites created through our platform as part
          of an active subscription. We aim for 99.9% uptime but do not
          guarantee uninterrupted service. If your subscription ends or is
          terminated, your website may be taken offline after a 30-day grace
          period. We recommend exporting your content before cancellation.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, QuikWebsites and its
          officers, directors, employees, and agents shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages,
          including but not limited to loss of profits, data, business
          opportunities, or goodwill, arising out of or related to your use of
          the Services.
        </p>
        <p>
          Our total liability for any claims arising under these Terms shall
          not exceed the amount you paid us in the 12 months preceding the
          claim.
        </p>

        <h2>9. Disclaimer of Warranties</h2>
        <p>
          The Services are provided "as is" and "as available" without
          warranties of any kind, whether express or implied, including but not
          limited to implied warranties of merchantability, fitness for a
          particular purpose, and non-infringement. We do not warrant that the
          Services will be uninterrupted, error-free, or secure.
        </p>

        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless QuikWebsites and its
          affiliates from any claims, damages, losses, liabilities, and expenses
          (including reasonable attorneys' fees) arising from your use of the
          Services, your content, or your violation of these Terms.
        </p>

        <h2>11. Termination</h2>
        <p>
          We may suspend or terminate your access to the Services at any time,
          with or without cause, and with or without notice. Upon termination,
          your right to use the Services ceases immediately. Sections that by
          their nature should survive termination (including intellectual
          property, limitation of liability, and indemnification) will survive.
        </p>

        <h2>12. Dispute Resolution</h2>
        <p>
          Any disputes arising from these Terms or your use of the Services
          shall be resolved through binding arbitration in accordance with the
          rules of the American Arbitration Association. The arbitration shall
          take place in the state where QuikWebsites is headquartered. You
          agree to waive any right to participate in a class action lawsuit or
          class-wide arbitration.
        </p>

        <h2>13. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of the United States, without regard to conflict of law
          principles.
        </p>

        <h2>14. Changes to These Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will
          notify you of material changes by posting the updated Terms on our
          website and updating the "Last updated" date. Your continued use of
          the Services after changes are posted constitutes acceptance of the
          revised Terms.
        </p>

        <h2>15. Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us:
        </p>
        <ul>
          <li>Email: <a href="mailto:legal@quikwebsites.com">legal@quikwebsites.com</a></li>
          <li>Website: <a href="https://quikwebsites.com">quikwebsites.com</a></li>
        </ul>
      </article>

      <footer className="legal-footer">
        <p>&copy; {new Date().getFullYear()} QuikWebsites. All rights reserved.</p>
        <div className="legal-footer-links">
          <Link to="/privacy">Privacy Policy</Link>
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
