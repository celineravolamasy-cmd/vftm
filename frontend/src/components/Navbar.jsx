import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo">
        <h2>VFTM</h2>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/actualites">Actualités</Link></li>
        <li><Link to="/projets">Projets</Link></li>
        <li><Link to="/association">Association</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>

      <button
        className="login-btn"
        onClick={() => navigate("/login")}
      >
        Se connecter
      </button>
    </nav>
  );
}

export default Navbar;
