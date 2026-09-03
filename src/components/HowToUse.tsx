import React from "react";
import { Link2, Sparkles, Zap, ExternalLink, Key } from "lucide-react";

interface HowToUseProps {
  onOpenApiKeyModal?: () => void;
}

export const HowToUse: React.FC<HowToUseProps> = ({ onOpenApiKeyModal }) => {
  const steps = [
    {
      stepNumber: "01",
      title: "Target Company or Founder",
      description: "Enter the prospect's website URL, LinkedIn bio, or recent announcement text.",
      icon: Link2,
      accentColor: "text-indigo-400",
      bgBadge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      stepNumber: "02",
      title: "Your Pitch Perspective",
      description: "Describe what you offer and your goal (e.g., short-form video editor, Next.js dev, B2B sales).",
      icon: Sparkles,
      accentColor: "text-purple-400",
      bgBadge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      stepNumber: "03",
      title: "Generate Tailored Hooks",
      description: "Instantly receive 3 personalized hooks: Observation, Direct Pitch, and Soft Inquiry ready to copy.",
      icon: Zap,
      accentColor: "text-emerald-400",
      bgBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <section className="w-full max-w-3xl mx-auto px-4 mt-8 mb-12 overflow-visible" aria-label="How to use ColdLine AI guide">
      <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800/70 p-5 backdrop-blur-md overflow-visible">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              How to Use ColdLine AI • 3-Step Guide
            </h2>
          </div>

          {/* External Key helper link */}
          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Get Free Gemini Key</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
            {onOpenApiKeyModal && (
              <>
                <span className="text-zinc-700">|</span>
                <button
                  type="button"
                  onClick={onOpenApiKeyModal}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Configure Key
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {steps.map((s) => {
            const IconComponent = s.icon;
            return (
              <div
                key={s.stepNumber}
                className="group relative rounded-xl bg-zinc-950/60 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 p-4 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${s.bgBadge}`}
                    >
                      Step {s.stepNumber}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      <IconComponent className={`w-3.5 h-3.5 ${s.accentColor}`} />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors mb-1.5">
                    {s.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
