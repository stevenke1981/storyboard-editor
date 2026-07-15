import type { Shot } from "../types/storyboard";
import { buildShotTimeRanges, formatDuration } from "../utils/time";
import { Icon } from "./Icon";

interface TimelineProps {
  shots: Shot[];
  selectedId: string;
  playing: boolean;
  globalTimeMs: number;
  onSelect: (id: string) => void;
}

export function Timeline({ shots, selectedId, playing, globalTimeMs, onSelect }: TimelineProps) {
  const ranges = buildShotTimeRanges(shots);
  const total = ranges.at(-1)?.endMs ?? 0;
  const playheadPct = total > 0 ? Math.min(100, (globalTimeMs / total) * 100) : 0;
  return (
    <section className="timeline panel" aria-label="時間軸">
      <div className="timeline-heading">
        <div><strong>時間軸</strong><span>{ranges.length} 鏡 · {formatDuration(total, true)}</span></div>
        <div className="timeline-legend"><Icon name="audio" /><span>{playing ? "播放中" : "已暫停"}</span></div>
      </div>
      <div className="timeline-ruler"><span>00:00</span><span>{formatDuration(total / 2)}</span><span>{formatDuration(total)}</span></div>
      <div className="timeline-track">
        <div className="playhead" style={{ left: `${playheadPct}%` }}><i /></div>
        {ranges.map(({ shot, startMs, endMs }) => {
          const width = total > 0 ? ((endMs - startMs) / total) * 100 : 0;
          return (
            <button
              key={shot.id}
              className={`timeline-shot ${shot.id === selectedId ? "selected" : ""}`}
              style={{ width: `${Math.max(width, 4)}%` }}
              onClick={() => onSelect(shot.id)}
              title={`${shot.title} · ${formatDuration(shot.durationMs, true)}`}
            >
              <span>{String(shot.order).padStart(2, "0")}</span>
              <strong>{shot.title}</strong>
              <em>{formatDuration(shot.durationMs)}</em>
              {shot.narration.text && <div className="audio-strip narration-strip" />}
              {shot.soundEffects.length > 0 && <div className="audio-strip sfx-strip" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
