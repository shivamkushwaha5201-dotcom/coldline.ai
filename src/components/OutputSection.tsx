import React, { useState, useEffect } from "react";
import { Copy, Check, RotateCw, Sparkles, Send, CheckCircle2, MessageSquareText, Layers, BrainCircuit, Loader2 } from "lucide-react";
import { ToneOption } from "../types";
import { HOOK_TYPES, TONE_OPTIONS } from "../data/constants";

interface OutputSectionProps {
  icebreakers: string[];
  tone: ToneOption;
  isLoading: boolean;
  onRegenerate: () => void;
  onChangeTone: (newTone: ToneOption) => void;
  normalizedInput?: string;
}

const LOADING_STEPS = [
  "Scanning prospect context & positioning signals...",
  "Filtering out generic buzzwords & spam phrases...",
  "Synthesizing 3 personalized high-conversion hooks...",
];

export const OutputSection: React.FC<OutputSectionProps> = ({
  icebreakers,
  tone,
  isLoading,
  onRegenerate,
  onChangeTone,
  normalizedInput,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [previewTemplateIndex, setPreviewTemplateIndex] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setActiveStep(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1100);
    return () => clearInterval(interval);
  }, [isLoading]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const copyAllIcebreakers = () => {
    const formatted = icebreakers
      .map((line, idx) => `[Option ${idx + 1}]:\n${line}`)
      .join("\n\n");
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => {
      setCopiedAll(false);
    }, 2000);
  };

  if (!isLoading && icebreakers.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-3xl mx-auto px-4 pb-8 space-y-5 overflow-visible">
      {/* Header bar of results */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-base font-bold text-white font-sans">
            Personalized Icebreakers <span className="text-zinc-400 font-normal font-mono text-xs">({icebreakers.length || 3})</span>
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-zinc-700/60">
            {tone} Tone
          </span>
        </div>

        {/* Global actions: Regenerate & Copy All */}
        <div className="flex items-center gap-2">
          {icebreakers.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={copyAllIcebreakers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">All Copied!</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RotateCw className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Rich AI Loading Animation */}
      {isLoading && (
        <div className="space-y-4">
          {/* Active Generation Status Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/90 border border-indigo-500/40 p-4 shadow-xl backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse" />
            
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 flex-shrink-0">
                  <span className="absolute inset-0 rounded-xl bg-indigo-500/30 animate-ping opacity-60" />
                  <Sparkles className="w-4 h-4 text-indigo-300 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Gemini 2.5 Flash Engine
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Generating
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/90 font-medium transition-all duration-300 flex items-center gap-1.5 mt-0.5">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    <span>{LOADING_STEPS[activeStep]}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[11px] font-mono text-zinc-400">Tone:</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700">
                  {tone}
                </span>
              </div>
            </div>

            {/* Shimmer progress bar */}
            <div className="relative mt-3.5 h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${((activeStep + 1) / LOADING_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Shimmering Skeleton Cards */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 sm:p-6 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-7 bg-zinc-800 rounded-md animate-pulse" />
                  <div className="h-4 w-28 bg-zinc-800 rounded-md animate-pulse" />
                  <div className="hidden sm:block h-3 w-40 bg-zinc-850 rounded animate-pulse" />
                </div>
                <div className="h-7 w-16 bg-zinc-800 rounded-lg animate-pulse" />
              </div>

              {/* Shimmering Text Lines */}
              <div className="bg-zinc-950/70 rounded-xl p-4 border border-zinc-850 space-y-2.5">
                <div className="h-4 w-full bg-zinc-800/90 rounded-md animate-pulse" />
                <div className="h-4 w-5/6 bg-zinc-800/70 rounded-md animate-pulse" />
                <div className="h-4 w-3/5 bg-zinc-800/50 rounded-md animate-pulse" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="h-3 w-36 bg-zinc-850 rounded animate-pulse" />
                <div className="h-3 w-20 bg-zinc-850 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Icebreaker Cards */}
      {!isLoading && icebreakers.length > 0 && (
        <div className="space-y-4">
          {icebreakers.map((line, index) => {
            const hook = HOOK_TYPES[index % HOOK_TYPES.length];
            const isCopied = copiedIndex === index;

            return (
              <div
                key={index}
                className="group relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700/90 p-5 sm:p-6 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/5 backdrop-blur-sm"
              >
                {/* Card Top Metadata */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/20">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300">
                      {hook.label}
                    </span>
                    <span className="hidden sm:inline text-xs text-zinc-400">• {hook.desc}</span>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(line, index)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                      isCopied
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-zinc-800/80 hover:bg-indigo-600 text-zinc-200 hover:text-white border border-zinc-700/80 hover:border-indigo-500"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Icebreaker Content */}
                <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/70 mb-3">
                  <p className="text-zinc-100 text-sm sm:text-base font-normal leading-relaxed selection:bg-indigo-500/40">
                    "{line}"
                  </p>
                </div>

                {/* Bottom Card Utility: Expandable Cold Email Framework */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewTemplateIndex(previewTemplateIndex === index ? null : index)
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    <MessageSquareText className="w-3.5 h-3.5" />
                    <span>
                      {previewTemplateIndex === index
                        ? "Hide full email context"
                        : "Preview in ready cold email template"}
                    </span>
                  </button>

                  <span className="text-[11px] font-mono text-zinc-400">
                    ~{line.split(" ").length} words
                  </span>
                </div>

                {/* Full Cold Email Preview Drawer */}
                {previewTemplateIndex === index && (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-indigo-500/30 text-xs font-mono text-zinc-300 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400 text-[11px]">
                      <span>Subject: Quick question about your workflow at [Company]</span>
                      <button
                        type="button"
                        onClick={() => {
                          const fullEmail = `Hi [First Name],\n\n${line}\n\nWe recently helped a similar team cut outbound cycle times by 40% using automated workflow triggers.\n\nOpen to a brief 5-minute chat on Thursday?\n\nBest,\n[Your Name]`;
                          navigator.clipboard.writeText(fullEmail);
                          setCopiedIndex(index);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Copy Full Email
                      </button>
                    </div>
                    <div className="text-zinc-400">Hi [First Name],</div>
                    <div className="text-indigo-200 bg-indigo-950/30 p-2 rounded border border-indigo-500/20 font-sans text-sm">
                      {line}
                    </div>
                    <div className="text-zinc-400">
                      We recently helped a similar team cut outbound cycle times by 40% using automated workflow triggers.
                    </div>
                    <div className="text-zinc-400">Open to a brief 5-minute chat on Thursday?</div>
                    <div className="text-zinc-400">Best, <br />[Your Name]</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tone Quick Switcher Pill Bar */}
      {!isLoading && icebreakers.length > 0 && (
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-zinc-400 font-medium">Want to experiment with a different style?</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeTone(t.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  tone === t.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
