import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Shot } from "../types/storyboard";
import { buildShotTimeRanges, formatDuration } from "../utils/time";
import { Icon } from "./Icon";

interface TimelineProps {
  shots: Shot[];
  selectedId: string;
  playing: boolean;
  globalTimeMs: number;
  onSelect: (id: string) => void;
  onSeek: (timeMs: number) => void;
}

export function Timeline({ shots, selectedId, playing, globalTimeMs, onSelect, onSeek }: TimelineProps) {
  const ranges = buildShotTimeRanges(shots);
  const total = ranges.at(-1)?.endMs ?? 0;
  const playheadPct = total > 0 ? Math.min(100, (globalTimeMs / total) * 100) : 0;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const seekFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || total <= 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(ratio * total);
  };

  return (
    <section className="timeline panel" aria-label="時間軸">
      <div className="timeline-heading">
        <div><strong>時間軸</strong><span>{ranges.length} 鏡 · {formatDuration(total, true)}</span></div>
        <div className="timeline-legend"><Icon name="audio" /><span>{dragging ? "定位中" : playing ? "播放中" : "已暫停"}</span></div>
      </div>
      <div className="timeline-ruler"><span>00:00</span><span>{formatDuration(total / 2)}</span><span>{formatDuration(total)}</span></div>
      <div
        ref={trackRef}
        className={`timeline-track ${dragging ? "dragging" : ""}`}
        onPointerDown={(event) => { setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); seekFromPointer(event); }}
        onPointerMove={(event) => { if (dragging) seekFromPointer(event); }}
        onPointerUp={(event) => { seekFromPointer(event); setDragging(false); event.currentTarget.releasePointerCapture(event.pointerId); }}
        onPointerCancel={() => setDragging(false)}
      >
        <div className="playhead" style={{ left: `${playheadPct}%` }}><i /></div>
        {ranges.map(({ shot, startMs, endMs }) => {
          const width = total > 0 ? ((endMs - startMs) / total) * 100 : 0;
          return (
            <button key={shot.id} className={`timeline-shot ${shot.id === selectedId ? "selected" : ""}`} style={{ width: `${Math.max(width, 4)}%` }} onClick={(event) => { event.stopPropagation(); onSelect(shot.id); }} title={`${shot.title} · ${formatDuration(shot.durationMs, true)}`}>
              <span>{String(shot.order).padStart(2, "0")}</span><strong>{shot.title}</strong><em>{formatDuration(shot.durationMs)}</em>
              {shot.narration.text && <div className="audio-strip narration-strip" />}{shot.soundEffects.length > 0 && <div className="audio-strip sfx-strip" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
