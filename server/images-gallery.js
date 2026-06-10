import { Router } from "express";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE = "https://api.pexels.com/v1";

export function createImageGalleryRoutes() {
  const router = Router();

  /**
   * GET /api/images/search?query=restaurant&page=1&per_page=20
   * Search Pexels for stock photos.
   */
  router.get("/search", async (req, res) => {
    const { query, page = 1, per_page = 20, orientation } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    if (!PEXELS_API_KEY) {
      return res.status(500).json({ error: "Pexels API key not configured" });
    }

    try {
      const params = new URLSearchParams({
        query,
        page: String(page),
        per_page: String(Math.min(Number(per_page), 40)),
      });
      if (orientation) params.set("orientation", orientation);

      const response = await fetch(`${PEXELS_BASE}/search?${params}`, {
        headers: { Authorization: PEXELS_API_KEY },
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();

      res.json({
        photos: data.photos.map((p) => ({
          id: p.id,
          width: p.width,
          height: p.height,
          alt: p.alt,
          photographer: p.photographer,
          src: {
            tiny: p.src.tiny,
            small: p.src.small,
            medium: p.src.medium,
            large: p.src.large,
            original: p.src.original,
          },
        })),
        total: data.total_results,
        page: data.page,
        per_page: data.per_page,
      });
    } catch (err) {
      console.error("Pexels search error:", err);
      res.status(500).json({ error: "Image search failed" });
    }
  });

  /**
   * GET /api/images/curated?page=1&per_page=20
   * Get curated/trending photos (for default gallery view).
   */
  router.get("/curated", async (req, res) => {
    const { page = 1, per_page = 20 } = req.query;

    if (!PEXELS_API_KEY) {
      return res.status(500).json({ error: "Pexels API key not configured" });
    }

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(Math.min(Number(per_page), 40)),
      });

      const response = await fetch(`${PEXELS_BASE}/curated?${params}`, {
        headers: { Authorization: PEXELS_API_KEY },
      });

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data = await response.json();

      res.json({
        photos: data.photos.map((p) => ({
          id: p.id,
          width: p.width,
          height: p.height,
          alt: p.alt,
          photographer: p.photographer,
          src: {
            tiny: p.src.tiny,
            small: p.src.small,
            medium: p.src.medium,
            large: p.src.large,
            original: p.src.original,
          },
        })),
        total: data.total_results,
        page: data.page,
        per_page: data.per_page,
      });
    } catch (err) {
      console.error("Pexels curated error:", err);
      res.status(500).json({ error: "Failed to fetch curated images" });
    }
  });

  return router;
}
