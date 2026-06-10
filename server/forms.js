import { Resend } from "resend";
import { Router } from "express";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "QuikWebsites <onboarding@resend.dev>";

// Rate limiting: max 5 submissions per IP per 15 minutes
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Clean up stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, 30 * 60 * 1000);

export function createFormRoutes(supabase) {
  const router = Router();

  /**
   * POST /api/forms/:siteId
   * Handles contact form submissions from client sites.
   *
   * Body: { name, email, phone?, message, _honeypot? }
   */
  router.post("/:siteId", async (req, res) => {
    const { siteId } = req.params;
    const { name, email, message, phone, _honeypot } = req.body;

    // Honeypot check — bots fill hidden fields
    if (_honeypot) {
      return res.json({ success: true });
    }

    // Rate limit
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: "Too many submissions. Try again later." });
    }

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    try {
      // Look up the site and owner
      const { data: site } = await supabase
        .from("sites")
        .select("name, user_id")
        .eq("id", siteId)
        .single();

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Get the site owner's email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", site.user_id)
        .single();

      if (!profile?.email) {
        return res.status(500).json({ error: "Could not find site owner" });
      }

      // Send email via Resend
      await resend.emails.send({
        from: FROM_EMAIL,
        to: profile.email,
        subject: `New message from your website — ${site.name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <h2 style="font-size: 20px; color: #111; margin-bottom: 4px;">New Contact Form Submission</h2>
            <p style="font-size: 14px; color: #666; margin-top: 0;">From your website: <strong>${site.name}</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px; width: 80px; vertical-align: top;">Name</td>
                <td style="padding: 8px 0; font-size: 15px; color: #111;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px; vertical-align: top;">Email</td>
                <td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${escapeHtml(email)}" style="color: #2563eb;">${escapeHtml(email)}</a></td>
              </tr>
              ${phone ? `<tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px; vertical-align: top;">Phone</td>
                <td style="padding: 8px 0; font-size: 15px; color: #111;">${escapeHtml(phone)}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 13px; vertical-align: top;">Message</td>
                <td style="padding: 8px 0; font-size: 15px; color: #111; white-space: pre-wrap;">${escapeHtml(message)}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #aaa;">Sent via QuikWebsites contact form</p>
          </div>
        `,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Form submission error:", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  return router;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
