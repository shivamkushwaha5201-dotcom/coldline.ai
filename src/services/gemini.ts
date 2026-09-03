import { GoogleGenerativeAI } from "@google/generative-ai";
import { PitchOption, ToneOption } from "../types";
import { HOOK_TYPES } from "../data/constants";

// WARNING: Client-side Gemini API call requested by user. Exposing API keys in client-side code is acceptable when explicitly requested with client-provided keys.

export const GEMINI_MODEL = "gemini-1.5-flash";
export const GEMINI_FALLBACK_MODEL = "gemini-3.5-flash";

export interface GeneratePitchesParams {
  targetData: string;
  userPerspective: string;
  tone: ToneOption;
  apiKey?: string;
  input?: string; // fallback alias
}

export interface GeneratePitchesResult {
  pitches: PitchOption[];
  icebreakers: string[]; // for backward compatibility
  userPerspective: string;
  tone: ToneOption;
  normalizedInput: string;
}

export function parsePitchOptions(rawText: string): PitchOption[] {
  const defaultHooks = [
    {
      hookType: "Observation Hook",
      tagline: "Highlighting something specific about their recent posts/company work",
    },
    {
      hookType: "Direct Pitch Hook",
      tagline: "Directly connecting user's service/skill to a problem the company might be facing",
    },
    {
      hookType: "Soft Inquiry Hook",
      tagline: "A low-friction opening question to start a conversation",
    },
  ];

  try {
    const cleaned = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => {
        const fallback = defaultHooks[idx % defaultHooks.length];
        if (typeof item === "string") {
          return {
            hookType: fallback.hookType,
            tagline: fallback.tagline,
            pitch: item.trim(),
          };
        }
        return {
          hookType: item.hookType || item.hook_type || item.type || fallback.hookType,
          tagline: item.tagline || fallback.tagline,
          pitch: (item.pitch || item.text || item.content || "").trim(),
        };
      }).filter((p) => p.pitch.length > 0);
    }
  } catch {
    // Try regex extraction of JSON array
    const match = rawText.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => {
            const fallback = defaultHooks[idx % defaultHooks.length];
            if (typeof item === "string") {
              return {
                hookType: fallback.hookType,
                tagline: fallback.tagline,
                pitch: item.trim(),
              };
            }
            return {
              hookType: item.hookType || item.hook_type || item.type || fallback.hookType,
              tagline: item.tagline || fallback.tagline,
              pitch: (item.pitch || item.text || item.content || "").trim(),
            };
          }).filter((p) => p.pitch.length > 0);
        }
      } catch {}
    }

    // Fallback: extract line by line
    const lines = rawText
      .split("\n")
      .map((l) => l.replace(/^[-*\d.)\]]+\s*/, "").replace(/^["']|["']$/g, "").trim())
      .filter((l) => l.length > 25);

    if (lines.length > 0) {
      return lines.slice(0, 3).map((line, idx) => ({
        hookType: defaultHooks[idx % defaultHooks.length].hookType,
        tagline: defaultHooks[idx % defaultHooks.length].tagline,
        pitch: line,
      }));
    }
  }
  return [];
}

/**
 * Builds the AI prompt tailored for Target Info and User Pitch Perspective
 */
export function buildPrompt(params: {
  targetData: string;
  userPerspective: string;
  tone?: ToneOption;
}): string {
  const target = params.targetData.trim();
  const perspective = params.userPerspective.trim();

  return `You are an expert cold outreach strategist. Read the target founder/company details (${target}) and the user's specific background and goal (${perspective}). Generate 3 highly personalized, high-converting cold outreach hooks that directly bridge the user's offered value to the target's specific business context.

Target Founder / Company Details:
"${target}"

User's Specific Background and Goal (Pitch Perspective & Context):
"${perspective}"

${params.tone ? `Tone of Voice: ${params.tone}\n` : ""}

Generate exactly 3 custom pitch options:
1. "Observation Hook": Highlighting something specific about their recent posts, product releases, design patterns, or company work.
2. "Direct Pitch Hook": Directly connecting user's service/skill/solution to a concrete problem or bottleneck the company might be facing.
3. "Soft Inquiry Hook": A low-friction, high-curiosity opening question to start an effortless peer conversation.

EXAMPLES OF DESIRED QUALITY:
- Video Editor pitch to Linear (Perspective: I'm a short-form video editor and I want to pitch them on re-editing their podcast clips for TikTok and Reels to boost engagement):
  "Noticed Linear's Twitter design teasers get crazy reach, but the video walkthroughs could double conversions on LinkedIn. I help tech brands repurpose product updates into high-performing short video posts—would you be open to seeing 2 quick video concepts I drafted for Linear?"
- Next.js Dev pitch to SaaS Founder (Perspective: I'm a Next.js full-stack developer who builds fast UI components. I want to reach out about contract frontend help on their roadmap):
  "Loved the new workflow feature you shipped last week. As a Next.js dev who builds fast UI components, I'm actively looking for early-stage teams building slick developer tools. Are you currently hiring or open to contract help on your frontend roadmap?"

OUTPUT FORMAT:
Return strictly a valid JSON array of 3 objects with keys "hookType", "tagline", and "pitch".
Do NOT include markdown backticks or commentary outside JSON.
Example:
[
  {
    "hookType": "Observation Hook",
    "tagline": "Highlighting something specific about their recent posts/company work",
    "pitch": "..."
  },
  {
    "hookType": "Direct Pitch Hook",
    "tagline": "Directly connecting user's service/skill to a problem the company might be facing",
    "pitch": "..."
  },
  {
    "hookType": "Soft Inquiry Hook",
    "tagline": "A low-friction opening question to start a conversation",
    "pitch": "..."
  }
]`;
}

/**
 * Directly calls @google/generative-ai SDK from the browser
 */
export async function generatePitches(
  params: GeneratePitchesParams
): Promise<GeneratePitchesResult> {
  const key = params.apiKey || (typeof window !== "undefined" ? localStorage.getItem("coldline_gemini_api_key") || "" : "");
  if (!key) {
    throw new Error("Missing Gemini API Key. Please provide a valid Gemini API key.");
  }

  const genAI = new GoogleGenerativeAI(key);
  const targetData = params.targetData || params.input || "";
  const prompt = buildPrompt({
    targetData,
    userPerspective: params.userPerspective,
    tone: params.tone,
  });

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

  const pitches = parsePitchOptions(rawText);
  if (pitches.length === 0) {
    throw new Error("Unable to parse generated pitch options from Gemini response.");
  }

  const normalizedInput = /^https?:\/\//i.test(targetData.trim())
    ? targetData.trim()
    : "https://" + targetData.trim();

  return {
    pitches,
    icebreakers: pitches.map((p) => p.pitch),
    userPerspective: params.userPerspective,
    tone: params.tone,
    normalizedInput,
  };
}

// Backward compatibility alias
export async function generateIcebreakers(params: {
  input: string;
  tone: string;
  apiKey?: string;
}) {
  const result = await generatePitches({
    targetData: params.input,
    userPerspective: "I help tech companies scale organic outreach and engagement.",
    tone: (params.tone as ToneOption) || "Professional",
    apiKey: params.apiKey,
  });
  return {
    icebreakers: result.icebreakers,
    tone: result.tone,
    normalizedInput: result.normalizedInput,
  };
}
