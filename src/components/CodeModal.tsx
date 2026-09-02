import React, { useState } from "react";
import { X, Copy, Check, FileCode, Terminal, Key } from "lucide-react";

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"page" | "route" | "env">("page");
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopied(tabKey);
    setTimeout(() => setCopied(null), 2000);
  };

  const pageCode = `'use client';

import { useState } from 'react';

type ToneOption = 'Casual' | 'Professional' | 'Direct' | 'Witty';

const TONES: { id: ToneOption; label: string; desc: string }[] = [
  { id: 'Professional', label: 'Professional', desc: 'Consultative & credible' },
  { id: 'Casual', label: 'Casual', desc: 'Relaxed & peer-to-peer' },
  { id: 'Direct', label: 'Direct', desc: 'Punchy & no-fluff' },
  { id: 'Witty', label: 'Witty', desc: 'Clever & high-engagement' },
];

export default function Home() {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState<ToneOption>('Professional');
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
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, tone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate icebreakers');
      }

      setIcebreakers(data.icebreakers || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
            <span className="font-bold text-lg text-white">ColdLine<span className="text-indigo-400">.ai</span></span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
            Gemini 2.5 Flash
          </span>
        </div>
      </header>

      {/* Hero & Input Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Generate High-Converting Cold Email Icebreakers in Seconds
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Paste any company website URL or bio snippet to generate 3 personalized opening hooks that command attention.
          </p>
        </div>

        {/* Input Card */}
        <form onSubmit={handleGenerate} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="space-y-2">
            <label htmlFor="input" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <label htmlFor="toneSelect" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tone of Voice
              </label>
              <select
                id="toneSelect"
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneOption)}
                className="bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                {TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} ({t.desc})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/25 self-end"
            >
              {loading ? 'Analyzing & Generating...' : 'Generate Icebreakers →'}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}
        </form>

        {/* Results Section */}
        {icebreakers.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Generated Icebreakers</h2>
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium"
              >
                Regenerate
              </button>
            </div>

            <div className="grid gap-4">
              {icebreakers.map((line, idx) => (
                <div key={idx} className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">Option {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(line, idx)}
                      className="text-xs px-3 py-1 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white transition-colors"
                    >
                      {copiedIndex === idx ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                  <p className="text-zinc-200 text-sm leading-relaxed">"{line}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}`;

  const routeCode = `import { GoogleGenAI, Type } from '@google/genai';

function normalizeUrlOrText(input: string): string {
  const trimmed = input.trim();
  const isUrlLike = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed);
  if (isUrlLike && !/^https?:\/\//i.test(trimmed)) {
    return \`https://\${trimmed}\`;
  }
  return trimmed;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { input, tone = 'Professional' } = body;

    if (!input || typeof input !== 'string' || !input.trim()) {
      return Response.json(
        { error: 'Please provide a valid prospect website URL or company description.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error: 'Gemini API key is missing. Please set GEMINI_API_KEY in your .env.local file.',
        },
        { status: 500 }
      );
    }

    const normalizedInput = normalizeUrlOrText(input);

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = \`You are a world-class B2B cold email copywriter and outbound sales strategist.
Analyze the provided prospect input (website URL or company description).
Return EXACTLY a valid JSON array containing 3 distinct, short (1-2 sentences max), highly relevant cold email opening lines tailored to that company/person.

Tone: \${tone}.
Format: Return ONLY a JSON array of 3 string items, e.g. ["line 1", "line 2", "line 3"].\`;

    const userPrompt = \`Prospect / Company Input:
"""
\${normalizedInput}
"""

Tone requested: \${tone}

Generate 3 high-converting cold email opening icebreakers now.\`;

    let rawText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          temperature: 0.7,
        },
      });
      rawText = response.text || '';
    } catch (err) {
      // Fallback if needed
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          temperature: 0.7,
        },
      });
      rawText = fallbackResponse.text || '';
    }

    const icebreakers: string[] = JSON.parse(rawText.trim());

    return Response.json({
      success: true,
      icebreakers: icebreakers.slice(0, 3),
      tone,
      normalizedInput,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return Response.json(
      { error: error?.message || 'Failed to generate icebreakers.' },
      { status: 500 }
    );
  }
}`;

  const envCode = `# .env.local
# Obtain your API key from https://aistudio.google.com/app/apikey
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Instructions:
# 1. Create a file named .env.local in the root directory of your Next.js project.
# 2. Add your Gemini API key as shown above.
# 3. Next.js automatically loads .env.local in development and production.
# 4. Never commit .env.local to Git (ensure .env*.local is listed in your .gitignore).`;

  const activeContent =
    activeTab === "page" ? pageCode : activeTab === "route" ? routeCode : envCode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Next.js App Router Export Files</h3>
              <p className="text-xs text-zinc-400">Complete, ready-to-copy source code for your Next.js project</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-zinc-950/60 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("page")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeTab === "page"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              app/page.tsx
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("route")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeTab === "route"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              app/api/generate/route.ts
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("env")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeTab === "env"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              .env.local Setup
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(activeContent, activeTab)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors shadow-sm"
          >
            {copied === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code View Area */}
        <div className="flex-1 overflow-auto p-4 bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed selection:bg-indigo-500/40">
          <pre className="whitespace-pre">
            <code>{activeContent}</code>
          </pre>
        </div>

        {/* Modal Footer Info */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Requires: <code className="text-indigo-400">@google/genai</code> in Next.js 14/15 App Router</span>
          <span>Click Copy Code to paste into your Next.js project</span>
        </div>
      </div>
    </div>
  );
};
