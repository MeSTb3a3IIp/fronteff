import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const registerUser = (email, password) =>
  api.post("/auth/register", { email, password });
