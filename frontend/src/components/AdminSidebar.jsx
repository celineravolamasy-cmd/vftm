import { Link } from "react-router-dom";

function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <h2 className="admin-logo">VFTM</h2>

      <ul>
        <li><Link to="/admin">🏠 Tableau de bord</Link></li>
        <li><Link to="/admin/actualites">📰 Actualités</Link></li>
        <li><Link to="/admin/projets">📁 Projets</Link></li>
        <li><Link to="/admin/partenaires">🤝 Partenaires</Link></li>
        <li><Link to="/admin/messages">📨 Messages</Link></li>
        <li><Link to="/">🚪 Déconnexion</Link></li>
      </ul>
    </div>
  );
}

export default AdminSidebar;