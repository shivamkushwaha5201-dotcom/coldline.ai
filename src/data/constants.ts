import { ToneMeta, SamplePreset, OutreachGoalMeta } from "../types";

export const OUTREACH_GOALS: OutreachGoalMeta[] = [
  {
    id: "Freelance / Service Pitch",
    label: "Freelance / Service Pitch",
    badge: "Agency & Freelance",
    exampleRole: "e.g., Social Media Management, Design, Dev",
    defaultOffer: "I help tech brands repurpose product updates into high-performing short video posts and organic content.",
    description: "Pitch specialized freelance services, agency retainers, design, or engineering help.",
  },
  {
    id: "Job Seeking / Career Outreach",
    label: "Job Seeking / Career Outreach",
    badge: "Careers & Hiring",
    exampleRole: "e.g., Full-Stack Dev, Product Designer, Growth Marketer",
    defaultOffer: "As a Next.js dev who builds fast UI components, I'm actively looking for early-stage teams building slick developer tools.",
    description: "Reach out to founders or hiring managers with proof-of-work and role interest.",
  },
  {
    id: "B2B Sales Pitch",
    label: "B2B Sales Pitch",
    badge: "SaaS & Enterprise",
    exampleRole: "e.g., Software Sales, Automation, B2B Solution",
    defaultOffer: "We build automated outbound workflows that reduce manual prospecting cycle times and increase booked demos by 30%.",
    description: "Directly connect business pain points to your platform or software solution.",
  },
  {
    id: "Custom Offer / Other",
    label: "Custom Offer / Other",
    badge: "Partnership & Other",
    exampleRole: "e.g., Podcast Guest, Collaboration, Advisory",
    defaultOffer: "I'd love to share insights with your community on scaling developer-first SaaS products.",
    description: "Custom value propositions, co-marketing, podcast invites, or partnership offers.",
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
    goal: "Freelance / Service Pitch",
    offer: "I help tech brands repurpose product updates into high-performing short video posts and organic content.",
  },
  {
    name: "SaaS Founder",
    url: "https://twitter.com/shadcn or early-stage developer tools startup",
    tagline: "Early-stage SaaS founder building developer platforms",
    tone: "Direct",
    goal: "Job Seeking / Career Outreach",
    offer: "As a Next.js dev who builds fast UI components, I'm actively looking for early-stage teams building slick developer tools.",
  },
  {
    name: "Stripe",
    url: "stripe.com",
    tagline: "Financial infrastructure powering digital internet payments globally",
    tone: "Professional",
    goal: "B2B Sales Pitch",
    offer: "We build automated compliance and dispute-resolution workflows that cut chargeback support overhead by 25%.",
  },
  {
    name: "Supabase",
    url: "supabase.com",
    tagline: "Open-source Firebase alternative with Postgres database & auth",
    tone: "Direct",
    goal: "Custom Offer / Other",
    offer: "I create hands-on technical architecture tutorials and migration walkthroughs for Postgres & developer tool communities.",
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
