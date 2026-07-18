use std::path::PathBuf;

use anyhow::{bail, Context, Result};
use clap::{Parser, Subcommand};
use storyboard_core::{
    build_ffmpeg_plan, create_project, export_csv, export_markdown, export_script, export_srt,
    load_project, probe_media, validate_project, ValidationSeverity,
};

#[derive(Parser)]
#[command(
    name = "storyboard-cli",
    version,
    about = "Storyboard Editor automation CLI"
)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    New {
        #[arg(long)]
        root: PathBuf,
        #[arg(long)]
        title: String,
    },
    Validate {
        #[arg(long)]
        project: PathBuf,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Summary {
        #[arg(long)]
        project: PathBuf,
    },
    Export {
        #[arg(long)]
        project: PathBuf,
        #[arg(long)]
        format: String,
    },
    Probe {
        #[arg(long)]
        media: PathBuf,
    },
    YtpmScript {
        #[arg(long)]
        project: PathBuf,
    },
}

fn main() -> Result<()> {
    match Cli::parse().command {
        Command::New { root, title } => {
            let path =
                create_project(root, &title).context("failed to create storyboard project")?;
            println!("{}", path.display());
        }
        Command::Validate { project, json } => {
            let project_data =
                load_project(&project).context("failed to load storyboard project")?;
            let issues = validate_project(&project_data);
            if json {
                let output: Vec<_> = issues
                    .iter()
                    .map(|issue| {
                        serde_json::json!({
                            "severity": format!("{:?}", issue.severity).to_lowercase(),
                            "path": issue.path,
                            "message": issue.message,
                        })
                    })
                    .collect();
                println!("{}", serde_json::to_string_pretty(&output)?);
            } else if issues.is_empty() {
                println!("OK: no validation issues");
            } else {
                for issue in &issues {
                    println!("{:?} {}: {}", issue.severity, issue.path, issue.message);
                }
            }
            if issues
                .iter()
                .any(|i| i.severity == ValidationSeverity::Error)
            {
                bail!("validation failed");
            }
        }
        Command::Summary { project } => {
            let data = load_project(project)?;
            println!("Project: {}", data.name);
            println!("Shots: {}", data.shots.len());
            println!(
                "Duration: {:.3}s",
                data.enabled_duration_ms() as f64 / 1000.0
            );
            println!("Aspect ratio: {:?}", data.aspect_ratio);
        }
        Command::Export { project, format } => {
            let data = load_project(project)?;
            match format.as_str() {
                "csv" => print!("{}", export_csv(&data)),
                "md" | "markdown" => print!("{}", export_markdown(&data)),
                "srt" => print!("{}", export_srt(&data)),
                "ffmpeg-plan" => println!(
                    "{}",
                    serde_json::to_string_pretty(&build_ffmpeg_plan(&data))?
                ),
                other => {
                    bail!("unsupported export format: {other} (use csv, md, srt, ffmpeg-plan)")
                }
            }
        }
        Command::Probe { media } => match probe_media(media) {
            Ok(result) => println!("{}", serde_json::to_string_pretty(&result)?),
            Err(error) => bail!(error),
        },
        Command::YtpmScript { project } => print!("{}", export_script(&load_project(project)?)),
    }
    Ok(())
}
