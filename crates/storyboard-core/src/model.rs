use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct StoryboardProject {
    pub schema_version: u32,
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub language: String,
    pub aspect_ratio: AspectRatio,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tags: Vec<String>,
    pub export_settings: ExportSettings,
    pub shots: Vec<Shot>,
}

impl StoryboardProject {
    pub fn new(name: impl Into<String>) -> Self {
        let now = Utc::now();
        let mut first = Shot::new(1, "鏡頭 01");
        first.visual_description = "輸入這一鏡的畫面描述。".to_string();
        Self {
            schema_version: 1,
            id: Uuid::new_v4(),
            name: name.into(),
            description: String::new(),
            language: "zh-TW".to_string(),
            aspect_ratio: AspectRatio::SixteenNine,
            created_at: now,
            updated_at: now,
            tags: Vec::new(),
            export_settings: ExportSettings::default(),
            shots: vec![first],
        }
    }

    pub fn enabled_duration_ms(&self) -> u64 {
        self.shots
            .iter()
            .filter(|shot| shot.enabled && shot.status != ShotStatus::Archived)
            .map(|shot| shot.duration_ms)
            .sum()
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum AspectRatio {
    #[serde(rename = "16:9")]
    SixteenNine,
    #[serde(rename = "9:16")]
    NineSixteen,
    #[serde(rename = "1:1")]
    OneOne,
    #[serde(rename = "4:3")]
    FourThree,
    #[serde(rename = "21:9")]
    TwentyOneNine,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ExportSettings {
    pub resolution: Resolution,
    pub fps: u32,
    pub audio_sample_rate: u32,
    pub background_color: String,
}

impl Default for ExportSettings {
    fn default() -> Self {
        Self {
            resolution: Resolution { width: 1920, height: 1080 },
            fps: 30,
            audio_sample_rate: 48_000,
            background_color: "#111827".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Resolution {
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Shot {
    pub id: Uuid,
    pub order: u32,
    pub title: String,
    pub script_text: String,
    pub visual_description: String,
    pub duration_ms: u64,
    pub enabled: bool,
    pub status: ShotStatus,
    pub tags: Vec<String>,
    pub visual: VisualAsset,
    pub narration: NarrationTrack,
    pub sound_effects: Vec<SoundEffect>,
    pub transition: Transition,
    pub notes: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Shot {
    pub fn new(order: u32, title: impl Into<String>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            order,
            title: title.into(),
            script_text: String::new(),
            visual_description: String::new(),
            duration_ms: 5_000,
            enabled: true,
            status: ShotStatus::Draft,
            tags: Vec::new(),
            visual: VisualAsset::default(),
            narration: NarrationTrack::default(),
            sound_effects: Vec::new(),
            transition: Transition::default(),
            notes: String::new(),
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum ShotStatus {
    Draft,
    Ready,
    NeedsReview,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct VisualAsset {
    pub kind: VisualKind,
    pub path: String,
    pub prompt: String,
    pub fit: VisualFit,
    pub in_ms: u64,
    pub out_ms: Option<u64>,
    pub poster_path: String,
}

impl Default for VisualAsset {
    fn default() -> Self {
        Self {
            kind: VisualKind::None,
            path: String::new(),
            prompt: String::new(),
            fit: VisualFit::Cover,
            in_ms: 0,
            out_ms: None,
            poster_path: String::new(),
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum VisualKind { None, Image, Video }

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum VisualFit { Contain, Cover, Stretch }

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct NarrationTrack {
    pub text: String,
    pub path: String,
    pub voice: String,
    pub gain_db: f32,
    pub offset_ms: u64,
    pub duration_ms: Option<u64>,
}

impl Default for NarrationTrack {
    fn default() -> Self {
        Self { text: String::new(), path: String::new(), voice: String::new(), gain_db: 0.0, offset_ms: 0, duration_ms: None }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SoundEffect {
    pub id: Uuid,
    pub name: String,
    pub path: String,
    pub start_ms: u64,
    pub trim_in_ms: u64,
    pub trim_out_ms: Option<u64>,
    pub gain_db: f32,
    #[serde(rename = "loop")]
    pub looped: bool,
    pub fade_in_ms: u64,
    pub fade_out_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Transition {
    #[serde(rename = "type")]
    pub transition_type: TransitionType,
    pub duration_ms: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_name: Option<String>,
}

impl Default for Transition {
    fn default() -> Self {
        Self { transition_type: TransitionType::Cut, duration_ms: 0, custom_name: None }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum TransitionType { Cut, Fade, Dissolve, Wipe, Custom }
