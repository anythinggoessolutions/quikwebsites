import Anthropic from "@anthropic-ai/sdk";
import express, { Router } from "express";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export function createEditorRoutes(supabase) {
  const router = Router();

  /**
   * POST /api/editor/edit
   * Apply an edit to a site section using Claude Sonnet (cheaper than Opus).
   * Saves the previous version before applying.
   *
   * Body: { siteId, userId, instruction, sectionId? }
   *   instruction: natural language edit like "change the hero headline to Welcome Home"
   *   sectionId: optional CSS selector or section identifier to scope the edit
   */
  router.post("/edit", async (req, res) => {
    const { siteId, userId, instruction, sectionId } = req.body;
    if (!siteId || !userId || !instruction) {
      return res.status(400).json({ error: "Missing siteId, userId, or instruction" });
    }

    try {
      // Check credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, monthly_credits, purchased_credits")
        .eq("id", userId)
        .single();

      if (!profile || (profile.monthly_credits + profile.purchased_credits) < 1) {
        return res.status(403).json({ error: "Insufficient credits" });
      }

      // Get current site HTML
      const { data: site } = await supabase
        .from("sites")
        .select("html_content, name")
        .eq("id", siteId)
        .eq("user_id", userId)
        .single();

      if (!site || !site.html_content) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Save current version before editing
      await supabase.from("site_versions").insert({
        site_id: siteId,
        html_content: site.html_content,
      });

      // Build the edit prompt
      const editPrompt = sectionId
        ? `Edit the section matching "${sectionId}" in this HTML. Instruction: ${instruction}`
        : `Edit this HTML website. Instruction: ${instruction}`;

      // Use Sonnet for edits (cheaper, fast)
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        messages: [
          {
            role: "user",
            content: `You are editing an existing website. Return ONLY the complete updated HTML — no explanation, no markdown fences, no commentary. Preserve all existing styles, scripts, animations, and structure unless the edit specifically changes them.\n\n${editPrompt}\n\nCurrent HTML:\n${site.html_content}`,
          },
        ],
      });

      const newHtml = response.content[0]?.text;
      if (!newHtml) {
        return res.status(500).json({ error: "No response from AI" });
      }

      // Update the site
      await supabase
        .from("sites")
        .update({ html_content: newHtml })
        .eq("id", siteId);

      // Deduct credit
      await supabase.rpc("deduct_credits", {
        p_user_id: userId,
        p_amount: 1,
        p_type: "edit",
        p_site_id: siteId,
        p_description: `Edit: ${instruction.slice(0, 100)}`,
      });

      res.json({
        success: true,
        html: newHtml,
        usage: {
          input_tokens: response.usage?.input_tokens,
          output_tokens: response.usage?.output_tokens,
        },
      });
    } catch (err) {
      console.error("Edit error:", err);
      res.status(500).json({ error: "Edit failed" });
    }
  });

  /**
   * POST /api/editor/regenerate-section
   * Regenerate a specific section from scratch.
   * Body: { siteId, userId, sectionId, description? }
   */
  router.post("/regenerate-section", async (req, res) => {
    const { siteId, userId, sectionId, description } = req.body;
    if (!siteId || !userId || !sectionId) {
      return res.status(400).json({ error: "Missing siteId, userId, or sectionId" });
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("monthly_credits, purchased_credits")
        .eq("id", userId)
        .single();

      if (!profile || (profile.monthly_credits + profile.purchased_credits) < 1) {
        return res.status(403).json({ error: "Insufficient credits" });
      }

      const { data: site } = await supabase
        .from("sites")
        .select("html_content, name, business_type, description")
        .eq("id", siteId)
        .eq("user_id", userId)
        .single();

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Save version
      await supabase.from("site_versions").insert({
        site_id: siteId,
        html_content: site.html_content,
      });

      const prompt = `You are regenerating the "${sectionId}" section of a website for "${site.name}" (${site.business_type}). ${description ? `Additional context: ${description}` : ""}

Return ONLY the complete updated HTML with the "${sectionId}" section completely redesigned. Keep all other sections, styles, scripts, and animations identical. Make the new section look premium and professional.

Current HTML:
${site.html_content}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      });

      const newHtml = response.content[0]?.text;
      if (!newHtml) {
        return res.status(500).json({ error: "No response from AI" });
      }

      await supabase
        .from("sites")
        .update({ html_content: newHtml })
        .eq("id", siteId);

      await supabase.rpc("deduct_credits", {
        p_user_id: userId,
        p_amount: 1,
        p_type: "regenerate",
        p_site_id: siteId,
        p_description: `Regenerated section: ${sectionId}`,
      });

      res.json({ success: true, html: newHtml });
    } catch (err) {
      console.error("Regenerate error:", err);
      res.status(500).json({ error: "Regeneration failed" });
    }
  });

  /**
   * POST /api/editor/swap-image
   * Replace an image in the site HTML. Free if using Pexels/upload, 1 credit if AI-generated.
   * Body: { siteId, userId, imageSelector, newImageUrl, source }
   *   source: "pexels" | "upload" | "ai"
   */
  router.post("/swap-image", async (req, res) => {
    const { siteId, userId, imageSelector, newImageUrl, source } = req.body;
    if (!siteId || !userId || !imageSelector || !newImageUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const { data: site } = await supabase
        .from("sites")
        .select("html_content")
        .eq("id", siteId)
        .eq("user_id", userId)
        .single();

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Save version
      await supabase.from("site_versions").insert({
        site_id: siteId,
        html_content: site.html_content,
      });

      // Replace the image URL in HTML
      const newHtml = site.html_content.replace(
        new RegExp(`(${escapeRegex(imageSelector)})`, "g"),
        newImageUrl
      );

      await supabase
        .from("sites")
        .update({ html_content: newHtml })
        .eq("id", siteId);

      // Only charge credit for AI-generated images
      if (source === "ai") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("monthly_credits, purchased_credits")
          .eq("id", userId)
          .single();

        if (!profile || (profile.monthly_credits + profile.purchased_credits) < 1) {
          return res.status(403).json({ error: "Insufficient credits for AI image" });
        }

        await supabase.rpc("deduct_credits", {
          p_user_id: userId,
          p_amount: 1,
          p_type: "image",
          p_site_id: siteId,
          p_description: "Swapped image (AI generated)",
        });
      }

      res.json({ success: true, html: newHtml });
    } catch (err) {
      console.error("Image swap error:", err);
      res.status(500).json({ error: "Image swap failed" });
    }
  });

  /**
   * POST /api/editor/upload-image?siteId=...&userId=...
   * Upload a user photo to Supabase Storage. Body is the raw image bytes.
   * Returns { url } — pair with /swap-image (source: "upload") to use it.
   */
  const IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  router.post(
    "/upload-image",
    express.raw({ type: Object.keys(IMAGE_TYPES), limit: "8mb" }),
    async (req, res) => {
      const { siteId, userId } = req.query;
      if (!siteId || !userId) {
        return res.status(400).json({ error: "Missing siteId or userId" });
      }

      const contentType = req.headers["content-type"];
      const ext = IMAGE_TYPES[contentType];
      if (!ext || !req.body?.length) {
        return res.status(400).json({ error: "Send raw JPEG, PNG, WebP, or GIF image data" });
      }

      try {
        // Verify ownership
        const { data: site } = await supabase
          .from("sites")
          .select("id")
          .eq("id", siteId)
          .eq("user_id", userId)
          .single();

        if (!site) {
          return res.status(404).json({ error: "Site not found" });
        }

        // Ensure the public bucket exists (idempotent — ignore "already exists")
        const { error: bucketError } = await supabase.storage.createBucket("site-images", {
          public: true,
          fileSizeLimit: 8 * 1024 * 1024,
        });
        if (bucketError && !bucketError.message.includes("already exists")) {
          console.warn("Bucket creation warning:", bucketError.message);
        }

        const path = `sites/${siteId}/uploads/upload-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("site-images")
          .upload(path, req.body, { contentType, upsert: true });

        if (error) {
          throw new Error(error.message);
        }

        const { data: urlData } = supabase.storage
          .from("site-images")
          .getPublicUrl(path);

        res.json({ url: urlData.publicUrl });
      } catch (err) {
        console.error("Image upload error:", err);
        res.status(500).json({ error: "Upload failed" });
      }
    }
  );

  /**
   * GET /api/editor/versions?siteId=...&userId=...&limit=20
   * Get version history for a site.
   */
  router.get("/versions", async (req, res) => {
    const { siteId, userId, limit = 20 } = req.query;
    if (!siteId || !userId) {
      return res.status(400).json({ error: "Missing siteId or userId" });
    }

    // Verify ownership
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", userId)
      .single();

    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }

    const { data: versions } = await supabase
      .from("site_versions")
      .select("id, created_at")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));

    res.json({ versions: versions || [] });
  });

  /**
   * POST /api/editor/rollback
   * Restore a previous version. Free — no credit cost.
   * Body: { siteId, userId, versionId }
   */
  router.post("/rollback", async (req, res) => {
    const { siteId, userId, versionId } = req.body;
    if (!siteId || !userId || !versionId) {
      return res.status(400).json({ error: "Missing siteId, userId, or versionId" });
    }

    try {
      // Verify ownership
      const { data: site } = await supabase
        .from("sites")
        .select("html_content")
        .eq("id", siteId)
        .eq("user_id", userId)
        .single();

      if (!site) {
        return res.status(404).json({ error: "Site not found" });
      }

      // Get the version
      const { data: version } = await supabase
        .from("site_versions")
        .select("html_content")
        .eq("id", versionId)
        .eq("site_id", siteId)
        .single();

      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }

      // Save current as a version before rolling back
      await supabase.from("site_versions").insert({
        site_id: siteId,
        html_content: site.html_content,
      });

      // Restore
      await supabase
        .from("sites")
        .update({ html_content: version.html_content })
        .eq("id", siteId);

      res.json({ success: true, html: version.html_content });
    } catch (err) {
      console.error("Rollback error:", err);
      res.status(500).json({ error: "Rollback failed" });
    }
  });

  return router;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
