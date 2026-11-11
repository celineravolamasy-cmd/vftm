import API_URL from '../services/api';

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Newspaper,
  FolderKanban,
  Handshake,
  MessageSquare,
  LogOut,
} from "lucide-react";



function AdminSidebar() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================================
  // REDIRECTION SI SESSION EXPIREE
  // ==================================

  const sessionExpiree = () => {

    localStorage.removeItem("user");

    navigate("/login", { replace: true });

  };

  // ==================================
  // DECONNEXION SECURISEE AVEC CSRF
  // ==================================

  const handleLogout = async () => {

    if (loading) return;

    setLoading(true);
    setError("");

    try {

      // ==============================
      // 1. RECUPERER LE CSRF TOKEN
      // ==============================

      const checkResponse = await fetch(
        `${API_URL}/auth/check`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (checkResponse.status === 401) {

        sessionExpiree();
        return;

      }

      if (!checkResponse.ok) {

        throw new Error(
          "Impossible de vérifier la session."
        );

      }

      const checkData = await checkResponse.json();

      const csrfToken = checkData.csrf_token;

      if (!csrfToken) {

        throw new Error(
          "Token CSRF introuvable."
        );

      }

      // ==============================
      // 2. DECONNEXION AVEC CSRF
      // ==============================

      const response = await fetch(
        `${API_URL}/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      if (response.status === 401) {

        sessionExpiree();
        return;

      }

      if (!response.ok) {

        throw new Error(
          "Échec de la déconnexion."
        );

      }

      // ==============================
      // 3. NETTOYAGE LOCAL
      // ==============================

      localStorage.removeItem("user");

      // ==============================
      // 4. RETOUR VERS LOGIN
      // ==============================

      navigate("/login", { replace: true });

    } catch (error) {

      console.error(
        "Erreur déconnexion :",
        error
      );

      setError(
        "Déconnexion impossible. Veuillez réessayer."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="admin-sidebar">

      {/* Logo VFTM */}

      <div className="admin-logo">
        <img
          src="/images/logo-vftm.png"
          alt="Logo VFTM"
        />
      </div>

      {/* Menu */}

      <ul>

        <li>
          <Link to="/admin">
            <LayoutDashboard size={20} />
            <span>Tableau de bord</span>
          </Link>
        </li>

        <li>
          <Link to="/admin/actualites">
            <Newspaper size={20} />
            <span>Actualités</span>
          </Link>
        </li>

        <li>
          <Link to="/admin/projets">
            <FolderKanban size={20} />
            <span>Projets</span>
          </Link>
        </li>

        <li>
          <Link to="/admin/partenaires">
            <Handshake size={20} />
            <span>Partenaires</span>
          </Link>
        </li>

        <li>
          <Link to="/admin/messages">
            <MessageSquare size={20} />
            <span>Messages</span>
          </Link>
        </li>

        <li>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              width: "100%",
              padding: "12px 15px",
              background: "transparent",
              border: "none",
              color: "inherit",
              font: "inherit",
              cursor: loading
                ? "wait"
                : "pointer",
              textAlign: "left",
            }}
          >
            <LogOut size={20} />

            <span>
              {loading
                ? "Déconnexion..."
                : "Déconnexion"}
            </span>

          </button>
        </li>

      </ul>

      {/* MESSAGE D'ERREUR */}

      {error && (
        <p
          role="alert"
          style={{
            color: "#ffffff",
            padding: "10px",
            fontSize: "13px",
          }}
        >
          {error}
        </p>
      )}

    </div>

  );

}

export default AdminSidebar;
