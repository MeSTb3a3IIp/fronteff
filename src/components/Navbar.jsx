import { Link } from "react-router-dom";
import "../css/navbar.css";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/projects" className="nav-logo">
          EFF DevOps
        </Link>
      </div>
      <div className="nav-right">
        <Link to="/projects" className="nav-link">
          Проекты
        </Link>
        <button
          className="nav-btn"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Выйти
        </button>
      </div>
    </nav>
  );
}
