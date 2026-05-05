import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Accept": "application/json",
  },
});

// Request interceptor: добавляем токен и обрабатываем 401 централизованно
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // Убрать или уменьшить логирование в проде
  console.debug("API request:", config.method, config.url, "TOKEN:", !!token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: можно централизованно ловить 401 и др.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // при 401 — очистим токен и редирект на логин
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Возвращаем res.data — удобнее в компонентах
export const listProjects = () => api.get("/projects").then(res => res);

// createProject: явно отправляем JSON и возвращаем полный ответ
export const createProject = (name) =>
  api.post("/projects", { name }, { headers: { "Content-Type": "application/json" } })
     .then(res => res);

// deleteProject: возвращаем ответ, фронт решает, что с ним делать
export const deleteProject = (id) =>
  api.delete(`/projects/${id}`).then(res => res);

// Остальные методы
export const getProject = (id) =>
  api.get(`/projects/${id}`).then(res => res);

// saveData — использовать PUT
export const saveData = (id, data) =>
  api.put(`/projects/${id}/data`, data, { headers: { "Content-Type": "application/json" } });


// startAnalysis — использовать путь start-analysis
export const startAnalysis = (id) =>
  api.post(`/projects/${id}/start-analysis`);


export default api;
