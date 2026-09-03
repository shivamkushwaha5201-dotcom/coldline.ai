export type ToneOption = "Casual" | "Professional" | "Direct" | "Witty";

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
  userPerspective?: string;
  error?: string;
}

export interface SamplePreset {
  name: string;
  url: string;
  tagline: string;
  tone: ToneOption;
  userPerspective?: string;
}
