import type { StoryboardProject } from "../types/storyboard";

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function invokeTauri<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauriRuntime()) throw new Error("This command requires the Tauri desktop runtime.");
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

export async function resolveMediaSource(path: string): Promise<string> {
  if (!path || path.startsWith("blob:") || path.startsWith("data:") || path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!isTauriRuntime()) return path;
  const { convertFileSrc } = await import("@tauri-apps/api/core");
  return convertFileSrc(path);
}

export function createDesktopProject(root: string, title: string): Promise<string> {
  return invokeTauri<string>("new_project", { root, title });
}

export function openDesktopProject(projectRoot: string): Promise<StoryboardProject> {
  return invokeTauri<StoryboardProject>("open_project", { projectRoot });
}

export function saveDesktopProject(projectRoot: string, project: StoryboardProject): Promise<void> {
  return invokeTauri<void>("write_project", { projectRoot, project });
}

export function loadDesktopWorkspace(): Promise<StoryboardProject | null> {
  return invokeTauri<StoryboardProject | null>("load_workspace");
}

export function saveDesktopWorkspace(project: StoryboardProject): Promise<string> {
  return invokeTauri<string>("save_workspace", { project });
}

export function exportDesktopArtifacts(project: StoryboardProject): Promise<string> {
  return invokeTauri<string>("export_artifacts", { project });
}

export function validateDesktopProject(project: StoryboardProject): Promise<string[]> {
  return invokeTauri<string[]>("check_project", { project });
}

export function importDesktopAsset(projectRoot: string, source: string, relativeDestination: string): Promise<string> {
  return invokeTauri<string>("import_asset", { projectRoot, source, relativeDestination });
}

export function checkDesktopUpdate(): Promise<string | null> {
  return invokeTauri<string | null>("check_for_update");
}

export function installDesktopUpdate(confirmed: boolean): Promise<string> {
  return invokeTauri<string>("install_update", { confirmed });
}
