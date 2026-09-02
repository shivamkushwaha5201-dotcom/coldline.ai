import { GoogleGenAI, Type } from "@google/genai";

function normalizeUrlOrText(input: string): string {
  const trimmed = input.trim();
  const isUrlLike = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed);
  if (isUrlLike && !/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
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
        { status: 500 }
      );
    }

    const normalizedInput = normalizeUrlOrText(input);

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
${normalizedInput}
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
      throw new Error(lastErr?.message || "Failed to generate icebreakers across model candidates.");
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
      const lines = rawText
        .split("\n")
        .map((l) => l.replace(/^[\s*"\d.-]+/, "").replace(/["\\]+$/, "").trim())
        .filter((l) => l.length > 10);
      icebreakers = lines.slice(0, 3);
    }

    if (icebreakers.length === 0) {
      return Response.json(
        { error: "Failed to generate icebreakers. Please try again with more details." },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      icebreakers: icebreakers.slice(0, 3),
      tone,
      normalizedInput,
    });
  } catch (error: any) {
    console.error("Next.js API route error:", error);
    return Response.json(
      { error: error?.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
