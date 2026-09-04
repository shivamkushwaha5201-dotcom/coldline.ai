import React from "react";
import { Mail, ExternalLink, Key, Linkedin } from "lucide-react";
import { DiscordIcon } from "./Header";

interface FooterProps {
  onOpenApiKeyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenApiKeyModal }) => {
  return (
    <footer className="border-t border-zinc-900/90 bg-zinc-950/90 py-10 relative z-10 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pb-8 border-b border-zinc-900">
          {/* Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                ColdLine<span className="text-indigo-400">.ai</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
              Micro-SaaS cold outreach intelligence tool. Transforms company signals and user perspectives into 3 personalized, high-converting opening hooks.
            </p>
          </div>

          {/* Community & Connect Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Community & Connect
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  id="footer-discord-link"
                  href="https://discord.gg/AYGswmwfG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  <DiscordIcon className="w-4 h-4 text-[#5865F2] group-hover:scale-110 transition-transform" />
                  <span className="font-medium group-hover:underline underline-offset-4">
                    Join our Discord / Report Bugs
                  </span>
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </a>
              </li>
              <li>
                <a
                  id="footer-linkedin-link"
                  href="https://www.linkedin.com/company/coldlineai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-[#0A66C2] group-hover:scale-110 transition-transform" />
                  <span className="font-medium group-hover:underline underline-offset-4">
                    LinkedIn
                  </span>
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </a>
              </li>
              <li className="text-[11px] text-zinc-500 leading-normal pt-0.5">
                Connect with our team, get cold email frameworks, or share product feedback.
              </li>
            </ul>
          </div>

          {/* Configuration & Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Configuration & Engine
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="footer-api-key-config"
                  type="button"
                  onClick={onOpenApiKeyModal}
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Configure Gemini API Key</span>
                </button>
              </li>
              <li>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Google AI Studio Key Portal</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
              <li className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Powered by Gemini 2.5 Flash</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} ColdLine AI. High-converting pitch personalizer.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://discord.gg/AYGswmwfG"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2]" />
              <span>Discord</span>
            </a>
            <span>•</span>
            <a
              href="https://www.linkedin.com/company/coldlineai/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
