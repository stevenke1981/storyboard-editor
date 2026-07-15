use std::path::{Path, PathBuf};
use crate::StoryboardProject;

pub fn storyboard_path(video_project_root: impl AsRef<Path>) -> PathBuf { video_project_root.as_ref().join("storyboard").join("storyboard.json") }

/// Optional, filesystem-only YTPM bridge. It never mutates the host project.
pub fn export_script(project: &StoryboardProject) -> String {
    project.shots.iter().filter(|s| s.enabled && s.status != crate::ShotStatus::Archived).map(|s| format!("{}\t{}\n", s.order, if s.narration.text.is_empty() { &s.script_text } else { &s.narration.text })).collect()
}
