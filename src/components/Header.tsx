import React from "react";
import { Mail, Code2, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

interface HeaderProps {
  onOpenCodeModal: () => void;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  apiKeyPreview?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCodeModal,
  onOpenApiKeyModal,
  hasApiKey,
  apiKeyPreview,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white font-sans">
              ColdLine<span className="text-indigo-400">.ai</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Personalizer
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* API Key Manager Button */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm cursor-pointer"
            title="Configure or Paste Gemini API Key"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-sans text-zinc-400">Key:</span>
            <span className="text-indigo-300 font-mono">
              {apiKeyPreview ? `${apiKeyPreview.slice(0, 6)}...${apiKeyPreview.slice(-4)}` : "Set Key"}
            </span>
          </button>

          {/* Next.js Code Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenCodeModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Next.js Code & Setup</span>
            <span className="sm:hidden">Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
