import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { generateSite, replaceImageSlots, extractColorPalette } from "./generate.js";
import { generateAndStoreImages } from "./images.js";
import { createStripeRoutes, createWebhookHandler } from "./stripe.js";
import { createProject, deploySite, unpublishSite, isSlugAvailable, generateSlug } from "./deploy.js";
import { createFormRoutes } from "./forms.js";
import { createImageGalleryRoutes } from "./images-gallery.js";
import { createDomainRoutes } from "./domains.js";
import { createVideoRoutes } from "./video.js";
import { startGracePeriodChecker } from "./dunning.js";
import { startCreditResetChecker } from "./credits-reset.js";
import { createEditorRoutes } from "./editor.js";
import { createAnalyticsRoutes } from "./analytics.js";
import { sendSiteLiveEmail } from "./email.js";
import { createTemplateRoutes, startTemplateRecycler } from "./templates.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));

// Stripe webhook needs raw body — must be before express.json()
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// Server-side Supabase client (service role, bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/generate
 *
 * Generates a complete website. Streams progress events via SSE.
 *
 * Request body:
 *   { businessName, businessType, description, userId }
 *
 * SSE events:
 *   status    — progress updates ("generating", "images", "saving", "done")
 *   chunk     — streamed HTML chunks from Claude
 *   image     — when an image slot is filled { slotNumber, url }
 *   result    — final site data { siteId, html }
 *   error     — if something goes wrong
 */
app.post("/api/generate", async (req, res) => {
  const { businessName, businessType, description, userId } = req.body;

  if (!businessName || !businessType || !description) {
    return res.status(400).json({ error: "Missing required fields: businessName, businessType, description" });
  }

  // Set up SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // === Phase 1: Check credits (if userId provided) ===
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("monthly_credits, purchased_credits")
        .eq("id", userId)
        .single();

      if (profile && (profile.monthly_credits + profile.purchased_credits) < 1) {
        send("error", { message: "Insufficient credits" });
        return res.end();
      }
    }

    send("status", { phase: "generating", message: "Generating your website..." });

    // === Phase 2: Generate HTML with Claude ===
    const result = await generateSite(
      { businessName, businessType, description },
      {
        onChunk: (chunk) => send("chunk", { text: chunk }),
      }
    );

    send("status", {
      phase: "generated",
      message: "Website generated! Processing images...",
      usage: result.usage,
    });

    // === Phase 3: Create site record in DB ===
    let siteId = null;
    if (userId) {
      const { data: site, error: siteError } = await supabase
        .from("sites")
        .insert({
          user_id: userId,
          name: businessName,
          business_type: businessType,
          description,
          html_content: result.html,
          status: "draft",
          meta: {
            imageSlots: result.imageSlots,
            usage: result.usage,
          },
        })
        .select("id")
        .single();

      if (siteError) {
        console.error("DB insert error:", siteError);
      } else {
        siteId = site.id;
      }
    }

    // === Phase 4: Generate images (if Recraft key is set) ===
    let finalHtml = result.html;

    if (process.env.RECRAFT_API_KEY && result.imageSlots.length > 0) {
      send("status", { phase: "images", message: `Generating ${result.imageSlots.length} images...` });

      const colorPalette = extractColorPalette(result.html);
      const imageMap = await generateAndStoreImages(
        result.imageSlots,
        colorPalette,
        siteId || "preview"
      );

      // Send each image as it's mapped
      for (const [slot, url] of Object.entries(imageMap)) {
        send("image", { slotNumber: parseInt(slot), url });
      }

      // Replace placeholders in HTML
      finalHtml = replaceImageSlots(result.html, imageMap);

      // Update the site record with final HTML
      if (siteId) {
        await supabase
          .from("sites")
          .update({ html_content: finalHtml })
          .eq("id", siteId);
      }
    }

    // === Phase 5: Deduct credit ===
    if (userId) {
      const { data: deducted } = await supabase.rpc("deduct_credits", {
        p_user_id: userId,
        p_amount: 1,
        p_type: "generation",
        p_site_id: siteId,
        p_description: `Generated site: ${businessName}`,
      });

      if (!deducted) {
        console.warn("Credit deduction returned false — may be insufficient credits");
      }
    }

    // === Done ===
    send("status", { phase: "done", message: "Your website is ready!" });
    send("result", {
      siteId,
      html: finalHtml,
      imageSlots: result.imageSlots,
      usage: result.usage,
    });

    res.end();
  } catch (err) {
    console.error("Generation error:", err);
    send("error", { message: err.message || "Generation failed" });
    res.end();
  }
});

// ═══ Deploy Routes ═══

/**
 * POST /api/sites/publish
 * Deploys a site to Cloudflare Pages.
 * Body: { siteId, userId }
 */
app.post("/api/sites/publish", async (req, res) => {
  const { siteId, userId } = req.body;
  if (!siteId || !userId) {
    return res.status(400).json({ error: "Missing siteId or userId" });
  }

  try {
    // Check user has an active paid plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, plan_status")
      .eq("id", userId)
      .single();

    if (!profile || profile.plan === "free") {
      return res.status(403).json({ error: "Paid plan required to publish" });
    }
    if (profile.plan_status === "cancelled") {
      return res.status(403).json({ error: "Subscription is cancelled" });
    }

    // Get the site
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("*")
      .eq("id", siteId)
      .eq("user_id", userId)
      .single();

    if (siteError || !site) {
      return res.status(404).json({ error: "Site not found" });
    }
    if (!site.html_content) {
      return res.status(400).json({ error: "Site has no content to deploy" });
    }

    // Generate slug if not set
    let slug = site.slug;
    if (!slug) {
      slug = generateSlug(site.name);
      // Ensure uniqueness
      let candidate = slug;
      let attempt = 0;
      while (!(await isSlugAvailable(candidate))) {
        attempt++;
        candidate = `${slug}-${attempt}`;
      }
      slug = candidate;
    }

    // Create CF Pages project if first publish
    if (!site.cloudflare_project_id) {
      const project = await createProject(slug);
      await supabase
        .from("sites")
        .update({
          slug,
          cloudflare_project_id: project.name,
        })
        .eq("id", siteId);
    }

    // Deploy
    const projectName = site.cloudflare_project_id || slug;
    const deployment = await deploySite(projectName, site.html_content);

    // Update site record
    await supabase
      .from("sites")
      .update({
        status: "published",
        slug,
        cloudflare_deployment_url: deployment.url,
      })
      .eq("id", siteId);

    // Send "site is live" email
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (ownerProfile?.email) {
      const siteUrl = `https://${slug}.quikwebsites.com`;
      sendSiteLiveEmail(ownerProfile.email, site.name, siteUrl).catch((err) =>
        console.error("Failed to send site live email:", err)
      );
    }

    res.json({
      url: deployment.url,
      subdomain: `${slug}.pages.dev`,
      siteUrl: `${slug}.quikwebsites.com`,
    });
  } catch (err) {
    console.error("Publish error:", err);
    res.status(500).json({ error: err.message || "Failed to publish site" });
  }
});

/**
 * POST /api/sites/unpublish
 * Unpublishes a site from Cloudflare Pages.
 * Body: { siteId, userId }
 */
app.post("/api/sites/unpublish", async (req, res) => {
  const { siteId, userId } = req.body;
  if (!siteId || !userId) {
    return res.status(400).json({ error: "Missing siteId or userId" });
  }

  try {
    const { data: site } = await supabase
      .from("sites")
      .select("cloudflare_project_id, status")
      .eq("id", siteId)
      .eq("user_id", userId)
      .single();

    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }

    if (site.cloudflare_project_id) {
      await unpublishSite(site.cloudflare_project_id);
    }

    await supabase
      .from("sites")
      .update({ status: "unpublished" })
      .eq("id", siteId);

    res.json({ success: true });
  } catch (err) {
    console.error("Unpublish error:", err);
    res.status(500).json({ error: err.message || "Failed to unpublish" });
  }
});

/**
 * GET /api/sites/check-slug?name=...
 * Check if a slug is available for a site name.
 */
app.get("/api/sites/check-slug", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Missing name" });

  const slug = generateSlug(name);
  const available = await isSlugAvailable(slug);
  res.json({ slug, available });
});

// ═══ Credits Routes ═══

/**
 * GET /api/credits?userId=...
 * Returns the user's current credit balance and plan.
 */
app.get("/api/credits", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, plan_status, monthly_credits, purchased_credits, credits_reset_at")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    plan: profile.plan,
    planStatus: profile.plan_status,
    monthlyCredits: profile.monthly_credits,
    purchasedCredits: profile.purchased_credits,
    totalCredits: profile.monthly_credits + profile.purchased_credits,
    creditsResetAt: profile.credits_reset_at,
  });
});

/**
 * GET /api/credits/history?userId=...&limit=20
 * Returns the user's credit transaction history.
 */
app.get("/api/credits/history", async (req, res) => {
  const { userId, limit = 20 } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("id, type, credits_amount, description, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(parseInt(limit));

  if (error) {
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }

  res.json({ transactions });
});

// ═══ Contact Form Routes ═══
app.use("/api/forms", createFormRoutes(supabase));

// ═══ Image Gallery Routes ═══
app.use("/api/images", createImageGalleryRoutes());

// ═══ Domain Routes ═══
app.use("/api/domains", createDomainRoutes(supabase));

// ═══ Editor Routes ═══
app.use("/api/editor", createEditorRoutes(supabase));

// ═══ Analytics Routes ═══
app.use("/api/analytics", createAnalyticsRoutes(supabase));

// ═══ Template Gallery Routes ═══
app.use("/api/templates", createTemplateRoutes(supabase));

// ═══ Video Routes ═══
if (process.env.HIGGSFIELD_API_KEY_ID) {
  app.use("/api/video", createVideoRoutes(supabase));
}

// ═══ Stripe Routes ═══
if (process.env.STRIPE_SECRET_KEY) {
  app.use("/api/stripe", createStripeRoutes(supabase));
  app.post("/api/stripe/webhook", createWebhookHandler(supabase));
}

/**
 * GET /api/account/status?userId=...
 * Returns account status for dashboard banners (past_due, expired, etc.)
 */
app.get("/api/account/status", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_status, past_due_since")
    .eq("id", userId)
    .single();

  if (!profile) return res.status(404).json({ error: "User not found" });

  const result = {
    plan: profile.plan,
    status: profile.plan_status,
  };

  if (profile.plan_status === "past_due" && profile.past_due_since) {
    const pastDueDate = new Date(profile.past_due_since);
    const graceDaysLeft = 7 - Math.floor((Date.now() - pastDueDate.getTime()) / (24 * 60 * 60 * 1000));
    result.graceDaysLeft = Math.max(0, graceDaysLeft);
    result.message = graceDaysLeft > 0
      ? `Payment failed. Update your payment method within ${graceDaysLeft} day${graceDaysLeft === 1 ? "" : "s"} to keep your site live.`
      : "Your grace period has expired. Update your payment to bring your site back online.";
  }

  if (profile.plan_status === "expired") {
    result.message = "Your site is still here — update your payment to bring it back online.";
  }

  res.json(result);
});

/**
 * GET /api/health
 * Quick check that the server is running.
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", designPromptLength: DESIGN_PROMPT_LENGTH });
});

// Cache design prompt length for health check
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const DESIGN_PROMPT_LENGTH = readFileSync(
  join(__dirname, "..", "QUIKWEBSITES-DESIGN-PROMPT.md"),
  "utf-8"
).length;

app.listen(PORT, () => {
  console.log(`QuikWebsites API running on http://localhost:${PORT}`);
  console.log(`Design prompt: ${DESIGN_PROMPT_LENGTH} chars`);
  console.log(`Recraft V4 images: ${process.env.RECRAFT_API_KEY ? "enabled ($0.04/image)" : "disabled (no RECRAFT_API_KEY)"}`);
  console.log(`Stripe: ${process.env.STRIPE_SECRET_KEY ? "enabled" : "disabled (no STRIPE_SECRET_KEY)"}`);
  console.log(`Pexels: ${process.env.PEXELS_API_KEY ? "enabled" : "disabled (no PEXELS_API_KEY)"}`);
  console.log(`Higgsfield: ${process.env.HIGGSFIELD_API_KEY_ID ? "enabled" : "disabled (no HIGGSFIELD_API_KEY_ID)"}`);

  // Start grace period checker for past-due accounts
  startGracePeriodChecker(supabase);

  // Start monthly credit resets for annual subscribers
  if (process.env.STRIPE_SECRET_KEY) {
    startCreditResetChecker(supabase);
  }

  // Start template recycler for unconverted free-tier sites
  startTemplateRecycler(supabase);
});
