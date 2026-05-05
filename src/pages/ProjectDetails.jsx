import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject, saveData, startAnalysis } from "../api/projects";
import Navbar from "../components/Navbar";
import Flatpickr from "react-flatpickr";
// убрали тему: import "flatpickr/dist/themes/material_blue.css";
import "flatpickr/dist/flatpickr.css"; // базовые стили flatpickr (если нужны)
import "../css/projectdetails.css";

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [kubeconfig, setKubeconfig] = useState("");
  const [promURL, setPromURL] = useState("");
  const [analysisStart, setAnalysisStart] = useState(null); // Date or null
  const [analysisEnd, setAnalysisEnd] = useState(null);     // Date or null
  const [loading, setLoading] = useState(false);

  // Парсит ответ сервера в Date (поддерживает YYYY-MM-DD и ISO)
  const parseISO = (iso) => {
    if (!iso) return null;
    // Если сервер прислал только YYYY-MM-DD — явно интерпретируем как UTC midnight
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      iso = `${iso}T00:00:00Z`;
    }
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  };

  // Форматирует Date -> ISO (RFC3339) для отправки на сервер
  const toServerISO = (date) => {
    if (!date) return "";
    return date.toISOString();
  };

  // Для отображения интервала в UTC (человечески)
  const toReadableUTC = (date) => {
    if (!date) return "";
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const hh = String(date.getUTCHours()).padStart(2, "0");
    const min = String(date.getUTCMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`;
  };

  const load = async () => {
    try {
      const res = await getProject(id);
      setProject(res.data);
      setKubeconfig(res.data.kubeconfig || "");
      setPromURL(res.data.prometheus_url || "");
      // API может хранить либо date-only либо ISO; пытаем парсить
      setAnalysisStart(parseISO(res.data.analysis_start));
      setAnalysisEnd(parseISO(res.data.analysis_end));
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const save = async () => {
    try {
      // Отправляем ISO (RFC3339) или пустую строку
      const payload = {
        kubeconfig,
        prometheus_url: promURL,
        analysis_start: toServerISO(analysisStart),
        analysis_end: toServerISO(analysisEnd),
      };

      await saveData(id, payload);

      // Обновляем локально, чтобы UI сразу отражал изменения
      setProject((p) => ({
        ...p,
        analysis_start: payload.analysis_start || "",
        analysis_end: payload.analysis_end || "",
      }));

      // Обновляем state из ответа сервера (на случай, если сервер изменил/нормализовал)
      await load();

      alert("Данные сохранены");
    } catch (err) {
      console.error(err);
      alert("Ошибка сохранения данных проекта");
    }
  };

  const analyze = async () => {
    try {
      setLoading(true);
      // Отправляем ISO; если backend не принимает тело — сначала save(), затем startAnalysis(id)
      await startAnalysis(id, {
        analysis_start: toServerISO(analysisStart),
        analysis_end: toServerISO(analysisEnd),
      });
      await load();
    } catch (err) {
      console.error(err);
      alert("Ошибка анализа проекта");
    } finally {
      setLoading(false);
    }
  };

  const downloadTxt = () => {
    if (!project?.recommendations) return;
    const blob = new Blob([project.recommendations], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recommendations_${project.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!project) return null;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="project-header">
          <h2>Проект: {project.name}</h2>
          <button onClick={() => (window.location.href = "/projects")}>
            ← К списку проектов
          </button>
        </div>

        <div className="project-section">
          <h3>Настройки подключения</h3>

          <label>Kubeconfig</label>
          <textarea
            placeholder="Вставьте kubeconfig"
            value={kubeconfig}
            onChange={(e) => setKubeconfig(e.target.value)}
            rows={10}
          />

          <label>Prometheus URL</label>
          <input
            placeholder="http://prometheus:9090"
            value={promURL}
            onChange={(e) => setPromURL(e.target.value)}
          />

          <label>Начало анализа</label>
          <Flatpickr
            value={analysisStart}
            onChange={(dates) => setAnalysisStart(dates[0] || null)}
            options={{
              enableTime: true,
              time_24hr: false,           // 12-hour AM/PM
              dateFormat: "Y-m-d h:i K",  // h - 12-hour, K - AM/PM
            }}
          />

          <label>Конец анализа</label>
          <Flatpickr
            value={analysisEnd}
            onChange={(dates) => setAnalysisEnd(dates[0] || null)}
            options={{
              enableTime: true,
              time_24hr: false,
              dateFormat: "Y-m-d h:i K",
            }}
          />

          <div className="buttons-row" style={{ marginTop: 8 }}>
            <button onClick={save}>Сохранить</button>
            <button onClick={analyze} disabled={loading}>
              {loading ? "Анализ..." : "Начать анализ"}
            </button>
          </div>

          
        </div>

        <div className="project-section">
          <h3>Результаты анализа</h3>
          {!project.recommendations && (
            <div className="empty">Рекомендаций пока нет. Запустите анализ.</div>
          )}
          {project.recommendations && (
            <>
              <pre className="report-box">{project.recommendations}</pre>
              <button onClick={downloadTxt}>Скачать рекомендации (.txt)</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
