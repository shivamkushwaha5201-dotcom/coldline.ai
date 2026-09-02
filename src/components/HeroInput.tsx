import React, { useState } from "react";
import { Globe, FileText, Sparkles, ArrowRight, Loader2, Compass, Key, Eye, EyeOff, Check, ExternalLink } from "lucide-react";
import { ToneOption } from "../types";
import { TONE_OPTIONS, SAMPLE_PRESETS } from "../data/constants";

interface HeroInputProps {
  input: string;
  setInput: (value: string) => void;
  tone: ToneOption;
  setTone: (tone: ToneOption) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  input,
  setInput,
  tone,
  setTone,
  apiKey,
  setApiKey,
  onGenerate,
  isLoading,
  errorMessage,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiKeyField, setShowApiKeyField] = useState(false);

  // Auto-detect if input is a URL or text bio
  const isUrl = /^https?:\/\//i.test(input.trim()) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(input.trim());

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onGenerate();
      }
    }
  };

  const currentToneMeta = TONE_OPTIONS.find((t) => t.id === tone) || TONE_OPTIONS[0];

  return (
    <section className="w-full max-w-3xl mx-auto pt-10 pb-8 px-4 overflow-visible">
      {/* Hero Heading */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 font-medium shadow-inner">
          <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>Cold Outreach Intelligence</span>
          <span className="text-zinc-600">/</span>
          <span className="text-indigo-400">Powered by Gemini 2.5 Flash</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-sans">
          Generate High-Converting Cold Email Icebreakers in Seconds
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
          Transform any company domain or founder bio into 3 hyper-personalized, non-spammy opening hooks proven to increase reply rates.
        </p>
      </div>

      {/* Main Input Form Container - Vercel / Linear inspired card */}
      <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-800/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 transition-all overflow-visible">
        {/* Sample preset pills */}
        <div className="flex items-center flex-wrap gap-2 mb-4 pb-4 border-b border-zinc-800/80">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mr-1">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            Quick Try:
          </span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setInput(preset.url);
                setTone(preset.tone);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50 hover:border-indigo-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="font-semibold">{preset.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono">({preset.url})</span>
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isLoading && input.trim()) {
              onGenerate();
            }
          }}
          className="space-y-4"
        >
          {/* Main Input Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="prospectInput" className="text-xs font-semibold text-zinc-300 tracking-wide uppercase flex items-center gap-1.5">
                {isUrl ? <Globe className="w-3.5 h-3.5 text-indigo-400" /> : <FileText className="w-3.5 h-3.5 text-indigo-400" />}
                Prospect Website URL or Company Text / Bio
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {input.length > 0 ? `${input.length} chars` : "Press ⌘+Enter to run"}
              </span>
            </div>

            <div className="relative">
              <textarea
                id="prospectInput"
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. acme.com or 'Acme provides autonomous logistics software for refrigerated supply chains, recently raised Series A...'"
                className="w-full rounded-xl bg-zinc-950/90 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-sans resize-y min-h-[90px]"
              />
            </div>
          </div>

          {/* Gemini API Key Input Field (Configured from .env.local or UI Paste) */}
          <div className="pt-1 pb-1">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="uiApiKeyInput" className="text-xs font-semibold text-zinc-300 tracking-wide uppercase flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Gemini API Key
                <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  saved in .env.local
                </span>
              </label>
              <div className="flex items-center gap-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span className="text-zinc-700">•</span>
                <button
                  type="button"
                  onClick={() => setShowApiKeyField(!showApiKeyField)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  {showApiKeyField ? "Hide Key Field" : "Edit / Change Key"}
                </button>
              </div>
            </div>

            {showApiKeyField ? (
              <div className="relative">
                <input
                  id="uiApiKeyInput"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Gemini API key (e.g. AQ.Ab8RN6...)"
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 pr-10 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  title={showApiKey ? "Hide key" : "Show key"}
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950/60 border border-zinc-850 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-zinc-300">
                    {apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-6)}` : "No key set"}
                  </span>
                  <span className="text-[11px] text-emerald-400/80 font-medium">Ready</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeyField(true)}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer underline underline-offset-2"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Controls Bar: Tone Selector Horizontal Pills & CTA Button */}
          <div className="space-y-4 pt-1 overflow-visible">
            {/* Tone Selector Horizontal Pill Buttons */}
            <div className="space-y-1.5 overflow-visible">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Tone of Voice
                </label>
                <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
                  {currentToneMeta.description}
                </span>
              </div>

              {/* Horizontal Pill Buttons in a single row with flex flex-wrap md:flex-nowrap gap-2 */}
              <div className="flex flex-wrap md:flex-nowrap items-stretch gap-2 overflow-visible">
                {TONE_OPTIONS.map((t) => {
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
                      title={t.description}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          isSelected ? "bg-white" : "bg-zinc-500"
                        }`}
                      />
                      <span className="whitespace-nowrap">{t.label}</span>
                      <span
                        className={`text-[10px] font-normal font-mono hidden xl:inline ${
                          isSelected ? "text-indigo-200" : "text-zinc-500"
                        }`}
                      >
                        ({t.badge})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prominent CTA Button Row */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 overflow-visible">
              <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>Generates 3 personalized, high-converting opening hooks</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="relative group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex-shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing & Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Icebreakers</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error message banner if present */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
};
