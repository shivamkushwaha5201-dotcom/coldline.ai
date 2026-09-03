import React, { useState, useEffect } from "react";
import { Copy, Check, RotateCw, Sparkles, MessageSquareText, Layers, Loader2, Eye, Zap, MessageCircle, User } from "lucide-react";
import { ToneOption, PitchOption } from "../types";
import { HOOK_TYPES, TONE_OPTIONS } from "../data/constants";

interface OutputSectionProps {
  pitches?: PitchOption[];
  icebreakers?: string[];
  tone: ToneOption;
  userPerspective?: string;
  isLoading: boolean;
  onRegenerate: () => void;
  onChangeTone: (newTone: ToneOption) => void;
  normalizedInput?: string;
}

const LOADING_STEPS = [
  "Scanning target prospect positioning & product signals...",
  "Analyzing your pitch perspective & context against target pain points...",
  "Synthesizing 3 tailored hooks (Observation, Direct Pitch, Soft Inquiry)...",
];

export const OutputSection: React.FC<OutputSectionProps> = ({
  pitches = [],
  icebreakers = [],
  tone,
  userPerspective,
  isLoading,
  onRegenerate,
  onChangeTone,
  normalizedInput,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [previewTemplateIndex, setPreviewTemplateIndex] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Normalize pitches: use pitches if available, else derive from icebreakers
  const displayPitches: PitchOption[] = pitches.length > 0
    ? pitches
    : icebreakers.map((line, idx) => {
        const hook = HOOK_TYPES[idx % HOOK_TYPES.length];
        return {
          hookType: hook.label,
          tagline: hook.tagline,
          pitch: line,
        };
      });

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

  const copyAllPitches = () => {
    const formatted = displayPitches
      .map((p, idx) => `[${p.hookType} - Option ${idx + 1}]:\n${p.pitch}`)
      .join("\n\n");
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => {
      setCopiedAll(false);
    }, 2000);
  };

  const getHookBadgeStyles = (hookType: string) => {
    const lower = hookType.toLowerCase();
    if (lower.includes("observation")) {
      return {
        badge: "bg-blue-500/10 text-blue-300 border-blue-500/30",
        indicator: "bg-blue-400",
        icon: <Eye className="w-3.5 h-3.5 text-blue-400" />,
        defaultTag: "Highlighting something specific about their recent work / presence",
      };
    }
    if (lower.includes("direct")) {
      return {
        badge: "bg-purple-500/10 text-purple-300 border-purple-500/30",
        indicator: "bg-purple-400",
        icon: <Zap className="w-3.5 h-3.5 text-purple-400" />,
        defaultTag: "Directly connecting your offer to a problem they might face",
      };
    }
    return {
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      indicator: "bg-emerald-400",
      icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />,
      defaultTag: "A low-friction opening question to start a conversation",
    };
  };

  if (!isLoading && displayPitches.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-3xl mx-auto px-4 pb-10 space-y-5 overflow-visible">
      {/* Header bar of results */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center flex-wrap gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-white font-sans">
            Personalized Pitch Options <span className="text-zinc-400 font-normal font-mono text-xs">({displayPitches.length || 3})</span>
          </h2>
          {userPerspective && (
            <span
              className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 font-medium border border-zinc-700/60 flex items-center gap-1.5 max-w-[200px] truncate"
              title={userPerspective}
            >
              <User className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              <span className="truncate">{userPerspective}</span>
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-zinc-700/60">
            {tone} Tone
          </span>
        </div>

        {/* Global actions: Copy All & Regenerate */}
        <div className="flex items-center gap-2">
          {displayPitches.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={copyAllPitches}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer shadow-sm"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">All Copied!</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy All Pitches</span>
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
                      Gemini Outreach Intelligence
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Analyzing
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
              className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-3.5 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-zinc-800 rounded" />
                  <div className="h-5 w-32 bg-zinc-800 rounded-lg" />
                  <div className="h-4 w-48 bg-zinc-800/60 rounded hidden md:block" />
                </div>
                <div className="h-8 w-24 bg-zinc-800 rounded-lg" />
              </div>
              <div className="h-16 bg-zinc-950/80 rounded-xl border border-zinc-800/50 p-4 space-y-2">
                <div className="h-3.5 bg-zinc-800 rounded w-11/12" />
                <div className="h-3.5 bg-zinc-800/70 rounded w-4/5" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-40 bg-zinc-800/50 rounded" />
                <div className="h-3 w-16 bg-zinc-800/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generated Pitch Options Cards */}
      {!isLoading && displayPitches.length > 0 && (
        <div className="space-y-4">
          {displayPitches.map((item, index) => {
            const hookStyle = getHookBadgeStyles(item.hookType);
            const isCopied = copiedIndex === index;
            const wordCount = item.pitch.trim().split(/\s+/).length;

            return (
              <div
                key={index}
                className="group relative rounded-2xl bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 p-5 sm:p-6 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/5 backdrop-blur-sm"
              >
                {/* Card Top Metadata & Hook Classification */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/20">
                      #{index + 1}
                    </span>

                    {/* Hook Type Pill */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${hookStyle.badge}`}>
                      {hookStyle.icon}
                      <span>{item.hookType}</span>
                    </div>

                    <span className="hidden md:inline text-xs text-zinc-400">
                      • {item.tagline || hookStyle.defaultTag}
                    </span>
                  </div>

                  {/* Prominent "Copy Pitch" Button */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.pitch, index)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm self-start sm:self-auto ${
                      isCopied
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-zinc-800/90 hover:bg-indigo-600 text-zinc-200 hover:text-white border border-zinc-700/80 hover:border-indigo-500"
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
                        <span>Copy Pitch</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Pitch Content */}
                <div className="bg-zinc-950/70 rounded-xl p-4 sm:p-5 border border-zinc-800/80 mb-3">
                  <p className="text-zinc-100 text-sm sm:text-base font-normal leading-relaxed selection:bg-indigo-500/40">
                    "{item.pitch}"
                  </p>
                </div>

                {/* Bottom Card Utility: Expandable Context Drawer & Word Count */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewTemplateIndex(previewTemplateIndex === index ? null : index)
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
                  >
                    <MessageSquareText className="w-3.5 h-3.5" />
                    <span>
                      {previewTemplateIndex === index
                        ? "Hide full email / DM template"
                        : "Preview in complete cold outreach template"}
                    </span>
                  </button>

                  <span className="text-[11px] font-mono text-zinc-400">
                    ~{wordCount} words
                  </span>
                </div>

                {/* Full Cold Message Preview Drawer */}
                {previewTemplateIndex === index && (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-indigo-500/30 text-xs font-mono text-zinc-300 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400 text-[11px]">
                      <span>Ready Template • {item.hookType}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const fullEmail = `Hi [First Name],\n\n${item.pitch}\n\nWould you be open to a brief 5-minute chat or seeing a quick concept?\n\nBest,\n[Your Name]`;
                          navigator.clipboard.writeText(fullEmail);
                          setCopiedIndex(index);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                      >
                        Copy Full Template
                      </button>
                    </div>
                    <div className="text-zinc-400">Hi [First Name],</div>
                    <div className="text-indigo-200 bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/20 font-sans text-sm leading-relaxed">
                      {item.pitch}
                    </div>
                    <div className="text-zinc-400">Would you be open to a brief 5-minute chat or seeing a quick concept?</div>
                    <div className="text-zinc-400">Best, <br />[Your Name]</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tone Quick Switcher Pill Bar */}
      {!isLoading && displayPitches.length > 0 && (
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-zinc-400 font-medium">Want to experiment with a different tone of voice?</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeTone(t.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
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
