import type { Shot, StoryboardProject } from "../types/storyboard";
import { createId } from "../utils/id";

function now(): string {
  return new Date().toISOString();
}

export function createEmptyShot(order: number, title = `鏡頭 ${String(order).padStart(2, "0")}`): Shot {
  const timestamp = now();
  return {
    id: createId("shot"),
    order,
    title,
    scriptText: "",
    visualDescription: "",
    durationMs: 5000,
    enabled: true,
    status: "draft",
    tags: [],
    visual: {
      kind: "none",
      path: "",
      prompt: "",
      fit: "cover",
      inMs: 0,
      outMs: null,
      posterPath: "",
    },
    narration: {
      text: "",
      path: "",
      voice: "",
      gainDb: 0,
      offsetMs: 0,
      durationMs: null,
    },
    soundEffects: [],
    transition: { type: "cut", durationMs: 0 },
    notes: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

const first = createEmptyShot(1, "開場：提出問題");
first.scriptText = "你是否曾經有一個好點子，卻不知道如何把它變成完整影片？";
first.visualDescription = "深色工作桌，筆記與分鏡紙逐一亮起。";
first.durationMs = 4500;
first.visual.prompt = "cinematic creative desk, storyboard sheets, moody studio light, 16:9";
first.narration.text = first.scriptText;
first.status = "ready";

const second = createEmptyShot(2, "展示工作流程");
second.scriptText = "先把每一鏡的畫面、旁白與節奏安排好，再進入剪輯。";
second.visualDescription = "分鏡卡片依時間軸排列，圖片、影片與音效圖示逐一出現。";
second.durationMs = 6500;
second.visual.kind = "image";
second.visual.path = "02_visuals/images/workflow-board.png";
second.narration.text = second.scriptText;
second.soundEffects = [{
  id: createId("sfx"),
  name: "輕柔提示音",
  path: "03_audio/sfx/soft-pop.wav",
  startMs: 1100,
  trimInMs: 0,
  trimOutMs: null,
  gainDb: -8,
  loop: false,
  fadeInMs: 0,
  fadeOutMs: 120,
}];

const third = createEmptyShot(3, "完成分鏡");
third.scriptText = "所有素材準備完成後，就能匯出給剪輯軟體或自動化工具。";
third.visualDescription = "完成狀態與匯出按鈕，畫面簡潔、專業。";
third.durationMs = 5000;
third.transition = { type: "fade", durationMs: 400 };
third.narration.text = third.scriptText;

export const demoProject: StoryboardProject = {
  schemaVersion: 1,
  id: createId("project"),
  name: "Storyboard Editor 示範影片",
  description: "展示每一鏡文字、素材、旁白與音效的管理方式。",
  language: "zh-TW",
  aspectRatio: "16:9",
  createdAt: now(),
  updatedAt: now(),
  tags: ["demo", "youtube"],
  exportSettings: {
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    audioSampleRate: 48000,
    backgroundColor: "#111827",
  },
  shots: [first, second, third],
};
