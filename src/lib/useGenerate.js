import { useState, useCallback, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * React hook for website generation with streaming updates.
 *
 * Usage:
 *   const { generate, status, html, images, error, isGenerating } = useGenerate();
 *   generate({ businessName: "Bella's Kitchen", businessType: "Italian Restaurant", description: "..." });
 */
export function useGenerate() {
  const [status, setStatus] = useState(null); // { phase, message }
  const [html, setHtml] = useState("");
  const [images, setImages] = useState({}); // { slotNumber: url }
  const [result, setResult] = useState(null); // final { siteId, html, usage }
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const htmlRef = useRef("");

  const generate = useCallback(async ({ businessName, businessType, description, userId }) => {
    // Reset state
    setStatus({ phase: "starting", message: "Starting generation..." });
    setHtml("");
    setImages({});
    setResult(null);
    setError(null);
    setIsGenerating(true);
    htmlRef.current = "";

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, businessType, description, userId }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE format: "event: <type>\ndata: <json>\n\n"
        // Split on double newlines to get complete events
        const events = buffer.split("\n\n");
        buffer = events.pop() || ""; // Keep incomplete event in buffer

        for (const event of events) {
          if (!event.trim()) continue;

          const lines = event.split("\n");
          let eventType = null;
          let eventData = null;

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              try {
                eventData = JSON.parse(line.slice(6));
              } catch {
                // Skip malformed JSON
              }
            }
          }

          if (eventType && eventData) {
            handleEvent(eventType, eventData);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }

    function handleEvent(type, data) {
      switch (type) {
        case "status":
          setStatus(data);
          break;
        case "chunk":
          htmlRef.current += data.text;
          setHtml(htmlRef.current);
          break;
        case "image":
          setImages((prev) => ({ ...prev, [data.slotNumber]: data.url }));
          break;
        case "result":
          setResult(data);
          setHtml(data.html);
          break;
        case "error":
          setError(data.message);
          break;
      }
    }
  }, []);

  const reset = useCallback(() => {
    setStatus(null);
    setHtml("");
    setImages({});
    setResult(null);
    setError(null);
    setIsGenerating(false);
    htmlRef.current = "";
  }, []);

  return {
    generate,
    reset,
    status,
    html,
    images,
    result,
    error,
    isGenerating,
  };
}
