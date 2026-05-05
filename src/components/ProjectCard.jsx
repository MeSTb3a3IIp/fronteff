import "../css/projectcard.css";

export default function ProjectCard({ project, onOpen, onDeleteIcon, onClick, highlight }) {
  // нормализуем имя и id — поддерживаем PascalCase и camelCase
  const id = project.id ?? project.ID;
  const name = project.name ?? project.Name ?? "Без названия";

  return (
    <div
      className={`project-tile ${highlight ? "highlight" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
      data-project-id={id}
    >
      <div className="tile-title">{name}</div>

      <div className="tile-actions" onClick={(e) => e.stopPropagation()}>
        <button className="icon-small" onClick={onOpen} title="Открыть">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button className="icon-small" onClick={onDeleteIcon} title="Удалить (сначала нажмите эту, затем кликните проект)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
