import { GoogleGenAI, Type } from "@google/genai";

// Primary Gemini Model and direct fetch endpoint URL
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

  // 2. Extract markdown code block
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

  // 3. Extract JSON array using regex
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

  // 4. Line extraction fallback
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { input, tone = "Professional", apiKey: requestedKey } = body;

    if (!input || typeof input !== "string" || !input.trim()) {
      return Response.json(
        { error: "Please provide a valid prospect website URL or company description." },
        { status: 400 }
      );
    }

    const apiKey =
      (typeof requestedKey === "string" && requestedKey.trim()) ||
      (req.headers.get("x-gemini-api-key")?.trim()) ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error:
            "Gemini API key is missing. Please set GEMINI_API_KEY in your .env.local file or pass it in the request.",
        },
        { status: 401 }
      );
    }

    const urlInfo = extractCompanyAndUrlDetails(input);

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemPrompt = `You are a world-class B2B cold email copywriter and outbound sales strategist.
Analyze the provided prospect input (which may be a website URL, domain name, company description, or bio).
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
5. Important URL / Fallback Handling:
   ${
     urlInfo.isUrl
       ? `The user provided a website URL (${urlInfo.cleanUrl}) for "${urlInfo.companyName || urlInfo.cleanUrl}". You must NOT refuse or say you cannot browse URLs. Infer the company's business model, industry, and core strengths from its domain and known presence, and craft tailored icebreakers.`
       : "Analyze the provided company description and extract relevant value hooks."
   }
6. Format: Return ONLY a JSON array of 3 string items, e.g. ["line 1", "line 2", "line 3"]. Never wrap in explanation text or disclaimers.`;

    const userPrompt = urlInfo.isUrl
      ? `Prospect Website: ${urlInfo.cleanUrl}
Identified Company / Brand: ${urlInfo.companyName || urlInfo.cleanUrl}
Tone requested: ${tone}

Generate 3 high-converting cold email opening icebreakers for this company now as a JSON array.`
      : `Prospect / Company Bio:
"""
${urlInfo.cleanUrl}
"""
Tone requested: ${tone}

Generate 3 high-converting cold email opening icebreakers now as a JSON array.`;

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

    if (icebreakers.length === 0) {
      if (lastErr && !rawText) {
        const formatted = formatGeminiError(lastErr);
        // If the user explicitly passed an invalid API key (401), report it
        if (formatted.status === 401) {
          return Response.json({ error: formatted.message }, { status: 401 });
        }
      }
      // Graceful fallback icebreakers based on provided domain/text
      icebreakers = generateFallbackIcebreakers(input, tone, urlInfo.companyName);
    }

    return Response.json({
      success: true,
      icebreakers: icebreakers.slice(0, 3),
      tone,
      normalizedInput: urlInfo.cleanUrl,
    });
  } catch (error: any) {
    console.error("Next.js API route error:", error);
    const formatted = formatGeminiError(error);
    return Response.json({ error: formatted.message }, { status: formatted.status });
  }
}

export async function GET() {
  return Response.json({
    status: "ok",
    endpoint: "/api/generate",
    method: "POST",
    description: "ColdLine AI generator API endpoint.",
    models: ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"],
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-gemini-api-key",
    },
  });
}
