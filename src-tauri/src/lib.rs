use std::path::{Path, PathBuf};
use storyboard_core::{create_project, is_safe_relative_path, load_project, save_project, validate_project, StoryboardProject};

#[tauri::command]
fn new_project(root: String, title: String) -> Result<String, String> {
    create_project(root, &title)
        .map(|path| path.to_string_lossy().into_owned())
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn open_project(project_root: String) -> Result<StoryboardProject, String> {
    load_project(project_root).map_err(|error| error.to_string())
}

#[tauri::command]
fn write_project(project_root: String, project: StoryboardProject) -> Result<(), String> {
    save_project(project_root, &project).map_err(|error| error.to_string())
}

#[tauri::command]
fn check_project(project: StoryboardProject) -> Vec<String> {
    validate_project(&project)
        .into_iter()
        .map(|issue| format!("{:?} {}: {}", issue.severity, issue.path, issue.message))
        .collect()
}

#[tauri::command]
fn import_asset(project_root: String, source: String, relative_destination: String) -> Result<String, String> {
    if !is_safe_relative_path(&relative_destination) { return Err("素材目的地必須是專案內相對路徑".into()); }
    let root = PathBuf::from(project_root);
    let source_path = PathBuf::from(source);
    if !source_path.is_file() { return Err("找不到來源素材".into()); }
    let destination = root.join(Path::new(&relative_destination));
    if destination.exists() { return Err(format!("目的地已存在，為避免覆寫而停止: {}", destination.display())); }
    if let Some(parent) = destination.parent() { std::fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
    std::fs::copy(&source_path, &destination).map_err(|e| e.to_string())?;
    Ok(relative_destination)
}

#[tauri::command]
async fn check_for_update(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_updater::UpdaterExt;
    let update = app.updater().map_err(|e| e.to_string())?.check().await.map_err(|e| e.to_string())?;
    Ok(update.map(|item| item.version))
}

#[tauri::command]
async fn install_update(app: tauri::AppHandle, confirmed: bool) -> Result<String, String> {
    if !confirmed { return Err("使用者尚未確認更新影響".into()); }
    use tauri_plugin_updater::UpdaterExt;
    let update = app.updater().map_err(|e| e.to_string())?.check().await.map_err(|e| e.to_string())?.ok_or("目前沒有可用更新")?;
    let version = update.version.clone();
    update.download_and_install(|_, _| {}, || {}).await.map_err(|e| e.to_string())?;
    Ok(format!("已安裝 {version}，請重新啟動應用程式完成更新"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![new_project, open_project, write_project, check_project, import_asset, check_for_update, install_update])
        .run(tauri::generate_context!())
        .expect("error while running Storyboard Editor");
}
