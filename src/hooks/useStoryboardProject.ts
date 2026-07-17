import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { createEmptyShot, demoProject } from "../data/demoProject";
import type { Shot, SoundEffect, StoryboardProject } from "../types/storyboard";
import { createId } from "../utils/id";
import { exportDesktopArtifacts, isTauriRuntime, loadDesktopWorkspace, saveDesktopWorkspace } from "../api/desktop";

const STORAGE_KEY = "storyboard-editor.demo-project.v1";

type ProjectAction =
  | { type: "select"; shotId: string }
  | { type: "add" }
  | { type: "duplicate"; shotId: string }
  | { type: "archive"; shotId: string }
  | { type: "update"; shotId: string; patch: Partial<Shot> }
  | { type: "addSfx"; shotId: string }
  | { type: "updateSfx"; shotId: string; sfxId: string; patch: Partial<SoundEffect> }
  | { type: "removeSfx"; shotId: string; sfxId: string }
  | { type: "move"; shotId: string; direction: -1 | 1 }
  | { type: "replace"; project: StoryboardProject }
  | { type: "clean" }
  | { type: "undo" }
  | { type: "redo" };

interface ProjectState {
  project: StoryboardProject;
  selectedShotId: string;
  dirty: boolean;
  past: StoryboardProject[];
  future: StoryboardProject[];
}

function normalizeOrder(project: StoryboardProject): StoryboardProject {
  return { ...project, updatedAt: new Date().toISOString(), shots: project.shots.map((shot, index) => ({ ...shot, order: index + 1 })) };
}

function reduceProject(state: ProjectState, action: Exclude<ProjectAction, { type: "undo" } | { type: "redo" }>): ProjectState {
  const timestamp = new Date().toISOString();
  switch (action.type) {
    case "select": return { ...state, selectedShotId: action.shotId };
    case "add": {
      const selectedIndex = state.project.shots.findIndex((shot) => shot.id === state.selectedShotId);
      const insertAt = selectedIndex < 0 ? state.project.shots.length : selectedIndex + 1;
      const shots = [...state.project.shots]; const shot = createEmptyShot(insertAt + 1); shots.splice(insertAt, 0, shot);
      return { ...state, project: normalizeOrder({ ...state.project, shots }), selectedShotId: shot.id, dirty: true };
    }
    case "duplicate": {
      const index = state.project.shots.findIndex((shot) => shot.id === action.shotId); if (index < 0) return state;
      const source = state.project.shots[index];
      const clone: Shot = { ...structuredClone(source), id: createId("shot"), title: `${source.title}（副本）`, status: "draft", createdAt: timestamp, updatedAt: timestamp, soundEffects: source.soundEffects.map((sfx) => ({ ...sfx, id: createId("sfx") })) };
      const shots = [...state.project.shots]; shots.splice(index + 1, 0, clone);
      return { ...state, project: normalizeOrder({ ...state.project, shots }), selectedShotId: clone.id, dirty: true };
    }
    case "archive": {
      const shots = state.project.shots.map((shot) => shot.id === action.shotId ? { ...shot, status: "archived" as const, enabled: false, updatedAt: timestamp } : shot);
      const next = shots.find((shot) => shot.id !== action.shotId && shot.status !== "archived");
      return { ...state, project: normalizeOrder({ ...state.project, shots }), selectedShotId: next?.id ?? action.shotId, dirty: true };
    }
    case "update": return { ...state, project: { ...state.project, shots: state.project.shots.map((shot) => shot.id === action.shotId ? { ...shot, ...action.patch, updatedAt: timestamp } : shot), updatedAt: timestamp }, dirty: true };
    case "addSfx": {
      const sfx: SoundEffect = { id: createId("sfx"), name: "新音效", path: "", startMs: 0, trimInMs: 0, trimOutMs: null, gainDb: 0, loop: false, fadeInMs: 0, fadeOutMs: 0 };
      return { ...state, project: { ...state.project, shots: state.project.shots.map((shot) => shot.id === action.shotId ? { ...shot, soundEffects: [...shot.soundEffects, sfx], updatedAt: timestamp } : shot), updatedAt: timestamp }, dirty: true };
    }
    case "updateSfx": return { ...state, project: { ...state.project, shots: state.project.shots.map((shot) => shot.id === action.shotId ? { ...shot, soundEffects: shot.soundEffects.map((sfx) => sfx.id === action.sfxId ? { ...sfx, ...action.patch } : sfx), updatedAt: timestamp } : shot), updatedAt: timestamp }, dirty: true };
    case "removeSfx": return { ...state, project: { ...state.project, shots: state.project.shots.map((shot) => shot.id === action.shotId ? { ...shot, soundEffects: shot.soundEffects.filter((sfx) => sfx.id !== action.sfxId), updatedAt: timestamp } : shot), updatedAt: timestamp }, dirty: true };
    case "move": {
      const index = state.project.shots.findIndex((shot) => shot.id === action.shotId); const target = index + action.direction;
      if (index < 0 || target < 0 || target >= state.project.shots.length) return state;
      const shots = [...state.project.shots]; [shots[index], shots[target]] = [shots[target], shots[index]];
      return { ...state, project: normalizeOrder({ ...state.project, shots }), dirty: true };
    }
    case "replace": return { ...state, project: action.project, selectedShotId: action.project.shots.find((shot) => shot.status !== "archived")?.id ?? action.project.shots[0]?.id ?? "", dirty: false, past: [], future: [] };
    case "clean": return { ...state, dirty: false };
  }
}

function reducer(state: ProjectState, action: ProjectAction): ProjectState {
  if (action.type === "undo" || action.type === "redo") {
    const source = action.type === "undo" ? state.past : state.future; if (!source.length) return state;
    const project = source[source.length - 1]; const current = state.project;
    return { ...state, project, selectedShotId: project.shots.find((s) => s.status !== "archived")?.id ?? project.shots[0]?.id ?? "", dirty: true, past: action.type === "undo" ? state.past.slice(0, -1) : [...state.past, current], future: action.type === "undo" ? [...state.future, current] : state.future.slice(0, -1) };
  }
  const next = reduceProject(state, action);
  if (next.project === state.project || action.type === "clean" || action.type === "select") return next;
  return { ...next, past: [...state.past, state.project].slice(-50), future: [] };
}

function loadInitialState(): ProjectState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const project = JSON.parse(raw) as StoryboardProject; return { project, selectedShotId: project.shots.find((s) => s.status !== "archived")?.id ?? "", dirty: false, past: [], future: [] }; }
  } catch { /* fall back to demo */ }
  return { project: demoProject, selectedShotId: demoProject.shots[0].id, dirty: false, past: [], future: [] };
}

export function useStoryboardProject() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const selectedShot = useMemo(() => state.project.shots.find((shot) => shot.id === state.selectedShotId) ?? null, [state.project.shots, state.selectedShotId]);

  useEffect(() => {
    if (!isTauriRuntime()) return;
    let active = true;
    loadDesktopWorkspace().then((project) => { if (active && project) dispatch({ type: "replace", project }); }).catch((error) => { if (active) setPersistenceError(error instanceof Error ? error.message : String(error)); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!state.dirty) return;
    const timer = window.setTimeout(async () => {
      try {
        if (isTauriRuntime()) await saveDesktopWorkspace(state.project);
        else localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
        setPersistenceError(null); dispatch({ type: "clean" });
      } catch (error) { setPersistenceError(error instanceof Error ? error.message : String(error)); }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [state.project, state.dirty]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(state.project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "storyboard.json"; anchor.click(); URL.revokeObjectURL(url);
  }, [state.project]);

  const exportArtifacts = useCallback(async () => {
    if (!isTauriRuntime()) { exportJson(); return "瀏覽器版已下載 storyboard.json；FFmpeg 清單僅桌面版支援。"; }
    return exportDesktopArtifacts(state.project);
  }, [exportJson, state.project]);

  return { state, selectedShot, dispatch, exportJson, exportArtifacts, persistenceError };
}
