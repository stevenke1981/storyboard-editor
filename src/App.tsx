import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inspector } from "./components/Inspector";
import { PreviewPlayer } from "./components/PreviewPlayer";
import { ShotList } from "./components/ShotList";
import { Timeline } from "./components/Timeline";
import { TopBar } from "./components/TopBar";
import { useStoryboardProject } from "./hooks/useStoryboardProject";
import { buildShotTimeRanges, locateShotAtTime, projectDuration } from "./utils/time";
import { checkDesktopUpdate, installDesktopUpdate } from "./api/desktop";

export default function App() {
  const { state, selectedShot, dispatch, exportJson, exportArtifacts, persistenceError } = useStoryboardProject();
  const [playing, setPlaying] = useState(false);
  const [globalTimeMs, setGlobalTimeMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const startOffsetRef = useRef(0);
  const totalDuration = useMemo(() => projectDuration(state.project), [state.project]);
  const ranges = useMemo(() => buildShotTimeRanges(state.project.shots), [state.project.shots]);
  const selectedRange = ranges.find((range) => range.shot.id === selectedShot?.id);
  const shotProgress = selectedRange ? Math.max(0, globalTimeMs - selectedRange.startMs) : 0;

  const selectShot = useCallback((shotId: string) => {
    const range = ranges.find((item) => item.shot.id === shotId);
    if (range) { setGlobalTimeMs(range.startMs); startOffsetRef.current = range.startMs; startedAtRef.current = playing ? performance.now() : null; }
    dispatch({ type: "select", shotId });
  }, [dispatch, playing, ranges]);

  const seekTo = useCallback((timeMs: number) => {
    const next = Math.min(totalDuration, Math.max(0, timeMs));
    setGlobalTimeMs(next); startOffsetRef.current = next; startedAtRef.current = playing ? performance.now() : null;
    const range = locateShotAtTime(state.project.shots, next);
    if (range && range.shot.id !== selectedShot?.id) dispatch({ type: "select", shotId: range.shot.id });
  }, [dispatch, playing, selectedShot?.id, state.project.shots, totalDuration]);

  const togglePlay = useCallback(() => {
    if (playing) { setPlaying(false); startedAtRef.current = null; startOffsetRef.current = globalTimeMs; return; }
    const offset = globalTimeMs >= totalDuration ? 0 : globalTimeMs;
    startOffsetRef.current = offset; startedAtRef.current = performance.now(); setGlobalTimeMs(offset); setPlaying(true);
  }, [globalTimeMs, playing, totalDuration]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = (now: number) => {
      const start = startedAtRef.current ?? now; const next = startOffsetRef.current + (now - start);
      if (next >= totalDuration) { setGlobalTimeMs(totalDuration); setPlaying(false); startedAtRef.current = null; return; }
      setGlobalTimeMs(next);
      const current = ranges.find((range) => next >= range.startMs && next < range.endMs);
      if (current && current.shot.id !== selectedShot?.id) dispatch({ type: "select", shotId: current.shot.id });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [dispatch, playing, ranges, selectedShot?.id, totalDuration]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null; const editing = target?.matches("input, textarea, select, [contenteditable='true']");
      if (event.code === "Space" && !editing) { event.preventDefault(); togglePlay(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") { event.preventDefault(); dispatch({ type: "add" }); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d" && selectedShot) { event.preventDefault(); dispatch({ type: "duplicate", shotId: selectedShot.id }); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) { event.preventDefault(); dispatch({ type: "undo" }); }
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey))) { event.preventDefault(); dispatch({ type: "redo" }); }
    };
    window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey);
  }, [dispatch, selectedShot, togglePlay]);

  return (
    <div className="app-shell">
      <TopBar
        projectName={state.project.name}
        shotCount={state.project.shots.filter((shot) => shot.status !== "archived").length}
        dirty={state.dirty}
        persistenceError={persistenceError}
        playing={playing}
        onAdd={() => dispatch({ type: "add" })}
        onTogglePlay={togglePlay}
        onExportJson={exportJson}
        onExportArtifacts={async () => { try { const path = await exportArtifacts(); window.alert(`匯出完成：${path}`); } catch (error) { window.alert(`匯出失敗：${error instanceof Error ? error.message : String(error)}`); } }}
        onUndo={() => dispatch({ type: "undo" })}
        onRedo={() => dispatch({ type: "redo" })}
        canUndo={state.past.length > 0}
        canRedo={state.future.length > 0}
        onCheckUpdate={async () => { try { const version = await checkDesktopUpdate(); if (!version) { window.alert("目前已是最新版本"); return; } if (window.confirm(`目前版本 → ${version}\n更新會下載並重新啟動應用程式，是否繼續？`)) window.alert(await installDesktopUpdate(true)); } catch (error) { window.alert(`更新失敗：${error instanceof Error ? error.message : "僅桌面版支援"}`); } }}
      />
      <div className="workspace">
        <ShotList shots={state.project.shots} selectedId={state.selectedShotId} onSelect={selectShot} onAdd={() => dispatch({ type: "add" })} onDuplicate={(shotId) => dispatch({ type: "duplicate", shotId })} onArchive={(shotId) => dispatch({ type: "archive", shotId })} onMove={(shotId, direction) => dispatch({ type: "move", shotId, direction })} />
        <PreviewPlayer shot={selectedShot} aspectRatio={state.project.aspectRatio} playing={playing} progress={Math.min(shotProgress, selectedShot?.durationMs ?? 0)} onTogglePlay={togglePlay} />
        <Inspector shot={selectedShot} onUpdate={(patch) => selectedShot && dispatch({ type: "update", shotId: selectedShot.id, patch })} onAddSfx={() => selectedShot && dispatch({ type: "addSfx", shotId: selectedShot.id })} onUpdateSfx={(sfxId, patch) => selectedShot && dispatch({ type: "updateSfx", shotId: selectedShot.id, sfxId, patch })} onRemoveSfx={(sfxId) => selectedShot && dispatch({ type: "removeSfx", shotId: selectedShot.id, sfxId })} />
      </div>
      <Timeline shots={state.project.shots} selectedId={state.selectedShotId} playing={playing} globalTimeMs={globalTimeMs} onSelect={selectShot} onSeek={seekTo} />
    </div>
  );
}
