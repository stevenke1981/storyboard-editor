use std::fs::{self, File};
use std::io::{BufReader, BufWriter, Write};
use std::path::{Path, PathBuf};

use thiserror::Error;

use crate::{sanitize_project_name, validate_project, StoryboardProject, ValidationSeverity};

pub const PROJECT_FILE: &str = "storyboard.json";

#[derive(Debug, Error)]
pub enum ProjectError {
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("project validation failed: {0}")]
    Validation(String),
    #[error("project path already exists: {0}")]
    AlreadyExists(PathBuf),
}

pub fn create_project(root: impl AsRef<Path>, title: &str) -> Result<PathBuf, ProjectError> {
    let folder = sanitize_project_name(title);
    let project_root = root.as_ref().join(folder);
    if project_root.exists() { return Err(ProjectError::AlreadyExists(project_root)); }
    for relative in [
        "01_script",
        "02_visuals/images",
        "02_visuals/videos",
        "03_audio/narration",
        "03_audio/sfx",
        "04_exports",
        ".backups",
        ".cache/thumbnails",
        ".cache/waveforms",
        "archive",
    ] {
        fs::create_dir_all(project_root.join(relative))?;
    }
    fs::write(project_root.join("project-notes.md"), "# 專案備註\n")?;
    let project = StoryboardProject::new(title);
    save_project(&project_root, &project)?;
    Ok(project_root)
}

pub fn load_project(project_root: impl AsRef<Path>) -> Result<StoryboardProject, ProjectError> {
    let file = File::open(project_root.as_ref().join(PROJECT_FILE))?;
    let project: StoryboardProject = serde_json::from_reader(BufReader::new(file))?;
    Ok(project)
}

pub fn save_project(project_root: impl AsRef<Path>, project: &StoryboardProject) -> Result<(), ProjectError> {
    let errors: Vec<_> = validate_project(project)
        .into_iter()
        .filter(|issue| issue.severity == ValidationSeverity::Error)
        .collect();
    if !errors.is_empty() {
        let message = errors.into_iter().map(|i| format!("{}: {}", i.path, i.message)).collect::<Vec<_>>().join("; ");
        return Err(ProjectError::Validation(message));
    }

    let root = project_root.as_ref();
    fs::create_dir_all(root)?;
    let destination = root.join(PROJECT_FILE);
    let temp = root.join(format!(".{PROJECT_FILE}.tmp"));
    let backup_dir = root.join(".backups");
    fs::create_dir_all(&backup_dir)?;

    if destination.exists() {
        let timestamp = chrono::Utc::now().format("%Y%m%dT%H%M%SZ");
        fs::copy(&destination, backup_dir.join(format!("storyboard-{timestamp}.json")))?;
    }

    {
        let file = File::create(&temp)?;
        let mut writer = BufWriter::new(file);
        serde_json::to_writer_pretty(&mut writer, project)?;
        writer.write_all(b"\n")?;
        writer.flush()?;
        writer.get_ref().sync_all()?;
    }

    #[cfg(windows)]
    if destination.exists() { fs::remove_file(&destination)?; }
    fs::rename(&temp, &destination)?;
    Ok(())
}
