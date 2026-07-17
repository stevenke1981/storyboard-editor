import { Icon } from "./Icon";

interface TopBarProps {
  projectName: string;
  shotCount: number;
  dirty: boolean;
  persistenceError: string | null;
  playing: boolean;
  onAdd: () => void;
  onTogglePlay: () => void;
  onExportJson: () => void;
  onExportArtifacts: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onCheckUpdate: () => void;
}

export function TopBar({ projectName, shotCount, dirty, persistenceError, playing, onAdd, onTogglePlay, onExportJson, onExportArtifacts, onUndo, onRedo, canUndo, canRedo, onCheckUpdate }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Icon name="spark" /></div><div><strong>Storyboard Editor</strong><span>{projectName}</span></div></div>
      <div className="topbar-status" aria-live="polite">
        <span>{shotCount} 鏡</span>
        <span className={persistenceError ? "save-state error" : dirty ? "save-state dirty" : "save-state"}>{persistenceError ? `儲存失敗：${persistenceError}` : dirty ? "自動保存中…" : "已儲存"}</span>
      </div>
      <div className="topbar-actions">
        <button className="button ghost" onClick={onUndo} disabled={!canUndo} aria-label="復原">復原</button>
        <button className="button ghost" onClick={onRedo} disabled={!canRedo} aria-label="重做">重做</button>
        <button className="button ghost" onClick={onCheckUpdate} aria-label="檢查更新">檢查更新</button>
        <button className="button ghost" onClick={onAdd}><Icon name="plus" />新增鏡頭</button>
        <button className="button" onClick={onTogglePlay}><Icon name={playing ? "pause" : "play" />}{playing ? "暫停" : "預覽"}</button>
        <button className="button" onClick={onExportJson}><Icon name="download" />JSON</button>
        <button className="button primary" onClick={onExportArtifacts}><Icon name="download" />匯出專案</button>
      </div>
    </header>
  );
}
