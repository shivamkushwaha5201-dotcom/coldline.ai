import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

function normalizeUrlOrText(input: string): string {
  const trimmed = input.trim();
  // Check if it looks like a URL without protocol (e.g. example.com or www.example.com)
  const isUrlLike = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed);
  if (isUrlLike && !/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "ColdLine AI" });
  });

  // Icebreaker generation endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { input, tone = "Professional" } = req.body || {};

      if (!input || typeof input !== "string" || !input.trim()) {
        res.status(400).json({
          error: "Please provide a valid prospect website URL or company description.",
        });
        return;
      }

      const customKey = req.body?.apiKey || (req.headers["x-gemini-api-key"] as string);
      const apiKey = (typeof customKey === "string" && customKey.trim())
        ? customKey.trim()
        : process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.status(500).json({
          error: "Gemini API key is missing. Please configure GEMINI_API_KEY in .env.local or enter it directly in the app settings.",
        });
        return;
      }

      const normalized = normalizeUrlOrText(input);

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemPrompt = `You are a world-class B2B cold email copywriter and outbound sales strategist.
Analyze the provided prospect input (which may be a website URL, company description, or bio).
Return EXACTLY a valid JSON array containing 3 distinct, punchy, hyper-relevant cold email opening lines (icebreakers) tailored to this specific company or prospect.

Guidelines for icebreakers:
1. Length: 1 to 2 sentences max per icebreaker.
2. Relevance: Reference specific value propositions, pain points, company milestones, or offerings inferred from the input.
3. Tone: Adhere strictly to the requested tone: "${tone}".
   - Casual: Friendly, peer-to-peer, relaxed, no stiff corporate buzzwords.
   - Professional: Respectful, articulate, credible, consultative.
   - Direct: Straight to the point, metric or problem-oriented, no fluff.
   - Witty: Clever, refreshing, observant, memorable without being unprofessional.
4. Natural delivery: Avoid cheesy lines like "I stumbled upon your website and was blown away". Make it sound like a real person who did thoughtful research.
5. Format: Return ONLY a JSON array of 3 string items, e.g. ["line 1", "line 2", "line 3"].`;

      const userPrompt = `Prospect / Company Input:
"""
${normalized}
"""

Tone requested: ${tone}

Generate 3 high-converting cold email opening icebreakers now.`;

      // Use modern Gemini 3 series flash (gemini-3.6-flash / gemini-3.8-flash), with gemini-2.5-flash fallback
      const candidateModels = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest"];
      let rawText = "";
      let lastErr: any = null;

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
              temperature: 0.7,
            },
          });
          if (response.text && response.text.trim()) {
            rawText = response.text;
            break;
          }
        } catch (err) {
          lastErr = err;
          console.warn(`Model ${modelName} invocation failed, trying next candidate...`, err);
        }
      }

      if (!rawText) {
        throw new Error(lastErr?.message || "Failed to generate icebreakers across model endpoints.");
      }

      let icebreakers: string[] = [];
      try {
        const parsed = JSON.parse(rawText.trim());
        if (Array.isArray(parsed)) {
          icebreakers = parsed.map((item) => (typeof item === "string" ? item.trim() : JSON.stringify(item)));
        } else if (parsed && Array.isArray(parsed.icebreakers)) {
          icebreakers = parsed.icebreakers;
        }
      } catch (parseErr) {
        console.error("Failed to parse Gemini JSON output:", rawText, parseErr);
        // Fallback line-by-line extraction
        const lines = rawText
          .split("\n")
          .map((l) => l.replace(/^[\s*"\d.-]+/, "").replace(/["\\]+$/, "").trim())
          .filter((l) => l.length > 10);
        icebreakers = lines.slice(0, 3);
      }

      if (icebreakers.length === 0) {
        throw new Error("Failed to generate icebreakers. Please try again.");
      }

      // Ensure we have at most 3 clean strings
      const result = icebreakers.slice(0, 3);

      res.json({
        success: true,
        icebreakers: result,
        tone,
        normalizedInput: normalized,
      });
    } catch (error: any) {
      console.error("API /api/generate error:", error);
      res.status(500).json({
        error: error?.message || "An unexpected error occurred while generating icebreakers.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ColdLine AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
