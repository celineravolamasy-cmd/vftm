import API_URL from '../services/api';

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Admin.css";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";



function Admin() {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    actualites: 0,
    projets: 0,
    partenaires: 0,
    messages: 0
  });

  const [activites, setActivites] = useState([]);

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // ==========================
  // CHARGER LE DASHBOARD
  // ==========================

  useEffect(() => {

    let actif = true;

    const chargerDashboard = async () => {

      setChargement(true);
      setErreur("");

      try {

        const response = await fetch(
          `${API_URL}/dashboard/stats`,
          {
            method: "GET",

            // Envoyer le cookie de session Flask
            credentials: "include"
          }
        );

        if (!actif) return;

        // ==========================
        // SESSION EXPIREE
        // ==========================

        if (response.status === 401) {

          localStorage.removeItem("user");

          alert(
            "Votre session a expiré. Veuillez vous reconnecter."
          );

          navigate("/login", { replace: true });

          return;
        }

        if (!response.ok) {

          throw new Error(
            "Erreur lors du chargement du Dashboard"
          );

        }

        const data = await response.json();

        if (!actif) return;

        // ==========================
        // STATISTIQUES
        // ==========================

        setStats({
          actualites: data.actualites ?? 0,
          projets: data.projets ?? 0,
          partenaires: data.partenaires ?? 0,
          messages: data.messages ?? 0
        });

        // ==========================
        // DERNIERES ACTIVITES
        // ==========================

        setActivites(data.activites || []);

      } catch (error) {

        console.error("Erreur :", error);

        if (actif) {

          setErreur(
            "Impossible de charger les statistiques du Dashboard."
          );

        }

      } finally {

        if (actif) {
          setChargement(false);
        }

      }

    };

    chargerDashboard();

    return () => {
      actif = false;
    };

  }, [navigate]);


  return (

    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        <AdminHeader />

        <h1 className="admin-title">
          Tableau de Bord
        </h1>

        {/* ==========================
            MESSAGE D'ERREUR
        ========================== */}

        {erreur && (
          <p
            role="alert"
            style={{
              color: "#dc2626",
              marginBottom: "20px"
            }}
          >
            {erreur}
          </p>
        )}

        {/* ==========================
            STATISTIQUES
        ========================== */}

        <div className="stats">

          <div className="stat-card">
            <h3>📰 Actualités</h3>
            <h2>
              {chargement ? "..." : stats.actualites}
            </h2>
          </div>

          <div className="stat-card">
            <h3>📁 Projets</h3>
            <h2>
              {chargement ? "..." : stats.projets}
            </h2>
          </div>

          <div className="stat-card">
            <h3>🤝 Partenaires</h3>
            <h2>
              {chargement ? "..." : stats.partenaires}
            </h2>
          </div>

          <div className="stat-card">
            <h3>📨 Messages</h3>
            <h2>
              {chargement ? "..." : stats.messages}
            </h2>
          </div>

        </div>


        {/* ==========================
            DERNIERES ACTIVITES
        ========================== */}

        <div className="activity">

          <h2>Dernières activités</h2>

          <table>

            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Élément</th>
              </tr>
            </thead>

            <tbody>

              {chargement ? (

                <tr>
                  <td colSpan="3">
                    Chargement des activités...
                  </td>
                </tr>

              ) : erreur ? (

                <tr>
                  <td colSpan="3">
                    Impossible de charger les activités.
                  </td>
                </tr>

              ) : activites.length === 0 ? (

                <tr>
                  <td colSpan="3">
                    Aucune activité pour le moment.
                  </td>
                </tr>

              ) : (

                activites.map((activite, index) => (

                  <tr key={index}>

                    <td>
                      {activite.date}
                    </td>

                    <td>
                      {activite.action}
                    </td>

                    <td>
                      {activite.element}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}

export default Admin;
