import { GoogleGenerativeAI } from "@google/generative-ai";

// WARNING: Client-side Gemini API call requested by user. Exposing API keys in client-side code is acceptable when explicitly requested with client-provided keys.

export const GEMINI_MODEL = "gemini-1.5-flash";
export const GEMINI_FALLBACK_MODEL = "gemini-3.5-flash";

export interface GenerateIcebreakersParams {
  input: string;
  tone: string;
  apiKey?: string;
}

export interface GenerateIcebreakersResult {
  icebreakers: string[];
  tone: string;
  normalizedInput: string;
}

function parseIcebreakers(rawText: string): string[] {
  try {
    const cleaned = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    const match = rawText.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {}
    }
    const lines = rawText
      .split("\n")
      .map((l) => l.replace(/^[-*\d.)\]]+\s*/, "").replace(/^["']|["']$/g, "").trim())
      .filter((l) => l.length > 20);
    if (lines.length > 0) {
      return lines.slice(0, 3);
    }
  }
  return [];
}

/**
 * Directly calls @google/generative-ai SDK from the browser
 */
export async function generateIcebreakers(
  params: GenerateIcebreakersParams
): Promise<GenerateIcebreakersResult> {
  const key = params.apiKey || (typeof window !== "undefined" ? localStorage.getItem("coldline_gemini_api_key") || "" : "");
  if (!key) {
    throw new Error("Missing Gemini API Key. Please provide a valid Gemini API key.");
  }

  const genAI = new GoogleGenerativeAI(key);
  const prompt = `You are an expert sales personalizer. Generate exactly 3 personalized cold outreach email icebreakers for:
"${params.input.trim()}"

Tone: ${params.tone}
Rules:
- 1 to 2 sentences each.
- Highly relevant and non-generic.
- Return strictly a valid JSON array of 3 strings. Example: ["Icebreaker 1", "Icebreaker 2", "Icebreaker 3"]`;

  let rawText = "";
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.7 },
    });
    const result = await model.generateContent(prompt);
    rawText = result.response.text();
  } catch (err: any) {
    const errMsg = (err?.message || "").toLowerCase();
    if (errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("no longer available")) {
      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-3.5-flash",
        generationConfig: { temperature: 0.7 },
      });
      const result = await fallbackModel.generateContent(prompt);
      rawText = result.response.text();
    } else {
      throw err;
    }
  }

  const icebreakers = parseIcebreakers(rawText);
  if (icebreakers.length === 0) {
    throw new Error("Unable to parse icebreaker results from Gemini response.");
  }

  const normalizedInput = /^https?:\/\//i.test(params.input.trim())
    ? params.input.trim()
    : "https://" + params.input.trim();

  return {
    icebreakers,
    tone: params.tone,
    normalizedInput,
  };
}
