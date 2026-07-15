import type { Shot, StoryboardProject } from "../types/storyboard";

export function clampDuration(value: number): number {
  if (!Number.isFinite(value)) return 1000;
  return Math.max(100, Math.round(value));
}

export function formatDuration(ms: number, showMilliseconds = false): string {
  const safe = Math.max(0, Math.round(ms));
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1_000);
  const milliseconds = safe % 1_000;
  const base = hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return showMilliseconds ? `${base}.${String(milliseconds).padStart(3, "0")}` : base;
}

export function projectDuration(project: StoryboardProject): number {
  return project.shots
    .filter((shot) => shot.enabled && shot.status !== "archived")
    .reduce((sum, shot) => sum + shot.durationMs, 0);
}

export interface ShotTimeRange {
  shot: Shot;
  startMs: number;
  endMs: number;
}

export function buildShotTimeRanges(shots: Shot[]): ShotTimeRange[] {
  let cursor = 0;
  return shots
    .filter((shot) => shot.enabled && shot.status !== "archived")
    .map((shot) => {
      const range = { shot, startMs: cursor, endMs: cursor + shot.durationMs };
      cursor = range.endMs;
      return range;
    });
}

export function locateShotAtTime(shots: Shot[], timeMs: number): ShotTimeRange | null {
  const ranges = buildShotTimeRanges(shots);
  return ranges.find((range) => timeMs >= range.startMs && timeMs < range.endMs)
    ?? ranges.at(-1)
    ?? null;
}
