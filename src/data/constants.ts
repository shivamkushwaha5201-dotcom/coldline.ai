import { ToneMeta, SamplePreset } from "../types";

export const SUGGESTED_PERSPECTIVES: { label: string; text: string }[] = [
  {
    label: "Short-Form Video Editor",
    text: "I'm a short-form video editor and I want to pitch them on re-editing their podcast clips for TikTok and Reels to boost engagement.",
  },
  {
    label: "Next.js Frontend Engineer",
    text: "I'm a Next.js full-stack developer who builds fast, responsive UI components. I want to reach out about contract or full-time frontend help on their roadmap.",
  },
  {
    label: "B2B Sales Automation",
    text: "We build automated outbound workflows and prospecting integrations that increase booked demos by 30% without manual data entry.",
  },
  {
    label: "UI/UX Onboarding Designer",
    text: "I'm a product designer who audits SaaS user onboarding flows to reduce churn and double user activation rates.",
  },
];

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
    tagline: "High-craft project management tool for modern software teams",
    tone: "Casual",
    userPerspective: "I'm a short-form video editor and I want to pitch them on re-editing their podcast clips for TikTok and Reels to boost engagement.",
  },
  {
    name: "SaaS Founder",
    url: "https://twitter.com/shadcn or early-stage developer tools startup",
    tagline: "Early-stage SaaS founder building developer platforms",
    tone: "Direct",
    userPerspective: "I'm a Next.js full-stack developer who builds fast, responsive UI components. I want to reach out about contract or full-time frontend help on their roadmap.",
  },
  {
    name: "Stripe",
    url: "stripe.com",
    tagline: "Financial infrastructure powering digital internet payments globally",
    tone: "Professional",
    userPerspective: "We build automated compliance and chargeback dispute resolution workflows that cut financial support overhead by 25%.",
  },
  {
    name: "Supabase",
    url: "supabase.com",
    tagline: "Open-source Firebase alternative with Postgres database & auth",
    tone: "Direct",
    userPerspective: "I create hands-on technical architecture tutorials and case studies for developer tool communities and want to collaborate on community content.",
  },
];

export const HOOK_TYPES = [
  {
    id: "Observation Hook",
    label: "Observation Hook",
    tagline: "Highlighting something specific about their recent posts/company work",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desc: "Demonstrates authentic research by referencing a concrete product release, design pattern, or public milestone.",
  },
  {
    id: "Direct Pitch Hook",
    label: "Direct Pitch Hook",
    tagline: "Directly connecting user's service/skill to a problem the company might be facing",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    desc: "Immediately bridges your unique skill or value proposition to an operational gap or growth bottleneck.",
  },
  {
    id: "Soft Inquiry Hook",
    label: "Soft Inquiry Hook",
    tagline: "A low-friction opening question to start a conversation",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    desc: "Opens the dialogue with a zero-pressure, high-curiosity question that founders and execs love replying to.",
  },
];
