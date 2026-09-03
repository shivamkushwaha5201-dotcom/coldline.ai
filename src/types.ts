export type ToneOption = "Casual" | "Professional" | "Direct" | "Witty";

export type OutreachGoal =
  | "Freelance / Service Pitch"
  | "Job Seeking / Career Outreach"
  | "B2B Sales Pitch"
  | "Custom Offer / Other";

export interface OutreachGoalMeta {
  id: OutreachGoal;
  label: string;
  badge: string;
  exampleRole: string;
  defaultOffer: string;
  description: string;
}

export interface ToneMeta {
  id: ToneOption;
  label: string;
  description: string;
  badge: string;
  iconName: string;
}

export interface PitchOption {
  hookType: "Observation Hook" | "Direct Pitch Hook" | "Soft Inquiry Hook" | string;
  tagline: string;
  pitch: string;
}

export interface IcebreakerResult {
  id: string;
  text: string;
  hookType: string;
}

export interface GenerationResponse {
  success?: boolean;
  icebreakers?: string[];
  pitches?: PitchOption[];
  tone?: string;
  normalizedInput?: string;
  goal?: OutreachGoal;
  offer?: string;
  error?: string;
}

export interface SamplePreset {
  name: string;
  url: string;
  tagline: string;
  tone: ToneOption;
  goal?: OutreachGoal;
  offer?: string;
}
