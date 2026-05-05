import { useState } from "react";
import { registerUser } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import "../css/auth.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(email, password);
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Ошибка регистрации");
    }
  };

  return (
    <div className="auth-container">
      <h2>Регистрация</h2>
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
        <button type="submit">Создать аккаунт</button>
      </form>
      <div className="auth-footer">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </div>
    </div>
  );
}
