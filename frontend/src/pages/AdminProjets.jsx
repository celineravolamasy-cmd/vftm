import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

import "./Admin.css";

function AdminProjets() {
  const [projets, setProjets] = useState([]);

  useEffect(() => {
    chargerProjets();
  }, []);

  const chargerProjets = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/projets"
      );

      const data = await response.json();

      setProjets(data);
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  const supprimerProjet = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce projet ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/projets/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      alert("Projet supprimé avec succès !");

      chargerProjets();
    } catch (error) {
      console.error("Erreur :", error);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        <AdminHeader />

        <h1 className="admin-title">
          Gestion des Projets
        </h1>

        <Link to="/admin/projets/ajouter">
          <button className="btn-add">
            + Ajouter un projet
          </button>
        </Link>

        <table className="admin-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Description</th>
              <th>Date</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {projets.map((projet) => (
              <tr key={projet.id}>

                <td>{projet.id}</td>

                <td>{projet.titre}</td>

                <td>{projet.description}</td>

                <td>{projet.date}</td>

                <td>
                  {projet.image && (
                    <img
                      src={`http://127.0.0.1:5000/uploads/${projet.image}`}
                      alt={projet.titre}
                      style={{
                        width: "100px",
                        height: "70px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  )}
                </td>

                <td>

                  <Link
                    to={`/admin/projets/modifier/${projet.id}`}
                  >
                    <button className="btn-edit">
                      Modifier
                    </button>
                  </Link>

                  <button
                    className="btn-delete"
                    onClick={() =>
                      supprimerProjet(projet.id)
                    }
                  >
                    Supprimer
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminProjets;