import { createHiggsfieldClient } from "@higgsfield/client/v2";
import { Router } from "express";

const higgsfield = createHiggsfieldClient({
  credentials: `${process.env.HIGGSFIELD_API_KEY_ID}:${process.env.HIGGSFIELD_API_KEY_SECRET}`,
  pollInterval: 3000,
  maxPollTime: 300000,
});

export function createVideoRoutes(supabase) {
  const router = Router();

  /**
   * POST /api/video/generate
   * Generate a cinematic scroll video from a prompt.
   * Body: { prompt, imageUrl?, siteId, userId }
   *
   * If imageUrl is provided, uses image-to-video (DOP model).
   * Otherwise, generates an image first, then converts to video.
   */
  router.post("/generate", async (req, res) => {
    const { prompt, imageUrl, siteId, userId } = req.body;
    if (!prompt || !userId) {
      return res.status(400).json({ error: "Missing prompt or userId" });
    }

    try {
      // Check user has Pro plan or enough credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, monthly_credits, purchased_credits")
        .eq("id", userId)
        .single();

      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }

      const totalCredits = profile.monthly_credits + profile.purchased_credits;
      if (totalCredits < 1) {
        return res.status(403).json({ error: "Insufficient credits" });
      }

      let videoUrl;

      if (imageUrl) {
        // Image-to-video: animate an existing image
        const jobSet = await higgsfield.subscribe("/v1/image2video/dop", {
          input: {
            model: "dop-turbo",
            prompt,
            input_images: [{ type: "image_url", image_url: imageUrl }],
          },
          withPolling: true,
        });

        if (!jobSet.isCompleted) {
          return res.status(500).json({
            error: "Video generation failed",
            status: jobSet.isFailed ? "failed" : "timeout",
          });
        }

        videoUrl = jobSet.jobs[0]?.results?.raw?.url;
      } else {
        // Text-to-image first, then animate
        const imgJobSet = await higgsfield.subscribe(
          "flux-pro/kontext/max/text-to-image",
          {
            input: {
              aspect_ratio: "16:9",
              prompt,
              safety_tolerance: 2,
            },
            withPolling: true,
          }
        );

        if (!imgJobSet.isCompleted) {
          return res.status(500).json({ error: "Image generation failed" });
        }

        const generatedImageUrl = imgJobSet.jobs[0]?.results?.raw?.url;

        // Now animate it
        const vidJobSet = await higgsfield.subscribe("/v1/image2video/dop", {
          input: {
            model: "dop-turbo",
            prompt: `Slow cinematic camera push-in. ${prompt}`,
            input_images: [{ type: "image_url", image_url: generatedImageUrl }],
          },
          withPolling: true,
        });

        if (!vidJobSet.isCompleted) {
          return res.status(500).json({ error: "Video generation failed" });
        }

        videoUrl = vidJobSet.jobs[0]?.results?.raw?.url;
      }

      if (!videoUrl) {
        return res.status(500).json({ error: "No video URL returned" });
      }

      // Deduct credit
      await supabase.rpc("deduct_credits", {
        p_user_id: userId,
        p_amount: 1,
        p_type: "video",
        p_site_id: siteId || null,
        p_description: "Generated cinematic scroll video",
      });

      // Save video URL to site if siteId provided
      if (siteId) {
        const { data: site } = await supabase
          .from("sites")
          .select("meta")
          .eq("id", siteId)
          .single();

        const meta = site?.meta || {};
        meta.scrollVideo = videoUrl;

        await supabase
          .from("sites")
          .update({ meta })
          .eq("id", siteId);
      }

      res.json({ success: true, videoUrl });
    } catch (err) {
      console.error("Video generation error:", err);
      res.status(500).json({ error: "Video generation failed" });
    }
  });

  /**
   * POST /api/video/generate-async
   * Start video generation without waiting. Returns a job ID to poll.
   * Body: { prompt, imageUrl?, siteId, userId }
   */
  router.post("/generate-async", async (req, res) => {
    const { prompt, imageUrl, userId } = req.body;
    if (!prompt || !userId) {
      return res.status(400).json({ error: "Missing prompt or userId" });
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan, monthly_credits, purchased_credits")
        .eq("id", userId)
        .single();

      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }

      const totalCredits = profile.monthly_credits + profile.purchased_credits;
      if (totalCredits < 1) {
        return res.status(403).json({ error: "Insufficient credits" });
      }

      let jobSet;

      if (imageUrl) {
        jobSet = await higgsfield.subscribe("/v1/image2video/dop", {
          input: {
            model: "dop-turbo",
            prompt,
            input_images: [{ type: "image_url", image_url: imageUrl }],
          },
          withPolling: false,
        });
      } else {
        jobSet = await higgsfield.subscribe(
          "flux-pro/kontext/max/text-to-image",
          {
            input: {
              aspect_ratio: "16:9",
              prompt,
              safety_tolerance: 2,
            },
            withPolling: false,
          }
        );
      }

      res.json({
        jobId: jobSet.id,
        status: "queued",
        type: imageUrl ? "video" : "image",
      });
    } catch (err) {
      console.error("Async video generation error:", err);
      res.status(500).json({ error: "Failed to start generation" });
    }
  });

  return router;
}
