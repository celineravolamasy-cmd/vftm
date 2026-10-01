import { useEffect, useState } from "react";
import "./Admin.css";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

function Admin() {

  const [stats, setStats] = useState({
    actualites: 0,
    projets: 0,
    partenaires: 0,
    messages: 0
  });

  const [activites, setActivites] = useState([]);

  useEffect(() => {
    chargerDashboard();
  }, []);

  const chargerDashboard = async () => {
    try {
      const response = await fetch(
        "https://vftm.onrender.com/dashboard/stats"
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du Dashboard");
      }

      const data = await response.json();

      setStats({
        actualites: data.actualites,
        projets: data.projets,
        partenaires: data.partenaires,
        messages: data.messages
      });

      setActivites(data.activites || []);

    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        <AdminHeader />

        <h1 className="admin-title">
          Tableau de Bord
        </h1>

        {/* ==========================
            STATISTIQUES
        ========================== */}

        <div className="stats">

          <div className="stat-card">
            <h3>📰 Actualités</h3>
            <h2>{stats.actualites}</h2>
          </div>

          <div className="stat-card">
            <h3>📁 Projets</h3>
            <h2>{stats.projets}</h2>
          </div>

          <div className="stat-card">
            <h3>🤝 Partenaires</h3>
            <h2>{stats.partenaires}</h2>
          </div>

          <div className="stat-card">
            <h3>📨 Messages</h3>
            <h2>{stats.messages}</h2>
          </div>

        </div>


        {/* ==========================
            DERNIÈRES ACTIVITÉS
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

              {activites.length === 0 ? (

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
