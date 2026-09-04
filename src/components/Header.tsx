import React from "react";
import { Mail, Linkedin } from "lucide-react";

interface HeaderProps {
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  apiKeyPreview?: string;
}

export const DiscordIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    id="discord-icon-svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
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
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hidden sm:inline-block">
              Personalizer
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Secondary/Ghost Discord Community Button */}
          <a
            id="nav-discord-link"
            href="https://discord.gg/AYGswmwfG"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-[#5865F2]/40 transition-all duration-150 shadow-sm cursor-pointer"
            title="Join Discord Community / Share Feedback"
          >
            <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2] group-hover:scale-110 transition-transform duration-150" />
            <span className="hidden md:inline">Join Community</span>
            <span className="hidden xs:inline md:hidden">Discord</span>
          </a>

          {/* Official LinkedIn Button */}
          <a
            id="nav-linkedin-link"
            href="https://www.linkedin.com/company/coldlineai/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-[#0A66C2]/40 transition-all duration-150 shadow-sm cursor-pointer"
            title="Follow ColdLine AI on LinkedIn"
            aria-label="ColdLine AI LinkedIn Page"
          >
            <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] group-hover:scale-110 transition-transform duration-150" />
            <span className="hidden xs:inline">LinkedIn</span>
          </a>

          {/* API Key Manager Button */}
          <button
            id="nav-api-key-button"
            type="button"
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm cursor-pointer"
            title="Configure or Paste Gemini API Key"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-sans text-zinc-400">Key:</span>
            <span className="text-indigo-300 font-mono">
              {apiKeyPreview ? `${apiKeyPreview.slice(0, 6)}...${apiKeyPreview.slice(-4)}` : "Set Key"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
