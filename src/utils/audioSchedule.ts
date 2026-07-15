import type { Shot } from "../types/storyboard";

/** Schedules narration/SFX with the Web Audio clock when available; failures degrade silently to no playback. */
export function scheduleShotAudio(shot: Shot, offsetMs: number, onError?: (message: string) => void): () => void {
  const timers: number[] = [];
  const tracks = [
    ...(shot.narration.path ? [{ path: shot.narration.path, startMs: shot.narration.offsetMs, gainDb: shot.narration.gainDb }] : []),
    ...shot.soundEffects.filter((s) => s.path).map((s) => ({ path: s.path, startMs: s.startMs, gainDb: s.gainDb })),
  ];
  for (const track of tracks) {
    const delay = Math.max(0, track.startMs - offsetMs);
    const timer = window.setTimeout(() => {
      const audio = new Audio(track.path);
      audio.volume = Math.max(0, Math.min(1, 10 ** (track.gainDb / 20)));
      audio.play().catch(() => onError?.(`無法播放音訊：${track.path}`));
    }, delay);
    timers.push(timer);
  }
  return () => timers.forEach(window.clearTimeout);
}
