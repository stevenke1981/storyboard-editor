export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "21:9";
export type VisualKind = "none" | "image" | "video";
export type VisualFit = "contain" | "cover" | "stretch";
export type TransitionType = "cut" | "fade" | "dissolve" | "wipe" | "custom";
export type ShotStatus = "draft" | "ready" | "needs-review" | "archived";

export interface VisualAsset {
  kind: VisualKind;
  path: string;
  prompt: string;
  fit: VisualFit;
  inMs: number;
  outMs: number | null;
  posterPath: string;
}

export interface NarrationTrack {
  text: string;
  path: string;
  voice: string;
  gainDb: number;
  offsetMs: number;
  durationMs: number | null;
}

export interface SoundEffect {
  id: string;
  name: string;
  path: string;
  startMs: number;
  trimInMs: number;
  trimOutMs: number | null;
  gainDb: number;
  loop: boolean;
  fadeInMs: number;
  fadeOutMs: number;
}

export interface Transition {
  type: TransitionType;
  durationMs: number;
  customName?: string;
}

export interface Shot {
  id: string;
  order: number;
  title: string;
  scriptText: string;
  visualDescription: string;
  durationMs: number;
  enabled: boolean;
  status: ShotStatus;
  tags: string[];
  visual: VisualAsset;
  narration: NarrationTrack;
  soundEffects: SoundEffect[];
  transition: Transition;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportSettings {
  resolution: { width: number; height: number };
  fps: number;
  audioSampleRate: number;
  backgroundColor: string;
}

export interface StoryboardProject {
  schemaVersion: number;
  id: string;
  name: string;
  description: string;
  language: string;
  aspectRatio: AspectRatio;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  exportSettings: ExportSettings;
  shots: Shot[];
}
