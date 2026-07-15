import type { Shot } from "../types/storyboard";
import { formatDuration } from "../utils/time";
import { Icon } from "./Icon";

interface ShotListProps {
  shots: Shot[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

function kindIcon(shot: Shot): "image" | "video" | "spark" {
  return shot.visual.kind === "image" ? "image" : shot.visual.kind === "video" ? "video" : "spark";
}

export function ShotList({ shots, selectedId, onSelect, onAdd, onDuplicate, onArchive, onMove }: ShotListProps) {
  const visible = shots.filter((shot) => shot.status !== "archived");
  const moveBefore = (sourceId: string, targetId: string) => {
    const from = visible.findIndex((shot) => shot.id === sourceId);
    const to = visible.findIndex((shot) => shot.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    const direction = from < to ? 1 : -1;
    for (let index = from; index !== to; index += direction) onMove(sourceId, direction);
  };
  return (
    <aside className="shot-panel panel" aria-label="鏡頭清單">
      <div className="panel-heading">
        <div><span>鏡頭</span><strong>{visible.length}</strong></div>
        <button className="icon-button" onClick={onAdd} aria-label="新增鏡頭" title="新增鏡頭"><Icon name="plus" /></button>
      </div>
      <div className="shot-list" role="listbox" aria-label="鏡頭">
        {visible.map((shot, index) => (
          <article
            key={shot.id}
            role="option"
            aria-selected={shot.id === selectedId}
            tabIndex={0}
            className={`shot-row ${shot.id === selectedId ? "selected" : ""}`}
            draggable
            onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/shot-id", shot.id); }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => { event.preventDefault(); const source = event.dataTransfer.getData("text/shot-id"); if (source) moveBefore(source, shot.id); }}
            onClick={() => onSelect(shot.id)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(shot.id); }}
          >
            <div className="shot-thumb"><Icon name={kindIcon(shot)} /></div>
            <div className="shot-copy">
              <div className="shot-title"><span>{String(index + 1).padStart(2, "0")}</span>{shot.title}</div>
              <div className="shot-meta">{formatDuration(shot.durationMs)} · {shot.status === "ready" ? "已完成" : "草稿"}</div>
            </div>
            {shot.id === selectedId && (
              <div className="shot-actions">
                <button onClick={(e) => { e.stopPropagation(); onMove(shot.id, -1); }} aria-label="上移"><Icon name="up" /></button>
                <button onClick={(e) => { e.stopPropagation(); onMove(shot.id, 1); }} aria-label="下移"><Icon name="down" /></button>
                <button onClick={(e) => { e.stopPropagation(); onDuplicate(shot.id); }} aria-label="複製"><Icon name="copy" /></button>
                <button onClick={(e) => { e.stopPropagation(); onArchive(shot.id); }} aria-label="封存"><Icon name="archive" /></button>
              </div>
            )}
          </article>
        ))}
      </div>
      <button className="add-shot-row" onClick={onAdd}><Icon name="plus" />新增下一鏡</button>
    </aside>
  );
}
