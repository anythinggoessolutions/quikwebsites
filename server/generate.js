import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load design prompt once at startup (cached across all requests)
const DESIGN_PROMPT = readFileSync(
  join(__dirname, "..", "..", "QUIKWEBSITES-DESIGN-PROMPT.md"),
  "utf-8"
);

const client = new Anthropic();

/**
 * Generate a website from business info.
 * Streams the response — caller gets chunks via the onChunk callback.
 * Returns the complete HTML + metadata when done.
 */
export async function generateSite({ businessName, businessType, description }, { onChunk, onThinking } = {}) {
  const userMessage = `Generate a complete website for this business:

**Business Name:** ${businessName}
**Business Type:** ${businessType}
**Description:** ${description}

Generate the complete HTML file now. Output ONLY the HTML — no commentary before or after, no markdown code fences.`;

  let fullResponse = "";
  let thinkingText = "";

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: DESIGN_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  stream.on("text", (text) => {
    fullResponse += text;
    if (onChunk) onChunk(text);
  });

  // Capture thinking for debugging (not sent to client in production)
  stream.on("thinking", (thinking) => {
    thinkingText += thinking;
    if (onThinking) onThinking(thinking);
  });

  const finalMessage = await stream.finalMessage();

  // Extract HTML — handle cases where model wraps in code fences
  let html = fullResponse;
  const htmlMatch = fullResponse.match(/```html\s*\n([\s\S]*?)\n```/);
  if (htmlMatch) {
    html = htmlMatch[1];
  } else if (fullResponse.includes("<!DOCTYPE")) {
    html = fullResponse.substring(fullResponse.indexOf("<!DOCTYPE"));
  }

  // Extract image prompts from the HTML
  const imageSlots = extractImageSlots(html);

  return {
    html,
    imageSlots,
    usage: {
      inputTokens: finalMessage.usage.input_tokens,
      outputTokens: finalMessage.usage.output_tokens,
      cacheReadTokens: finalMessage.usage.cache_read_input_tokens || 0,
      cacheCreationTokens: finalMessage.usage.cache_creation_input_tokens || 0,
    },
    stopReason: finalMessage.stop_reason,
  };
}

/**
 * Extract image slots and their generation prompts from HTML.
 * Returns array of { slotNumber, altText, imagePrompt }
 */
function extractImageSlots(html) {
  const slots = [];
  const regex = /src="?\{\{IMAGE_SLOT_(\d+)\}\}"?\s[^>]*data-image-prompt="([^"]*)"/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    slots.push({
      slotNumber: parseInt(match[1]),
      imagePrompt: match[2],
    });
  }

  // Also try the reverse order (data-image-prompt before src)
  const regex2 = /data-image-prompt="([^"]*)"[^>]*src="?\{\{IMAGE_SLOT_(\d+)\}\}"?/g;
  while ((match = regex2.exec(html)) !== null) {
    const slotNum = parseInt(match[2]);
    if (!slots.find(s => s.slotNumber === slotNum)) {
      slots.push({
        slotNumber: slotNum,
        imagePrompt: match[1],
      });
    }
  }

  return slots.sort((a, b) => a.slotNumber - b.slotNumber);
}

/**
 * Replace image placeholders in HTML with real URLs.
 */
export function replaceImageSlots(html, imageMap) {
  let result = html;
  for (const [slotNumber, url] of Object.entries(imageMap)) {
    result = result.replace(
      new RegExp(`\\{\\{IMAGE_SLOT_${slotNumber}\\}\\}`, "g"),
      url
    );
  }
  return result;
}

/**
 * Extract color palette from CSS custom properties in the HTML.
 * Used to pass brand colors to image generation.
 */
export function extractColorPalette(html) {
  const colors = [];
  const regex = /--color-(?:primary|accent|bg|bg-alt):\s*(#[0-9A-Fa-f]{3,8})/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (!colors.includes(match[1])) {
      colors.push(match[1]);
    }
  }
  return colors;
}
