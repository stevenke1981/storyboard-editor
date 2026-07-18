use std::collections::HashSet;
use std::path::{Component, Path};

use crate::{ShotStatus, StoryboardProject, VisualKind};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ValidationSeverity {
    Warning,
    Error,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationIssue {
    pub severity: ValidationSeverity,
    pub path: String,
    pub message: String,
}

pub fn validate_project(project: &StoryboardProject) -> Vec<ValidationIssue> {
    let mut issues = Vec::new();
    if project.name.trim().is_empty() {
        issues.push(error("name", "專案名稱不可為空白"));
    }
    if project.schema_version != 1 {
        issues.push(error("schemaVersion", "目前只支援 schemaVersion 1"));
    }
    let mut ids = HashSet::new();
    for (index, shot) in project.shots.iter().enumerate() {
        let base = format!("shots[{index}]");
        if !ids.insert(shot.id) {
            issues.push(error(format!("{base}.id"), "鏡頭 ID 重複"));
        }
        if shot.duration_ms < 100 && shot.status != ShotStatus::Archived {
            issues.push(error(
                format!("{base}.durationMs"),
                "鏡頭時長不得小於 100 ms",
            ));
        }
        if shot.order as usize != index + 1 {
            issues.push(warning(
                format!("{base}.order"),
                "鏡頭 order 與陣列位置不一致",
            ));
        }
        if shot.visual.kind != VisualKind::None && shot.visual.path.trim().is_empty() {
            issues.push(warning(
                format!("{base}.visual.path"),
                "已指定視覺類型但尚未設定素材路徑",
            ));
        }
        for (field, value) in [
            ("visual.path", shot.visual.path.as_str()),
            ("visual.posterPath", shot.visual.poster_path.as_str()),
            ("narration.path", shot.narration.path.as_str()),
        ] {
            if !value.is_empty() && !is_safe_relative_path(value) {
                issues.push(error(
                    format!("{base}.{field}"),
                    "素材必須使用安全的專案相對路徑",
                ));
            }
        }
        if let Some(duration) = shot.narration.duration_ms {
            if shot.narration.offset_ms.saturating_add(duration) > shot.duration_ms {
                issues.push(warning(format!("{base}.narration"), "旁白長度超出鏡頭時長"));
            }
        }
        for (sfx_index, sfx) in shot.sound_effects.iter().enumerate() {
            if !sfx.path.is_empty() && !is_safe_relative_path(&sfx.path) {
                issues.push(error(
                    format!("{base}.soundEffects[{sfx_index}].path"),
                    "音效路徑不安全",
                ));
            }
            if sfx.start_ms > shot.duration_ms {
                issues.push(warning(
                    format!("{base}.soundEffects[{sfx_index}].startMs"),
                    "音效開始時間超出鏡頭",
                ));
            }
        }
    }
    issues
}

pub fn sanitize_project_name(input: &str) -> String {
    let invalid = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];
    let mut result: String = input
        .trim()
        .chars()
        .map(|ch| {
            if invalid.contains(&ch) || ch.is_control() {
                '_'
            } else {
                ch
            }
        })
        .collect();
    while result.ends_with(' ') || result.ends_with('.') {
        result.pop();
    }
    if result.is_empty() {
        result = "Untitled-Storyboard".to_string();
    }
    let uppercase = result.to_ascii_uppercase();
    let reserved = [
        "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8",
        "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
    ];
    if reserved.contains(&uppercase.as_str()) {
        result.insert(0, '_');
    }
    result
}

pub fn is_safe_relative_path(value: &str) -> bool {
    let path = Path::new(value);
    if path.is_absolute() || value.starts_with("\\\\") || value.chars().nth(1) == Some(':') {
        return false;
    }
    path.components()
        .all(|component| matches!(component, Component::Normal(_) | Component::CurDir))
}

fn error(path: impl Into<String>, message: impl Into<String>) -> ValidationIssue {
    ValidationIssue {
        severity: ValidationSeverity::Error,
        path: path.into(),
        message: message.into(),
    }
}
fn warning(path: impl Into<String>, message: impl Into<String>) -> ValidationIssue {
    ValidationIssue {
        severity: ValidationSeverity::Warning,
        path: path.into(),
        message: message.into(),
    }
}
