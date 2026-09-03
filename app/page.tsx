"use client";

import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// WARNING: Client-side Gemini API call requested by user. Exposing API keys in client-side code is acceptable when explicitly requested with client-provided keys.

type ToneOption = "Casual" | "Professional" | "Direct" | "Witty";

const TONES: { id: ToneOption; label: string; desc: string }[] = [
  { id: "Professional", label: "Professional", desc: "Consultative & credible" },
  { id: "Casual", label: "Casual", desc: "Relaxed & peer-to-peer" },
  { id: "Direct", label: "Direct", desc: "Punchy & no-fluff" },
  { id: "Witty", label: "Witty", desc: "Clever & high-engagement" },
];

function parseIcebreakers(rawText: string): string[] {
  try {
    const cleaned = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => {
        if (typeof item === "object" && item !== null) {
          return item.pitch || item.text || JSON.stringify(item);
        }
        return String(item).trim();
      }).filter(Boolean);
    }
  } catch {
    const match = rawText.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => {
            if (typeof item === "object" && item !== null) {
              return item.pitch || item.text || JSON.stringify(item);
            }
            return String(item).trim();
          }).filter(Boolean);
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

export default function Home() {
  const [input, setInput] = useState("");
  const [userPerspective, setUserPerspective] = useState("");
  const [tone, setTone] = useState<ToneOption>("Professional");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const effectiveKey = apiKey.trim() || (typeof window !== "undefined" ? localStorage.getItem("coldline_gemini_api_key") || "" : "");
    if (!effectiveKey) {
      setError("Please enter your Gemini API Key in the field below to generate pitches.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Direct client-side call to @google/generative-ai SDK from the browser
      const genAI = new GoogleGenerativeAI(effectiveKey);

      const targetData = input.trim();
      const perspective = userPerspective.trim() || "I provide high-impact services and help growth teams scale.";

      const prompt = `You are an expert cold outreach strategist. Read the target founder/company details (${targetData}) and the user's specific background and goal (${perspective}). Generate 3 highly personalized, high-converting cold outreach hooks that directly bridge the user's offered value to the target's specific business context.

Target Founder / Company Details:
"${targetData}"

User's Specific Background and Goal:
"${perspective}"

Tone requested: ${tone}

Generate 3 custom pitch options:
1. "Observation Hook": Highlighting something specific about their recent posts/company work.
2. "Direct Pitch Hook": Directly connecting user's service/skill to a problem the company might be facing.
3. "Soft Inquiry Hook": A low-friction opening question to start a conversation.

Return strictly a valid JSON array of 3 strings containing each generated hook.
Example: ["Hook 1...", "Hook 2...", "Hook 3..."]`;

      let rawText = "";

      // Directly invoke requested model gemini-1.5-flash with fallback if deprecated
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
        throw new Error("Unable to parse pitch hooks from Gemini response. Please try again.");
      }

      setIcebreakers(parsed);
    } catch (err: any) {
      console.error("Client generation error:", err);
      let friendly = err?.message || "Failed to generate pitches.";
      const lower = friendly.toLowerCase();
      if (lower.includes("api_key_invalid") || lower.includes("api key not valid") || lower.includes("unauthorized") || lower.includes("400")) {
        friendly = "Invalid Gemini API key. Please check that your key is correct and active.";
      } else if (lower.includes("429") || lower.includes("resource_exhausted") || lower.includes("quota")) {
        friendly = "Gemini API rate limit or quota exceeded. Please wait a moment or use an active key.";
      } else if (lower.includes("404") || lower.includes("not found")) {
        friendly = "Gemini model not found (404). Please verify model availability.";
      }
      setError(friendly);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              C
            </div>
            <span className="font-bold text-lg text-white">
              ColdLine<span className="text-indigo-400">.ai</span>
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
            Gemini 2.5 Flash
          </span>
        </div>
      </header>

      {/* Hero & Input Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10 overflow-visible">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Tailored Cold Outreach & Pitch Personalizer
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Paste any company website URL or bio snippet along with your unique background and perspective to generate 3 high-converting hooks.
          </p>
        </div>

        {/* Input Card */}
        <form
          onSubmit={handleGenerate}
          className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5 overflow-visible"
        >
          {/* Target Company / Founder Link or Info */}
          <div className="space-y-2">
            <label
              htmlFor="targetDataInput"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Target Company / Founder Link or Info
            </label>
            <textarea
              id="targetDataInput"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. stripe.com or 'Acme Corp is an automated compliance platform for fintechs...'"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Your Pitch Perspective & Context Field */}
          <div className="space-y-2">
            <label
              htmlFor="userPerspectiveInput"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Your Pitch Perspective & Context
            </label>
            <textarea
              id="userPerspectiveInput"
              rows={3}
              value={userPerspective}
              onChange={(e) => setUserPerspective(e.target.value)}
              placeholder="e.g., I'm a short-form video editor and I want to pitch them on re-editing their podcast clips for TikTok and Reels to boost engagement."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[85px]"
            />
          </div>

          {/* Gemini API Key Input Field */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="apiKeyInput"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"
              >
                <span>Gemini API Key</span>
                <span className="text-[10px] text-zinc-500 font-mono normal-case">(.env.local or paste here)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                {showApiKey ? "Hide Key" : "Show Key"}
              </button>
            </div>
            <input
              id="apiKeyInput"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API key (e.g. AQ.Ab8RN6...)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tone Selector Horizontal Pill Buttons & Action Row */}
          <div className="space-y-4 pt-1 overflow-visible">
            <div className="space-y-1.5 overflow-visible">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tone of Voice
              </label>
              <div className="flex flex-wrap md:flex-nowrap items-stretch gap-2 overflow-visible">
                {TONES.map((t) => {
                  const isSelected = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`flex-1 min-w-[120px] md:min-w-0 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40"
                          : "bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"
                      }`}
                      title={t.desc}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          isSelected ? "bg-white" : "bg-zinc-500"
                        }`}
                      />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                {loading ? "Analyzing Target & Context..." : "Generate Tailored Pitches →"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}
        </form>

        {/* Results Section */}
        {icebreakers.length > 0 && (
          <div className="space-y-4 pt-4 overflow-visible">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Generated Pitch Hooks</h2>
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium cursor-pointer"
              >
                Regenerate
              </button>
            </div>

            <div className="grid gap-4">
              {icebreakers.map((line, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      Option {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(line, idx)}
                      className="text-xs px-3 py-1 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedIndex === idx ? "Copied!" : "Copy Hook"}
                    </button>
                  </div>
                  <p className="text-zinc-200 text-sm leading-relaxed">"{line}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Use / 3-Step Guide */}
        <section className="rounded-2xl bg-zinc-900/40 border border-zinc-800/70 p-5 backdrop-blur-md overflow-visible">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                How to Use ColdLine AI • 3-Step Guide
              </h2>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <span>Get Free Gemini Key ↗</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  Step 01
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Target Info</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enter your prospect's website URL, LinkedIn post, or company bio.
              </p>
            </div>

            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border bg-purple-500/10 text-purple-400 border-purple-500/20">
                  Step 02
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Your Pitch Perspective</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Describe your unique service, context, or goal in the flexible perspective textarea.
              </p>
            </div>

            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Step 03
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Generate Tailored Hooks</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Instantly get 3 personalized cold outreach hooks designed to maximize reply rates.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
