import { GoogleGenAI, Type } from "@google/genai";

// Primary Gemini Model (gemini-3.5-flash or gemini-3.6-flash)
export const GEMINI_MODEL = "gemini-3.5-flash";
export const GEMINI_FALLBACK_MODEL = "gemini-3.6-flash";

// Direct REST endpoint URL for Gemini API if using direct fetch
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

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

/**
 * Call the relative Next.js / Express API endpoint /api/generate
 */
export async function generateIcebreakers(
  params: GenerateIcebreakersParams
): Promise<GenerateIcebreakersResult> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    let errMsg = "";
    try {
      const data = await response.json();
      errMsg = data.error;
    } catch {
      errMsg = await response.text().catch(() => "");
    }
    throw new Error(errMsg || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  return {
    icebreakers: result.icebreakers || [],
    tone: result.tone || params.tone,
    normalizedInput: result.normalizedInput || params.input,
  };
}
