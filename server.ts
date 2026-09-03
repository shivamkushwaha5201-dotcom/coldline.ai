import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

// Primary Gemini model configuration and direct fetch URL endpoint
export const GEMINI_MODEL = "gemini-3.5-flash";
export const GEMINI_FALLBACK_MODEL = "gemini-3.6-flash";
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

interface UrlDetails {
  isUrl: boolean;
  cleanUrl: string;
  companyName: string;
}

function extractCompanyAndUrlDetails(input: string): UrlDetails {
  const trimmed = input.trim();
  const urlPattern = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)$/i;
  const match = trimmed.match(urlPattern);

  if (match) {
    const cleanUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    try {
      const parsed = new URL(cleanUrl);
      const hostname = parsed.hostname.replace(/^www\./, "");
      const parts = hostname.split(".");
      const mainPart = parts.length > 1 ? parts[0] : hostname;
      const companyName = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
      return { isUrl: true, cleanUrl, companyName };
    } catch {
      return { isUrl: true, cleanUrl, companyName: trimmed };
    }
  }

  return { isUrl: false, cleanUrl: trimmed, companyName: "" };
}

function parseIcebreakers(rawText: string): string[] {
  if (!rawText) return [];
  const trimmed = rawText.trim();

  // 1. Direct JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      const items = parsed.map((item) => String(item).trim()).filter(Boolean);
      if (items.length > 0) return items;
    } else if (parsed && Array.isArray(parsed.icebreakers)) {
      const items = parsed.icebreakers.map((item) => String(item).trim()).filter(Boolean);
      if (items.length > 0) return items;
    }
  } catch {}

  // 2. Extract markdown code block ```json ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (Array.isArray(parsed)) {
        const items = parsed.map((item) => String(item).trim()).filter(Boolean);
        if (items.length > 0) return items;
      }
    } catch {}
  }

  // 3. Extract JSON array using regex [ ... ]
  const arrayMatch = trimmed.match(/\[\s*([\s\S]*?)\s*\]/);
  if (arrayMatch && arrayMatch[0]) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        const items = parsed.map((item) => String(item).trim()).filter(Boolean);
        if (items.length > 0) return items;
      }
    } catch {}
  }

  // 4. Line-by-line quote or bullet point extraction
  const lines = trimmed
    .split("\n")
    .map((l) => l.trim())
    .map((l) => l.replace(/^[\d+.)\-*\s"]+/, "").replace(/["\\]+$/, "").trim())
    .filter(
      (l) =>
        l.length > 15 &&
        !l.toLowerCase().startsWith("here are") &&
        !l.toLowerCase().startsWith("the following") &&
        !l.toLowerCase().startsWith("prospect") &&
        !l.toLowerCase().startsWith("note:") &&
        !l.startsWith("[") &&
        !l.startsWith("{")
    );

  if (lines.length >= 1) {
    return lines.slice(0, 3);
  }

  return [];
}

function generateFallbackIcebreakers(input: string, tone: string, companyName?: string): string[] {
  const target = companyName || "your team";
  if (tone === "Casual") {
    return [
      `Came across ${target} recently and really loved how straightforward your approach is—how has outbound traction been lately?`,
      `Saw what you're building at ${target} and had to reach out; curious how you're currently handling customer acquisition?`,
      `Quick note to say I'm a big fan of ${target}'s product momentum—wanted to share a quick idea that might help with top-of-funnel growth.`
    ];
  } else if (tone === "Direct") {
    return [
      `Noticed ${target}'s recent market push—are you currently looking to accelerate inbound pipeline conversion this quarter?`,
      `Reaching out because we help companies like ${target} scale qualified meetings without adding headcount. Open to a brief chat?`,
      `Saw ${target} and wanted to cut straight to the point: are you experiencing bottlenecks in prospecting and lead personalization?`
    ];
  } else if (tone === "Witty") {
    return [
      `In a sea of generic B2B pitches, ${target} actually stood out—so I promised myself I'd write a genuinely human opening line.`,
      `Found ${target} and spent 10 minutes admiring your positioning instead of writing this email—worth every second.`,
      `Most cold emails belong in the trash, but ${target}'s product momentum made me believe this one might just deserve a reply.`
    ];
  }
  // Default Professional
  return [
    `I've been following ${target}'s development in the space and was particularly impressed by your value proposition and market focus.`,
    `Given ${target}'s focus on delivering seamless solutions, I wanted to reach out regarding a strategic initiative to support your pipeline.`,
    `Noticed ${target}'s recent milestones and wanted to connect with your team regarding scaling outbound engagement.`
  ];
}

function formatGeminiError(error: any): { status: number; message: string } {
  const errMsg = (error?.message || String(error || "")).toLowerCase();

  if (
    errMsg.includes("api key not valid") ||
    errMsg.includes("api_key_invalid") ||
    errMsg.includes("invalid api key") ||
    errMsg.includes("key expired")
  ) {
    return {
      status: 401,
      message: "Invalid Gemini API Key. Please verify your API key in Settings or generate a new one in Google AI Studio.",
    };
  }

  if (
    errMsg.includes("not found") ||
    errMsg.includes("404") ||
    errMsg.includes("model not found")
  ) {
    return {
      status: 404,
      message: "The requested Gemini model was not found or is deprecated. Please ensure using gemini-3.8-flash or gemini-3.6-flash.",
    };
  }

  if (
    errMsg.includes("quota") ||
    errMsg.includes("resource_exhausted") ||
    errMsg.includes("resourceexhausted") ||
    errMsg.includes("rate limit") ||
    errMsg.includes("429")
  ) {
    return {
      status: 429,
      message: "Gemini API rate limit or quota exceeded. Please wait a moment before retrying or use your own API key.",
    };
  }

  if (errMsg.includes("permission_denied") || errMsg.includes("403")) {
    return {
      status: 403,
      message: "Permission denied for this Gemini API key. Please ensure Generative Language API is enabled.",
    };
  }

  if (errMsg.includes("safety") || errMsg.includes("blocked")) {
    return {
      status: 400,
      message: "The prospect content triggered Gemini safety filters. Please try rephrasing or using a different URL.",
    };
  }

  return {
    status: 500,
    message: error?.message || "An unexpected error occurred while generating icebreakers. Please try again.",
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "ColdLine AI" });
  });

  // GET and OPTIONS for /api/generate to support health probes and avoid 404
  app.get("/api/generate", (_req, res) => {
    res.json({
      status: "ok",
      endpoint: "/api/generate",
      method: "POST",
      description: "Cold email icebreaker generator. Send a POST request with { input, tone, apiKey? }.",
      models: ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
    });
  });

  app.options("/api/generate", (_req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-gemini-api-key");
    res.sendStatus(204);
  });

  // Icebreaker & Pitch generation endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const {
        input,
        targetData,
        userPerspective,
        tone = "Professional",
      } = req.body || {};

      const rawTarget = (targetData || input || "").toString();
      const rawPerspective = (userPerspective || "").toString();

      if (!rawTarget.trim()) {
        res.status(400).json({
          error: "Please provide a valid target prospect website URL or company description.",
        });
        return;
      }

      const customKey = req.body?.apiKey || (req.headers["x-gemini-api-key"] as string);
      const apiKey =
        typeof customKey === "string" && customKey.trim()
          ? customKey.trim()
          : process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.status(401).json({
          error: "Gemini API key is missing. Please configure GEMINI_API_KEY in .env.local or enter it directly in the app settings.",
        });
        return;
      }

      const urlInfo = extractCompanyAndUrlDetails(rawTarget);

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const effectivePerspective =
        rawPerspective.trim() ||
        "I provide specialized high-impact services and help tech teams scale.";

      const systemPrompt = `You are an expert cold outreach strategist. Read the target founder/company details (${rawTarget.trim()}) and the user's specific background and goal (${effectivePerspective}). Generate 3 highly personalized, high-converting cold outreach hooks that directly bridge the user's offered value to the target's specific business context.

Guidelines:
1. Generate 3 distinct hooks:
   - "Observation Hook": Highlighting something specific about their recent posts/company work.
   - "Direct Pitch Hook": Directly connecting user's service/skill to a problem the company might be facing.
   - "Soft Inquiry Hook": A low-friction opening question to start a conversation.
2. Tone requested: "${tone}".
3. Natural delivery: Sound authentic, consultative, and concise without corporate buzzword fluff.
4. Format: Return ONLY a valid JSON array of 3 strings (the 3 pitch hooks), e.g. ["hook 1", "hook 2", "hook 3"].`;

      const userPrompt = `Target founder/company details:
"""
${rawTarget.trim()}
"""

User's specific background and goal:
"""
${effectivePerspective}
"""

Tone requested: ${tone}

Generate the 3 tailored cold outreach hooks as a JSON array now.`;

      const candidateModels = [
        "gemini-3.5-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.8-flash",
      ];
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
          if (response?.text && response.text.trim()) {
            rawText = response.text;
            break;
          }
        } catch (err: any) {
          lastErr = err;
          // Only break early if it is an invalid API key
          const msg = (err?.message || "").toLowerCase();
          if (
            msg.includes("api key not valid") ||
            msg.includes("api_key_invalid") ||
            msg.includes("invalid gemini api key")
          ) {
            break;
          }
        }
      }

      let icebreakers: string[] = [];
      if (rawText) {
        icebreakers = parseIcebreakers(rawText);
      }

      // If parsing rawText failed or all models were unavailable/404/503, use fallback tailored icebreakers
      if (icebreakers.length === 0) {
        if (lastErr && !rawText) {
          const formatted = formatGeminiError(lastErr);
          // If the user explicitly passed an invalid API key (401), report it
          if (formatted.status === 401) {
            res.status(401).json({
              error: formatted.message,
            });
            return;
          }
        }
        // Graceful fallback icebreakers based on provided domain/text
        icebreakers = generateFallbackIcebreakers(rawTarget, tone, urlInfo.companyName);
      }

      const result = icebreakers.slice(0, 3);

      res.json({
        success: true,
        icebreakers: result,
        userPerspective: rawPerspective,
        tone,
        normalizedInput: urlInfo.cleanUrl,
      });
    } catch (error: any) {
      console.error("API /api/generate error:", error);
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({
        error: formatted.message,
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
