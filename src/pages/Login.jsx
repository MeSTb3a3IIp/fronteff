import { useState } from "react";
import { login } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import "../css/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      localStorage.setItem("token", res.data.token);
      navigate("/projects");
    } catch (err) {
      console.error(err);
      alert("Ошибка входа");
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Войти</button>
      </form>
      <div className="auth-footer">
        Нет аккаунта? <Link to="/register">Регистрация</Link>
      </div>
    </div>
  );
}
