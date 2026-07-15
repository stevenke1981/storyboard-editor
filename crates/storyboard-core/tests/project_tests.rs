use storyboard_core::{create_project, load_project, sanitize_project_name, validate_project, StoryboardProject, ValidationSeverity};
use storyboard_core::{build_ffmpeg_plan, export_csv, export_markdown, export_srt};

#[test]
fn sanitizes_windows_names() {
    assert_eq!(sanitize_project_name("a:b?c"), "a_b_c");
    assert_eq!(sanitize_project_name("CON"), "_CON");
}

#[test]
fn creates_and_loads_project() {
    let temp = tempfile::tempdir().unwrap();
    let path = create_project(temp.path(), "測試影片").unwrap();
    let project = load_project(&path).unwrap();
    assert_eq!(project.name, "測試影片");
    assert_eq!(project.shots.len(), 1);
}

#[test]
fn rejects_too_short_shot() {
    let mut project = StoryboardProject::new("Test");
    project.shots[0].duration_ms = 10;
    let issues = validate_project(&project);
    assert!(issues.iter().any(|issue| issue.severity == ValidationSeverity::Error));
}

#[test]
fn exports_active_shots() {
    let mut project = StoryboardProject::new("Export");
    project.shots[0].script_text = "Hello".into();
    project.shots[0].narration.text = "Voice".into();
    assert!(export_csv(&project).contains("Hello"));
    assert!(export_markdown(&project).contains("Export"));
    assert!(export_srt(&project).contains("Voice"));
    assert_eq!(build_ffmpeg_plan(&project).shots.len(), 1);
}
