use crate::{ShotStatus, StoryboardProject};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FfmpegPlan {
    pub resolution: (u32, u32),
    pub fps: u32,
    pub background_color: String,
    pub shots: Vec<FfmpegShot>,
}
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FfmpegShot {
    pub order: u32,
    pub duration_ms: u64,
    pub visual_path: Option<String>,
    pub narration_path: Option<String>,
    pub sound_effects: Vec<String>,
}
fn active(project: &StoryboardProject) -> impl Iterator<Item = &crate::Shot> {
    project
        .shots
        .iter()
        .filter(|s| s.enabled && s.status != ShotStatus::Archived)
}
fn csv_escape(value: &str) -> String {
    format!("\"{}\"", value.replace('"', "\"\""))
}
pub fn export_csv(project: &StoryboardProject) -> String {
    let mut out = String::from("order,start_ms,end_ms,duration_ms,title,script_text,visual_path\n");
    let mut start = 0;
    for shot in active(project) {
        let end = start + shot.duration_ms;
        let fields = [
            shot.order.to_string(),
            start.to_string(),
            end.to_string(),
            shot.duration_ms.to_string(),
            shot.title.clone(),
            shot.script_text.clone(),
            shot.visual.path.clone(),
        ];
        out.push_str(
            &fields
                .iter()
                .map(|f| csv_escape(f))
                .collect::<Vec<_>>()
                .join(","),
        );
        out.push('\n');
        start = end;
    }
    out
}
pub fn export_markdown(project: &StoryboardProject) -> String {
    let mut out = format!(
        "# {}\n\n{}\n\n| # | 時間 | 標題 | 腳本 | 視覺素材 |\n|---:|---:|---|---|---|\n",
        project.name, project.description
    );
    let mut start = 0;
    for shot in active(project) {
        out.push_str(&format!(
            "| {} | {}–{} ms | {} | {} | {} |\n",
            shot.order,
            start,
            start + shot.duration_ms,
            shot.title.replace('|', "\\|"),
            shot.script_text.replace('|', "\\|"),
            shot.visual.path.replace('|', "\\|")
        ));
        start += shot.duration_ms;
    }
    out
}
fn srt_time(ms: u64) -> String {
    format!(
        "{:02}:{:02}:{:02},{:03}",
        ms / 3_600_000,
        (ms / 60_000) % 60,
        (ms / 1_000) % 60,
        ms % 1_000
    )
}
pub fn export_srt(project: &StoryboardProject) -> String {
    let mut out = String::new();
    let mut start = 0;
    for (index, shot) in active(project).enumerate() {
        let end = start + shot.duration_ms;
        let text = if !shot.narration.text.trim().is_empty() {
            &shot.narration.text
        } else {
            &shot.script_text
        };
        if !text.trim().is_empty() {
            out.push_str(&format!(
                "{}\n{} --> {}\n{}\n\n",
                index + 1,
                srt_time(start),
                srt_time(end),
                text
            ));
        }
        start = end;
    }
    out
}
pub fn build_ffmpeg_plan(project: &StoryboardProject) -> FfmpegPlan {
    FfmpegPlan {
        resolution: (
            project.export_settings.resolution.width,
            project.export_settings.resolution.height,
        ),
        fps: project.export_settings.fps,
        background_color: project.export_settings.background_color.clone(),
        shots: active(project)
            .map(|s| FfmpegShot {
                order: s.order,
                duration_ms: s.duration_ms,
                visual_path: (!s.visual.path.is_empty()).then(|| s.visual.path.clone()),
                narration_path: (!s.narration.path.is_empty()).then(|| s.narration.path.clone()),
                sound_effects: s
                    .sound_effects
                    .iter()
                    .filter(|e| !e.path.is_empty())
                    .map(|e| e.path.clone())
                    .collect(),
            })
            .collect(),
    }
}
