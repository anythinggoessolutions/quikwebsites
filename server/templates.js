import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RECYCLE_AFTER_DAYS = 30;
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // once per day

export function createTemplateRoutes(supabase) {
  const router = Router();

  /**
   * GET /api/templates?category=...&page=1&limit=12
   * Browse the public template gallery.
   */
  router.get("/", async (req, res) => {
    const { category, page = 1, limit = 12 } = req.query;

    try {
      let query = supabase
        .from("templates")
        .select("id, category, preview_html, thumbnail_url, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (category) {
        query = query.eq("category", category);
      }

      const { data: templates, count } = await query;

      res.json({
        templates: templates || [],
        total: count || 0,
        page: parseInt(page),
        totalPages: Math.ceil((count || 0) / limit),
      });
    } catch (err) {
      console.error("Template list error:", err);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  /**
   * GET /api/templates/categories
   * List all available template categories.
   */
  router.get("/categories", async (req, res) => {
    try {
      const { data } = await supabase
        .from("templates")
        .select("category");

      const categories = [...new Set((data || []).map((t) => t.category))].sort();
      res.json({ categories });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  /**
   * POST /api/templates/use
   * Repopulate a template with the user's business info using Sonnet.
   * Body: { templateId, businessName, businessType, description, userId }
   */
  router.post("/use", async (req, res) => {
    const { templateId, businessName, businessType, description, userId } = req.body;
    if (!templateId || !businessName || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Get the template HTML
      const { data: template } = await supabase
        .from("templates")
        .select("html_content")
        .eq("id", templateId)
        .single();

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Use Sonnet to repopulate with user's business info
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        messages: [
          {
            role: "user",
            content: `You are repopulating a website template with new business information. Replace ALL placeholder/anonymous content with the real business details below. Keep the exact same design, layout, styles, animations, and structure — only change the text content and any business-specific details.

Business Name: ${businessName}
Business Type: ${businessType}
Description: ${description}

Return ONLY the complete updated HTML — no explanation, no markdown fences.

Template HTML:
${template.html_content}`,
          },
        ],
      });

      const newHtml = response.content[0]?.text;
      if (!newHtml) {
        return res.status(500).json({ error: "Failed to repopulate template" });
      }

      // Create site record if userId provided
      let siteId = null;
      if (userId) {
        const { data: site } = await supabase
          .from("sites")
          .insert({
            user_id: userId,
            name: businessName,
            business_type: businessType,
            description,
            html_content: newHtml,
            status: "draft",
            meta: { fromTemplate: templateId },
          })
          .select("id")
          .single();

        siteId = site?.id;
      }

      res.json({
        success: true,
        siteId,
        html: newHtml,
        usage: {
          input_tokens: response.usage?.input_tokens,
          output_tokens: response.usage?.output_tokens,
        },
      });
    } catch (err) {
      console.error("Template use error:", err);
      res.status(500).json({ error: "Failed to apply template" });
    }
  });

  return router;
}

/**
 * Starts the daily recycler that anonymizes old unconverted free-tier sites
 * and adds them to the template gallery.
 */
export function startTemplateRecycler(supabase) {
  async function recycle() {
    try {
      const cutoff = new Date(Date.now() - RECYCLE_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();

      // Find free-tier draft sites older than 30 days that haven't been recycled
      const { data: staleSites } = await supabase
        .from("sites")
        .select("id, html_content, business_type, created_at")
        .eq("status", "draft")
        .lt("created_at", cutoff)
        .is("recycled_at", null);

      if (!staleSites?.length) return;

      // Check each site's owner is still on free tier
      for (const site of staleSites) {
        const { data: siteWithUser } = await supabase
          .from("sites")
          .select("user_id")
          .eq("id", site.id)
          .single();

        if (!siteWithUser) continue;

        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", siteWithUser.user_id)
          .single();

        // Only recycle if user is still on free tier
        if (profile?.plan !== "free") continue;

        // Anonymize with Sonnet
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 16000,
          messages: [
            {
              role: "user",
              content: `Anonymize this website HTML for use as a template. Remove or replace:
- All business names, owner names, and personal names with generic placeholders like "Your Business Name"
- All phone numbers, email addresses, and physical addresses
- All specific descriptions with generic industry-appropriate placeholder text

Keep the exact same design, layout, styles, animations, images, and structure. Only change text content that identifies the original business.

Return ONLY the anonymized HTML — no explanation, no markdown fences.

HTML:
${site.html_content}`,
            },
          ],
        });

        const anonymizedHtml = response.content[0]?.text;
        if (!anonymizedHtml) continue;

        // Add to templates table
        await supabase.from("templates").insert({
          source_site_id: site.id,
          category: site.business_type || "general",
          html_content: anonymizedHtml,
        });

        // Mark site as recycled
        await supabase
          .from("sites")
          .update({ recycled_at: new Date().toISOString() })
          .eq("id", site.id);

        console.log(`Recycled site ${site.id} into template gallery (${site.business_type})`);
      }
    } catch (err) {
      console.error("Template recycler error:", err);
    }
  }

  // Run once on startup, then daily
  recycle();
  setInterval(recycle, CHECK_INTERVAL);
  console.log(`Template recycler: running daily (${RECYCLE_AFTER_DAYS}-day threshold)`);
}
