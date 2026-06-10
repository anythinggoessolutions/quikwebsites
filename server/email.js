import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "QuikWebsites <onboarding@resend.dev>";

/**
 * Send a welcome email when a user signs up.
 */
export async function sendWelcomeEmail(email, name) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to QuikWebsites!",
    html: wrap(`
      <h2 style="font-size: 22px; color: #111; margin-bottom: 8px;">Welcome to QuikWebsites${name ? `, ${esc(name)}` : ""}!</h2>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        You're all set. Generate your first website by entering your business name and description — our AI handles the rest.
      </p>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        Your first site is free to preview. When you're ready to go live, pick a plan and publish in one click.
      </p>
      <a href="https://quikwebsites.com/dashboard" style="display: inline-block; margin-top: 16px; padding: 12px 28px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">Go to Dashboard</a>
    `),
  });
}

/**
 * Send a "your site is live" email after publishing.
 */
export async function sendSiteLiveEmail(email, siteName, siteUrl) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your site is live — ${siteName}`,
    html: wrap(`
      <h2 style="font-size: 22px; color: #111; margin-bottom: 8px;">Your site is live!</h2>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        <strong>${esc(siteName)}</strong> is now published and accessible to anyone on the web.
      </p>
      <a href="${esc(siteUrl)}" style="display: inline-block; margin-top: 12px; padding: 12px 28px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">View Your Site</a>
      <p style="font-size: 14px; color: #888; margin-top: 20px;">
        Want to make changes? Head to your <a href="https://quikwebsites.com/dashboard" style="color: #2563eb;">dashboard</a> to edit copy, swap images, or connect a custom domain.
      </p>
    `),
  });
}

/**
 * Send a payment receipt after a successful charge.
 */
export async function sendPaymentReceiptEmail(email, amount, description, date) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Payment receipt — QuikWebsites",
    html: wrap(`
      <h2 style="font-size: 22px; color: #111; margin-bottom: 8px;">Payment Receipt</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <tr>
          <td style="padding: 10px 0; color: #888; font-size: 13px; width: 100px;">Date</td>
          <td style="padding: 10px 0; font-size: 15px; color: #111;">${esc(date)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #888; font-size: 13px;">Description</td>
          <td style="padding: 10px 0; font-size: 15px; color: #111;">${esc(description)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #888; font-size: 13px;">Amount</td>
          <td style="padding: 10px 0; font-size: 15px; color: #111; font-weight: 600;">${esc(amount)}</td>
        </tr>
      </table>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 13px; color: #888;">
        Manage your subscription in your <a href="https://quikwebsites.com/dashboard" style="color: #2563eb;">dashboard</a>.
      </p>
    `),
  });
}

/**
 * Send a "payment failed" warning email.
 */
export async function sendPaymentFailedEmail(email, graceDays) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Action needed — payment failed",
    html: wrap(`
      <h2 style="font-size: 22px; color: #111; margin-bottom: 8px;">Payment Failed</h2>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        We couldn't process your latest payment. Your site will stay live for ${graceDays} more days while we retry.
      </p>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        Please update your payment method to avoid any interruption.
      </p>
      <a href="https://quikwebsites.com/dashboard" style="display: inline-block; margin-top: 12px; padding: 12px 28px; background: #dc2626; color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">Update Payment Method</a>
    `),
  });
}

/**
 * Send a "site unpublished" email after grace period expires.
 */
export async function sendSiteUnpublishedEmail(email, siteName) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your site has been taken offline — ${siteName}`,
    html: wrap(`
      <h2 style="font-size: 22px; color: #111; margin-bottom: 8px;">Your site is offline</h2>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        Because your payment couldn't be processed, <strong>${esc(siteName)}</strong> has been taken offline.
      </p>
      <p style="font-size: 15px; color: #444; line-height: 1.6;">
        Your site is still here — all your content and design are saved. Update your payment method and it'll be back online instantly.
      </p>
      <a href="https://quikwebsites.com/dashboard" style="display: inline-block; margin-top: 12px; padding: 12px 28px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">Reactivate My Site</a>
    `),
  });
}

// ─── Helpers ───

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(body) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      ${body}
      <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0 16px;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">QuikWebsites · AI-powered websites for your business</p>
    </div>
  `;
}
