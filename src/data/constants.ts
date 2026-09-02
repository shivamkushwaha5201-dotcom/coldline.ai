import { ToneMeta, SamplePreset } from "../types";

export const TONE_OPTIONS: ToneMeta[] = [
  {
    id: "Professional",
    label: "Professional",
    description: "Credible, consultative, polished for senior enterprise execs",
    badge: "Consultative",
    iconName: "Briefcase",
  },
  {
    id: "Casual",
    label: "Casual",
    description: "Friendly, peer-to-peer, relaxed & zero corporate jargon",
    badge: "Peer-to-Peer",
    iconName: "Smile",
  },
  {
    id: "Direct",
    label: "Direct",
    description: "Straight to the bottom line, problem-first & punchy",
    badge: "No Fluff",
    iconName: "Zap",
  },
  {
    id: "Witty",
    label: "Witty",
    description: "Clever, engaging observation that cuts through inbox fatigue",
    badge: "High-Engagement",
    iconName: "Sparkles",
  },
];

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    name: "Linear",
    url: "linear.app",
    tagline: "Purpose-built project management tool for modern software teams",
    tone: "Casual",
  },
  {
    name: "Stripe",
    url: "stripe.com",
    tagline: "Financial infrastructure for the internet powering digital payments globally",
    tone: "Professional",
  },
  {
    name: "Supabase",
    url: "supabase.com",
    tagline: "Open-source Firebase alternative with Postgres database, auth, and edge functions",
    tone: "Direct",
  },
  {
    name: "Perplexity AI",
    url: "perplexity.ai",
    tagline: "AI search engine delivering verified answers with real-time citations",
    tone: "Witty",
  },
];

export const HOOK_TYPES = [
  { label: "Direct Value Hook", desc: "Connects their core value prop to strategic impact" },
  { label: "Observation & Milestone", desc: "Shows thoughtful research into what they're shipping" },
  { label: "Curiosity & Problem Hook", desc: "Sparks an effortless reply without high friction" },
];
