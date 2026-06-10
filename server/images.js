import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Recraft API for image generation
const RECRAFT_API_URL = "https://external.api.recraft.ai/v1/images/generations";

/**
 * Generate images for all slots using Recraft API,
 * download them, upload to Supabase Storage, return URL map.
 *
 * @param {Array} imageSlots - [{ slotNumber, imagePrompt }]
 * @param {string[]} colorPalette - hex colors from the site's CSS
 * @param {string} siteId - for organizing storage paths
 * @returns {Object} - { 1: "https://...url", 2: "https://...url", ... }
 */
export async function generateAndStoreImages(imageSlots, colorPalette, siteId) {
  if (!imageSlots.length) return {};

  const imageMap = {};

  // Generate all images in parallel (max 4 concurrent to be polite)
  const CONCURRENCY = 4;
  const chunks = [];
  for (let i = 0; i < imageSlots.length; i += CONCURRENCY) {
    chunks.push(imageSlots.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map(async (slot) => {
        try {
          // Step 1: Generate image via Recraft
          const imageUrl = await generateImage(slot.imagePrompt, colorPalette);
          if (!imageUrl) throw new Error("No image URL returned");

          // Step 2: Download the image
          const imageBuffer = await downloadImage(imageUrl);

          // Step 3: Upload to Supabase Storage
          const storagePath = `sites/${siteId}/image-${slot.slotNumber}.webp`;
          const publicUrl = await uploadToStorage(imageBuffer, storagePath);

          return { slotNumber: slot.slotNumber, url: publicUrl };
        } catch (err) {
          console.error(`Image slot ${slot.slotNumber} failed:`, err.message);
          // Return a placeholder on failure — don't break the whole site
          return {
            slotNumber: slot.slotNumber,
            url: `https://placehold.co/800x600/1a1a1a/666?text=Image+${slot.slotNumber}`,
          };
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        imageMap[result.value.slotNumber] = result.value.url;
      }
    }
  }

  return imageMap;
}

/**
 * Call Recraft API to generate a single image.
 */
async function generateImage(prompt, colorPalette = []) {
  const apiKey = process.env.RECRAFT_API_KEY;
  if (!apiKey) {
    console.warn("RECRAFT_API_KEY not set — skipping image generation");
    return null;
  }

  const body = {
    prompt,
    style: "any",
    model: "recraftv4",
    size: "1344x768", // widescreen — best for website hero/section images
  };

  // Note: Recraft V4 "any" style doesn't support color palettes.
  // Colors are baked into the prompt by Claude's design prompt instead.

  const response = await fetch(RECRAFT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Recraft API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.data?.[0]?.url || null;
}

/**
 * Download an image from a URL, return as Buffer.
 */
async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Upload image buffer to Supabase Storage, return public URL.
 */
async function uploadToStorage(buffer, path) {
  // Ensure the bucket exists (idempotent)
  const { error: bucketError } = await supabase.storage.createBucket(
    "site-images",
    { public: true, fileSizeLimit: 5 * 1024 * 1024 }
  );
  // Ignore "already exists" errors
  if (bucketError && !bucketError.message.includes("already exists")) {
    console.warn("Bucket creation warning:", bucketError.message);
  }

  const { data, error } = await supabase.storage
    .from("site-images")
    .upload(path, buffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from("site-images")
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Convert hex color to RGB array for Recraft API.
 */
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}
