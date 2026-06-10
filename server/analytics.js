import { Router } from "express";

export function createAnalyticsRoutes(supabase) {
  const router = Router();

  /**
   * POST /api/analytics/pageview
   * Track a pageview on a client site. Called by the tracking snippet injected into generated sites.
   * Body: { siteId, path, referrer?, userAgent? }
   */
  router.post("/pageview", async (req, res) => {
    const { siteId, path } = req.body;
    if (!siteId) {
      return res.status(400).json({ error: "Missing siteId" });
    }

    try {
      await supabase.from("pageviews").insert({
        site_id: siteId,
        path: path || "/",
        referrer: req.body.referrer || req.headers.referer || null,
        country: req.headers["cf-ipcountry"] || null,
      });

      res.json({ ok: true });
    } catch (err) {
      res.json({ ok: true });
    }
  });

  /**
   * GET /api/analytics/summary?siteId=...&userId=...&days=30
   * Get pageview summary for a site (for the dashboard).
   */
  router.get("/summary", async (req, res) => {
    const { siteId, userId, days = 30 } = req.query;
    if (!siteId || !userId) {
      return res.status(400).json({ error: "Missing siteId or userId" });
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

      const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

      // Total pageviews
      const { count: totalViews } = await supabase
        .from("pageviews")
        .select("*", { count: "exact", head: true })
        .eq("site_id", siteId)
        .gte("created_at", since);

      // Views by day
      const { data: dailyViews } = await supabase
        .from("pageviews")
        .select("created_at")
        .eq("site_id", siteId)
        .gte("created_at", since);

      const byDay = {};
      if (dailyViews) {
        for (const row of dailyViews) {
          const day = row.created_at.slice(0, 10);
          byDay[day] = (byDay[day] || 0) + 1;
        }
      }

      // Top referrers
      const { data: referrerData } = await supabase
        .from("pageviews")
        .select("referrer")
        .eq("site_id", siteId)
        .gte("created_at", since)
        .not("referrer", "is", null);

      const referrers = {};
      if (referrerData) {
        for (const row of referrerData) {
          try {
            const host = new URL(row.referrer).hostname;
            referrers[host] = (referrers[host] || 0) + 1;
          } catch {
            referrers[row.referrer] = (referrers[row.referrer] || 0) + 1;
          }
        }
      }

      const topReferrers = Object.entries(referrers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([source, count]) => ({ source, count }));

      // Top pages
      const { data: pageData } = await supabase
        .from("pageviews")
        .select("path")
        .eq("site_id", siteId)
        .gte("created_at", since);

      const pages = {};
      if (pageData) {
        for (const row of pageData) {
          pages[row.path] = (pages[row.path] || 0) + 1;
        }
      }

      const topPages = Object.entries(pages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }));

      res.json({
        totalViews: totalViews || 0,
        days: parseInt(days),
        dailyViews: byDay,
        topReferrers,
        topPages,
      });
    } catch (err) {
      console.error("Analytics error:", err);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  return router;
}

/**
 * Returns the tracking snippet to inject into generated client sites.
 * Lightweight — no cookies, no personal data, just pageviews.
 */
export function getTrackingSnippet(siteId, apiBase) {
  return `<script>
(function(){
  fetch("${apiBase}/api/analytics/pageview", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      siteId: "${siteId}",
      path: location.pathname,
      referrer: document.referrer || null
    })
  }).catch(function(){});
})();
</script>`;
}
