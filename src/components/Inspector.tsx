import type { Shot, SoundEffect } from "../types/storyboard";
import { clampDuration } from "../utils/time";
import { Icon } from "./Icon";

interface InspectorProps {
  shot: Shot | null;
  onUpdate: (patch: Partial<Shot>) => void;
  onAddSfx: () => void;
  onUpdateSfx: (sfxId: string, patch: Partial<SoundEffect>) => void;
  onRemoveSfx: (sfxId: string) => void;
}

function NumberField({ label, value, min = 0, step = 1, onChange, suffix }: { label: string; value: number; min?: number; step?: number; onChange: (value: number) => void; suffix?: string }) {
  return <label className="field"><span>{label}</span><div className="input-with-suffix"><input type="number" value={value} min={min} step={step} onChange={(e) => onChange(Number(e.target.value))} />{suffix && <em>{suffix}</em>}</div></label>;
}

export function Inspector({ shot, onUpdate, onAddSfx, onUpdateSfx, onRemoveSfx }: InspectorProps) {
  if (!shot) return <aside className="inspector panel"><div className="empty-state">請選擇鏡頭</div></aside>;
  return (
    <aside className="inspector panel" aria-label="鏡頭屬性">
      <div className="panel-heading"><div><span>鏡頭屬性</span><strong>#{String(shot.order).padStart(2, "0")}</strong></div></div>
      <div className="inspector-scroll">
        <section className="inspector-section">
          <h3>基本設定</h3>
          <label className="field"><span>鏡頭標題</span><input value={shot.title} onChange={(e) => onUpdate({ title: e.target.value })} /></label>
          <div className="field-grid">
            <NumberField label="時長" value={shot.durationMs / 1000} min={0.1} step={0.1} suffix="秒" onChange={(v) => onUpdate({ durationMs: clampDuration(v * 1000) })} />
            <label className="field"><span>狀態</span><select value={shot.status} onChange={(e) => onUpdate({ status: e.target.value as Shot["status"] })}><option value="draft">草稿</option><option value="needs-review">待審核</option><option value="ready">已完成</option></select></label>
          </div>
          <label className="check-field"><input type="checkbox" checked={shot.enabled} onChange={(e) => onUpdate({ enabled: e.target.checked })} /><span>納入預覽與輸出</span></label>
        </section>

        <section className="inspector-section">
          <h3>文字與畫面</h3>
          <label className="field"><span>文字／腳本</span><textarea rows={4} value={shot.scriptText} onChange={(e) => onUpdate({ scriptText: e.target.value })} /></label>
          <label className="field"><span>畫面描述</span><textarea rows={3} value={shot.visualDescription} onChange={(e) => onUpdate({ visualDescription: e.target.value })} /></label>
        </section>

        <section className="inspector-section">
          <h3>圖片或影片</h3>
          <label className="field"><span>視覺類型</span><select value={shot.visual.kind} onChange={(e) => onUpdate({ visual: { ...shot.visual, kind: e.target.value as Shot["visual"]["kind"] } })}><option value="none">尚未指定</option><option value="image">圖片</option><option value="video">影片</option></select></label>
          <label className="field"><span>素材相對路徑</span><input placeholder="02_visuals/images/scene-01.png" value={shot.visual.path} onChange={(e) => onUpdate({ visual: { ...shot.visual, path: e.target.value } })} /></label>
          <label className="field"><span>選擇本機素材（瀏覽器預覽）</span><input type="file" accept="image/*,video/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpdate({ visual: { ...shot.visual, path: URL.createObjectURL(file) } }); }} /></label>
          <label className="field"><span>圖片／影片生成提示詞</span><textarea rows={4} value={shot.visual.prompt} onChange={(e) => onUpdate({ visual: { ...shot.visual, prompt: e.target.value } })} /></label>
          <div className="field-grid">
            <label className="field"><span>適配</span><select value={shot.visual.fit} onChange={(e) => onUpdate({ visual: { ...shot.visual, fit: e.target.value as Shot["visual"]["fit"] } })}><option value="cover">填滿裁切</option><option value="contain">完整顯示</option><option value="stretch">拉伸</option></select></label>
            {shot.visual.kind === "video" && <NumberField label="素材起點" value={shot.visual.inMs / 1000} min={0} step={0.1} suffix="秒" onChange={(v) => onUpdate({ visual: { ...shot.visual, inMs: Math.max(0, v * 1000) } })} />}
          </div>
        </section>

        <section className="inspector-section">
          <h3>旁白</h3>
          <label className="field"><span>旁白文字</span><textarea rows={4} value={shot.narration.text} onChange={(e) => onUpdate({ narration: { ...shot.narration, text: e.target.value } })} /></label>
          <label className="field"><span>旁白音檔</span><input placeholder="03_audio/narration/shot-01.wav" value={shot.narration.path} onChange={(e) => onUpdate({ narration: { ...shot.narration, path: e.target.value } })} /></label>
          <div className="field-grid">
            <label className="field"><span>聲音／角色</span><input value={shot.narration.voice} onChange={(e) => onUpdate({ narration: { ...shot.narration, voice: e.target.value } })} /></label>
            <NumberField label="延遲" value={shot.narration.offsetMs / 1000} min={0} step={0.1} suffix="秒" onChange={(v) => onUpdate({ narration: { ...shot.narration, offsetMs: Math.max(0, v * 1000) } })} />
          </div>
          <NumberField label="旁白音量" value={shot.narration.gainDb} min={-60} step={1} suffix="dB" onChange={(v) => onUpdate({ narration: { ...shot.narration, gainDb: v } })} />
        </section>

        <section className="inspector-section">
          <div className="section-title-row"><h3>音效</h3><button className="small-button" onClick={onAddSfx}><Icon name="plus" />新增</button></div>
          {shot.soundEffects.length === 0 && <div className="inline-empty">尚未加入音效</div>}
          {shot.soundEffects.map((sfx, index) => (
            <div className="sfx-card" key={sfx.id}>
              <div className="sfx-title"><strong>音效 {index + 1}</strong><button onClick={() => onRemoveSfx(sfx.id)}>移除</button></div>
              <label className="field"><span>名稱</span><input value={sfx.name} onChange={(e) => onUpdateSfx(sfx.id, { name: e.target.value })} /></label>
              <label className="field"><span>檔案</span><input placeholder="03_audio/sfx/hit.wav" value={sfx.path} onChange={(e) => onUpdateSfx(sfx.id, { path: e.target.value })} /></label>
              <div className="field-grid">
                <NumberField label="開始" value={sfx.startMs / 1000} min={0} step={0.1} suffix="秒" onChange={(v) => onUpdateSfx(sfx.id, { startMs: Math.max(0, v * 1000) })} />
                <NumberField label="音量" value={sfx.gainDb} min={-60} step={1} suffix="dB" onChange={(v) => onUpdateSfx(sfx.id, { gainDb: v })} />
              </div>
            </div>
          ))}
        </section>

        <section className="inspector-section">
          <h3>轉場與備註</h3>
          <div className="field-grid">
            <label className="field"><span>轉場</span><select value={shot.transition.type} onChange={(e) => onUpdate({ transition: { ...shot.transition, type: e.target.value as Shot["transition"]["type"] } })}><option value="cut">直接切換</option><option value="fade">淡入淡出</option><option value="dissolve">溶解</option><option value="wipe">擦拭</option><option value="custom">自訂</option></select></label>
            <NumberField label="轉場長度" value={shot.transition.durationMs / 1000} min={0} step={0.1} suffix="秒" onChange={(v) => onUpdate({ transition: { ...shot.transition, durationMs: Math.max(0, v * 1000) } })} />
          </div>
          <label className="field"><span>製作備註</span><textarea rows={4} value={shot.notes} onChange={(e) => onUpdate({ notes: e.target.value })} /></label>
        </section>
      </div>
    </aside>
  );
}
