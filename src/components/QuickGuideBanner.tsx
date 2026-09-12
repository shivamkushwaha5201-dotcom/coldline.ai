import React, { useState, useEffect } from "react";
import { Sparkles, ExternalLink, Key, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

interface QuickGuideBannerProps {
  onOpenApiKeyModal?: () => void;
}

export const QuickGuideBanner: React.FC<QuickGuideBannerProps> = ({ onOpenApiKeyModal }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("coldline_guide_collapsed") === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("coldline_guide_collapsed", String(next));
    }
  };

  return (
    <div
      id="quick-guide-banner"
      className="w-full rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-zinc-900/70 p-4 sm:p-5 backdrop-blur-md mb-8 shadow-xl shadow-indigo-950/20 ring-1 ring-indigo-500/10 transition-all duration-200"
    >
      {/* Banner Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              How to use ColdLine AI
            </h2>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Quick Guide
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="quick-guide-toggle-btn"
            type="button"
            onClick={toggleCollapse}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            aria-expanded={!isCollapsed}
          >
            <span>{isCollapsed ? "Show Steps" : "Hide Guide"}</span>
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Steps Content */}
      {!isCollapsed && (
        <div className="mt-4 pt-4 border-t border-indigo-500/15 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Step 1 */}
            <div className="relative rounded-xl bg-zinc-950/70 border border-indigo-500/20 p-3.5 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono border border-indigo-500/40">
                    1
                  </span>
                  <span className="text-[10px] text-emerald-400/90 font-medium font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Free & Instant
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-zinc-200">
                  Get Free Gemini API Key
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Generate your free Google Gemini API Key directly from Google AI Studio.
                </p>
              </div>

              <div className="pt-2.5 mt-1 border-t border-zinc-850">
                <a
                  id="guide-gemini-portal-link"
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  <Key className="w-3 h-3" />
                  <span>Google AI Studio Key Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-xl bg-zinc-950/70 border border-indigo-500/20 p-3.5 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold font-mono border border-purple-500/40">
                    2
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Private & Local
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-zinc-200">
                  Paste Key in Top Right
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Paste your API Key in the top right <strong className="text-zinc-300 font-mono">Key</strong> input field. It stays safely stored only on your device.
                </p>
              </div>

              <div className="pt-2.5 mt-1 border-t border-zinc-850">
                {onOpenApiKeyModal ? (
                  <button
                    type="button"
                    onClick={onOpenApiKeyModal}
                    className="inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors cursor-pointer"
                  >
                    <span>Open Key Settings</span>
                    <span className="text-[10px] text-zinc-500">→</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Look for "Key:" in header
                  </span>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-xl bg-zinc-950/70 border border-indigo-500/20 p-3.5 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono border border-emerald-500/40">
                    3
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    3 Custom Hooks
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-zinc-200">
                  Enter Details & Generate
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter your target company link and your background details, then click <strong>Generate</strong> to get 3 personalized pitches.
                </p>
              </div>

              <div className="pt-2.5 mt-1 border-t border-zinc-850">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <span>Observation, Direct & Soft angles</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
