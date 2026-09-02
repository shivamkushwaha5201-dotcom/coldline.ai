import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { HeroInput } from "./components/HeroInput";
import { HowToUse } from "./components/HowToUse";
import { OutputSection } from "./components/OutputSection";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { ToneOption } from "./types";

const DEFAULT_KEY = "AQ.Ab8RN6L5QDp0kDnz4wAuLimYkPEWNUy_xh0v70fa-uHRIgqtog";

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

    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({
          input: input.trim(),
          tone: activeTone,
          apiKey: apiKey.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate icebreakers. Please try again.");
      }

      if (data.icebreakers && Array.isArray(data.icebreakers)) {
        setIcebreakers(data.icebreakers);
        if (data.normalizedInput) {
          setNormalizedInput(data.normalizedInput);
        }
      } else {
        throw new Error("Invalid response format received from AI personalizer.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setErrorMessage(err.message || "An error occurred while connecting to the AI personalizer.");
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
