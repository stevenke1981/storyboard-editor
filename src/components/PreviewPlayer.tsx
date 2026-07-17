import { useEffect, useRef, useState } from "react";
import type { AspectRatio, Shot } from "../types/storyboard";
import { formatDuration } from "../utils/time";
import { Icon } from "./Icon";
import { scheduleShotAudio } from "../utils/audioSchedule";
import { resolveMediaSource } from "../api/desktop";

interface PreviewPlayerProps {
  shot: Shot | null;
  aspectRatio: AspectRatio;
  playing: boolean;
  progress: number;
  onTogglePlay: () => void;
}

function ratioClass(ratio: AspectRatio): string { return `ratio-${ratio.replace(":", "-")}`; }

export function PreviewPlayer({ shot, aspectRatio, playing, progress, onTogglePlay }: PreviewPlayerProps) {
  const [mediaError, setMediaError] = useState(false);
  const [mediaSrc, setMediaSrc] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let active = true; setMediaError(false); setMediaSrc("");
    const path = shot?.visual.path ?? "";
    if (!path) return () => { active = false; };
    resolveMediaSource(path).then((src) => { if (active) setMediaSrc(src); }).catch(() => { if (active) setMediaError(true); });
    return () => { active = false; };
  }, [shot?.id, shot?.visual.path]);

  useEffect(() => {
    if (!shot || !playing) return;
    return scheduleShotAudio(shot, progress, (message) => console.warn(message));
  }, [shot, playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shot || shot.visual.kind !== "video") return;
    const target = Math.max(0, shot.visual.inMs + progress) / 1000;
    if (Math.abs(video.currentTime - target) > 0.2) video.currentTime = target;
    if (playing) void video.play().catch(() => setMediaError(true));
    else video.pause();
  }, [playing, progress, shot]);

  if (!shot) return <main className="preview-panel panel"><div className="empty-state">沒有可編輯的鏡頭</div></main>;
  const progressPct = shot.durationMs > 0 ? Math.min(100, (progress / shot.durationMs) * 100) : 0;
  return (
    <main className="preview-panel panel">
      <div className="preview-toolbar">
        <div><strong>{shot.title}</strong><span>{aspectRatio} · {formatDuration(shot.durationMs, true)}</span></div>
        <div className="preview-badges"><span>{shot.visual.kind === "none" ? "文字分鏡" : shot.visual.kind === "image" ? "圖片" : "影片"}</span>{shot.narration.text && <span>旁白</span>}{shot.soundEffects.length > 0 && <span>{shot.soundEffects.length} 音效</span>}</div>
      </div>
      <div className="preview-stage-wrap">
        <div className={`preview-stage ${ratioClass(aspectRatio)}`}>
          {shot.visual.kind === "image" && mediaSrc && !mediaError ? (
            <img className="real-media image-media" src={mediaSrc} alt={shot.visualDescription || shot.title} onError={() => setMediaError(true)} style={{ objectFit: shot.visual.fit === "stretch" ? "fill" : shot.visual.fit }} />
          ) : shot.visual.kind === "video" && mediaSrc && !mediaError ? (
            <video ref={videoRef} key={`${shot.id}:${mediaSrc}`} className="real-media video-media" src={mediaSrc} muted playsInline preload="auto" controls={false} onError={() => setMediaError(true)} style={{ objectFit: shot.visual.fit === "stretch" ? "fill" : shot.visual.fit }} />
          ) : shot.visual.kind !== "none" && shot.visual.path ? (
            <div className="media-placeholder" role="status"><Icon name={shot.visual.kind === "image" ? "image" : "video"} /><strong>素材無法預覽</strong><span>{shot.visual.path}</span></div>
          ) : (
            <div className="story-card"><span className="story-number">SHOT {String(shot.order).padStart(2, "0")}</span><h2>{shot.title}</h2><p>{shot.visualDescription || "在右側輸入這一鏡的畫面描述。"}</p></div>
          )}
          {shot.scriptText && <div className="subtitle-preview">{shot.scriptText}</div>}
          <button className="play-overlay" onClick={onTogglePlay} aria-label={playing ? "暫停" : "播放"}><Icon name={playing ? "pause" : "play"} /></button>
        </div>
      </div>
      <div className="transport">
        <button className="transport-button" onClick={onTogglePlay} aria-label={playing ? "暫停" : "播放"}><Icon name={playing ? "pause" : "play"} /></button>
        <span>{formatDuration(progress, true)}</span><div className="progress-track"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div><span>{formatDuration(shot.durationMs, true)}</span>
      </div>
    </main>
  );
}
