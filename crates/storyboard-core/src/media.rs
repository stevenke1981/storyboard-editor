use serde::Deserialize;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Clone, serde::Serialize)]
pub struct MediaProbe {
    pub duration: Option<f64>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub codec_name: Option<String>,
}
#[derive(Debug, Deserialize)]
struct RawProbe {
    format: Option<RawFormat>,
    streams: Option<Vec<RawStream>>,
}
#[derive(Debug, Deserialize)]
struct RawFormat {
    duration: Option<String>,
}
#[derive(Debug, Deserialize)]
struct RawStream {
    width: Option<u32>,
    height: Option<u32>,
    codec_name: Option<String>,
}

pub fn probe_media(path: impl AsRef<Path>) -> Result<MediaProbe, String> {
    let output = Command::new("ffprobe")
        .args([
            "-v",
            "error",
            "-show_entries",
            "format=duration:stream=width,height,codec_name",
            "-of",
            "json",
        ])
        .arg(path.as_ref())
        .output()
        .map_err(|_| "找不到 ffprobe；請安裝 FFmpeg 或在設定中指定路徑".to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }
    let raw: RawProbe =
        serde_json::from_slice(&output.stdout).map_err(|e| format!("ffprobe 回傳格式錯誤: {e}"))?;
    let stream = raw
        .streams
        .unwrap_or_default()
        .into_iter()
        .find(|s| s.width.is_some() || s.height.is_some() || s.codec_name.is_some());
    Ok(MediaProbe {
        duration: raw
            .format
            .and_then(|f| f.duration.and_then(|d| d.parse().ok())),
        width: stream.as_ref().and_then(|s| s.width),
        height: stream.as_ref().and_then(|s| s.height),
        codec_name: stream.and_then(|s| s.codec_name),
    })
}
