"use client";

import React, { useState } from "react";

type ToneOption = "Casual" | "Professional" | "Direct" | "Witty";

const TONES: { id: ToneOption; label: string; desc: string }[] = [
  { id: "Professional", label: "Professional", desc: "Consultative & credible" },
  { id: "Casual", label: "Casual", desc: "Relaxed & peer-to-peer" },
  { id: "Direct", label: "Direct", desc: "Punchy & no-fluff" },
  { id: "Witty", label: "Witty", desc: "Clever & high-engagement" },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<ToneOption>("Professional");
  const [apiKey, setApiKey] = useState("AQ.Ab8RN6L5QDp0kDnz4wAuLimYkPEWNUy_xh0v70fa-uHRIgqtog");
  const [showApiKey, setShowApiKey] = useState(false);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, tone, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate icebreakers");
      }

      setIcebreakers(data.icebreakers || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
            Generate High-Converting Cold Email Icebreakers in Seconds
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Paste any company website URL or bio snippet to generate 3 personalized opening hooks that command attention.
          </p>
        </div>

        {/* Input Card */}
        <form
          onSubmit={handleGenerate}
          className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5 overflow-visible"
        >
          <div className="space-y-2">
            <label
              htmlFor="input"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Prospect's Website URL or Company Text / Bio
            </label>
            <textarea
              id="input"
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. stripe.com or 'Acme Corp is an automated compliance platform for fintechs...'"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                {loading ? "Analyzing & Generating..." : "Generate Icebreakers →"}
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
              <h2 className="text-lg font-bold text-white">Generated Icebreakers</h2>
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
                      {copiedIndex === idx ? "Copied!" : "Copy to Clipboard"}
                    </button>
                  </div>
                  <p className="text-zinc-200 text-sm leading-relaxed">"{line}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Use / 3-Step Guide (Positioned AFTER Results) */}
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
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Paste Prospect Info</h3>
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
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Choose Tone & Key</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Select your preferred tone (Casual, Direct, Professional) and ensure your Gemini API key is active.
              </p>
            </div>

            <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Step 03
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Generate & Copy</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click 'Generate Icebreakers' to instantly get 3 personalized email opening lines ready to copy.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
