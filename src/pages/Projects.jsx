import { useEffect, useState } from "react";
import { listProjects, createProject, deleteProject } from "../api/projects";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import "../css/projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [awaitingDelete, setAwaitingDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Загрузка списка проектов с API
  const load = async () => {
    try {
      const res = await listProjects();
      const safe = Array.isArray(res.data) ? res.data : [];
      console.log("LOAD /api/projects ->", safe);
      setProjects(safe);
    } catch (err) {
      console.error("listProjects error:", err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
      } else {
        setProjects([]);
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setName("");
    setShowCreateModal(true);
  };

  // Всегда вызываем create у API, затем обязательно делаем load()
  const create = async (e) => {
    e?.preventDefault?.();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createProject(name.trim());
      // Гарантированно синхронизируем состояние с БД
      await load();
      setShowCreateModal(false);
      setName("");
    } catch (err) {
      console.error("createProject error:", err);
      alert("Ошибка создания проекта");
    } finally {
      setCreating(false);
    }
  };

  const startDeleteMode = () => {
    setAwaitingDelete(true);
    // авто-отмена режима удаления через 10 секунд
    setTimeout(() => setAwaitingDelete(false), 10000);
  };

  const onProjectClick = (p) => {
    // поддерживаем оба формата полей (camelCase / PascalCase)
    const id = p.id ?? p.ID;
    const nameVal = p.name ?? p.Name;
    if (awaitingDelete) {
      setConfirmDelete({ id, name: nameVal });
      setAwaitingDelete(false);
      return;
    }
    window.location.href = `/projects/${id}`;
  };

  const confirmDeleteOk = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteProject(confirmDelete.id);
      // после удаления — перезагружаем список с сервера
      await load();
      setConfirmDelete(null);
    } catch (err) {
      console.error("deleteProject error:", err);
      alert("Ошибка удаления проекта");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteCancel = () => {
    setConfirmDelete(null);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="projects-header">
          <h2>Ваши проекты</h2>

          <div className="header-actions">
            <button className="icon-btn" onClick={openCreate} title="Создать проект">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className={`icon-btn ${awaitingDelete ? "active" : ""}`}
              onClick={startDeleteMode}
              title="Удалить проект (сначала нажмите эту иконку, затем кликните проект)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="projects-list-grid">
          {projects.length === 0 && (
            <div className="empty">Проектов пока нет. Создайте первый.</div>
          )}

          {projects.map((p, index) => (
            <ProjectCard
              key={`${(p.id ?? p.ID)}-${(p.name ?? p.Name)}-${index}`}
              project={p}
              onOpen={() => onProjectClick(p)}
              onDeleteIcon={() => startDeleteMode()}
              onClick={() => onProjectClick(p)}
              highlight={confirmDelete?.id === (p.id ?? p.ID)}
            />
          ))}
        </div>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowCreateModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3>Создать проект</h3>
            <form onSubmit={create}>
              <input
                autoFocus
                placeholder="Название проекта"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowCreateModal(false)}>Отмена</button>
                <button type="submit" disabled={creating}>{creating ? "Создаём..." : "Окей"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {awaitingDelete && (
        <div className="toast">Нажмите на проект, который хотите удалить</div>
      )}

      {confirmDelete && (
        <div className="modal-backdrop" onMouseDown={confirmDeleteCancel}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3>Подтвердите удаление</h3>
            <p>Вы уверены, что хотите удалить проект «{confirmDelete.name}»?</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={confirmDeleteCancel}>Отмена</button>
              <button className="danger" onClick={confirmDeleteOk} disabled={deleting}>
                {deleting ? "Удаляем..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
