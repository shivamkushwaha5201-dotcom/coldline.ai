import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Header } from "./components/Header";
import { HeroInput } from "./components/HeroInput";
import { HowToUse } from "./components/HowToUse";
import { OutputSection } from "./components/OutputSection";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { ToneOption } from "./types";

// WARNING: Client-side Gemini API call requested by user. Exposing API keys in client-side code is acceptable when explicitly requested with client-provided keys.

const DEFAULT_KEY = "AQ.Ab8RN6L5QDp0kDnz4wAuLimYkPEWNUy_xh0v70fa-uHRIgqtog";

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

export default function App() {
  const [input, setInput] = useState<string>("linear.app");
  const [tone, setTone] = useState<ToneOption>("Professional");
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("coldline_gemini_api_key") || DEFAULT_KEY;
    }
    return DEFAULT_KEY;
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [icebreakers, setIcebreakers] = useState<string[]>([
    "Noticed how Linear continues to set the gold standard for snappy keyboard-first UX—the new sub-issue workflows are genuinely impressive.",
    "Saw your recent release on automated project velocity tracking; curious if engineering lead times across remote teams have tightened as a result.",
    "Given Linear's laser focus on high-craft product execution, I was curious how you currently eliminate friction in cross-team cycle reporting."
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [normalizedInput, setNormalizedInput] = useState<string>("https://linear.app");

  // Sync apiKey to localStorage
  const handleUpdateApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (typeof window !== "undefined") {
      localStorage.setItem("coldline_gemini_api_key", newKey);
    }
  };

  const handleGenerate = async (overrideTone?: ToneOption) => {
    const activeTone = overrideTone || tone;
    if (!input.trim()) {
      setErrorMessage("Please provide a prospect website URL or company description.");
      return;
    }

    const effectiveKey = apiKey.trim() || (typeof window !== "undefined" ? localStorage.getItem("coldline_gemini_api_key") || "" : "");
    if (!effectiveKey) {
      setErrorMessage("Please configure your Gemini API Key in Settings or the input box to generate icebreakers.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      // Direct client-side SDK call using @google/generative-ai
      const genAI = new GoogleGenerativeAI(effectiveKey);

      const prompt = `You are a world-class B2B sales copywriter specializing in cold email outreach.
Generate exactly 3 personalized, high-converting opening icebreaker sentences targeting this prospect:
"${input.trim()}"

Tone: ${activeTone}
Rules:
- 1-2 punchy sentences each.
- Reference specific relevance, observations, or value propositions without fluff.
- No generic openings (e.g. do NOT say "I hope you are doing well").
- Output ONLY a JSON array of 3 strings. Example format: ["Line 1", "Line 2", "Line 3"]`;

      let rawText = "";

      // Directly invoke requested model gemini-1.5-flash with fallback if deprecated in environment
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.7,
          },
        });
        const result = await model.generateContent(prompt);
        rawText = result.response.text();
      } catch (modelErr: any) {
        const errMsg = (modelErr?.message || "").toLowerCase();
        // If gemini-1.5-flash is not found (404/deprecated), fallback to active model
        if (errMsg.includes("404") || errMsg.includes("not found") || errMsg.includes("no longer available")) {
          const fallbackModel = genAI.getGenerativeModel({
            model: "gemini-3.5-flash",
            generationConfig: {
              temperature: 0.7,
            },
          });
          const fallbackResult = await fallbackModel.generateContent(prompt);
          rawText = fallbackResult.response.text();
        } else {
          throw modelErr;
        }
      }

      const parsed = parseIcebreakers(rawText);
      if (parsed.length === 0) {
        throw new Error("Unable to parse icebreakers from Gemini response. Please try again.");
      }

      setIcebreakers(parsed);
      const normalized = /^https?:\/\//i.test(input.trim()) ? input.trim() : "https://" + input.trim();
      setNormalizedInput(normalized);
    } catch (err: any) {
      console.error("Browser generation error:", err);
      let friendly = err?.message || "An error occurred while generating icebreakers.";
      const lower = friendly.toLowerCase();
      if (lower.includes("api_key_invalid") || lower.includes("api key not valid") || lower.includes("unauthorized") || lower.includes("400")) {
        friendly = "Invalid Gemini API Key. Please verify your API key in Settings.";
      } else if (lower.includes("429") || lower.includes("resource_exhausted") || lower.includes("quota")) {
        friendly = "Gemini API rate limit or quota exceeded. Please wait a moment before trying again.";
      } else if (lower.includes("404") || lower.includes("not found")) {
        friendly = "Gemini model not found (404). Please verify model availability.";
      }
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeToneAndRegenerate = (newTone: ToneOption) => {
    setTone(newTone);
    handleGenerate(newTone);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-visible">
      {/* Background Subtle Gradient Grid Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-900/15 via-purple-900/10 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Main Header */}
      <Header
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={Boolean(apiKey)}
        apiKeyPreview={apiKey}
      />

      {/* App Content */}
      <main className="flex-1 relative z-10 overflow-visible">
        <HeroInput
          input={input}
          setInput={setInput}
          tone={tone}
          setTone={setTone}
          apiKey={apiKey}
          setApiKey={handleUpdateApiKey}
          onGenerate={() => handleGenerate()}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />

        {/* Generated Icebreakers Results Section */}
        <OutputSection
          icebreakers={icebreakers}
          tone={tone}
          isLoading={isLoading}
          onRegenerate={() => handleGenerate()}
          onChangeTone={handleChangeToneAndRegenerate}
          normalizedInput={normalizedInput}
        />

        {/* 3-Step Guide / How To Use - Placed directly AFTER generated results */}
        <HowToUse onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-8 text-center text-xs text-zinc-400 relative z-10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">ColdLine AI</span>
            <span>—</span>
            <span>Micro-SaaS Cold Email Personalizer</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Configure API Key
            </button>
            <span>•</span>
            <span className="font-mono text-zinc-400">Google Gemini</span>
          </div>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleUpdateApiKey}
      />
    </div>
  );
}
