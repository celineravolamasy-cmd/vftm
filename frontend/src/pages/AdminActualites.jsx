import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

import "./Admin.css";

function AdminActualites() {
  const [actualites, setActualites] = useState([]);

  useEffect(() => {
    chargerActualites();
  }, []);

  // ==========================
  // Charger les actualités
  // ==========================

  const chargerActualites = async () => {
    try {
      const response = await fetch(
        "https://vftm.onrender.com/actualites"
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement");
      }

      const data = await response.json();

      setActualites(data);
    } catch (error) {
      console.error("Erreur :", error);
    }
  };


  // ==========================
  // Supprimer une actualité
  // ==========================

  const supprimerActualite = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette actualité ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      const response = await fetch(
        `https://vftm.onrender.com/actualites/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      alert("Actualité supprimée avec succès !");

      // Recharger la liste
      chargerActualites();

    } catch (error) {
      console.error("Erreur :", error);

      alert(
        "Impossible de supprimer cette actualité."
      );
    }
  };


  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        <AdminHeader />

        <h1 className="admin-title">
          Gestion des Actualités
        </h1>


        {/* ==========================
            Bouton Ajouter
        ========================== */}

        <Link to="/admin/actualites/ajouter">
          <button className="btn-add">
            + Ajouter une actualité
          </button>
        </Link>


        {/* ==========================
            Tableau
        ========================== */}

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

            {actualites.length === 0 ? (

              <tr>
                <td colSpan="6">
                  Aucune actualité disponible.
                </td>
              </tr>

            ) : (

              actualites.map((actu) => (

                <tr key={actu.id}>

                  {/* ID */}

                  <td>
                    {actu.id}
                  </td>


                  {/* Titre */}

                  <td>
                    {actu.titre}
                  </td>


                  {/* Description */}

                  <td>
                    {actu.description}
                  </td>


                  {/* Date */}

                  <td>
                    {actu.date}
                  </td>


                  {/* ==========================
                      IMAGE
                  ========================== */}

                  <td>

                    {actu.image ? (

                      <img
                        src={`https://vftm.onrender.com/uploads/${actu.image}`}
                        alt={actu.titre}
                        style={{
                          width: "100px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "8px"
                        }}
                      />

                    ) : (

                      <span>
                        Aucune image
                      </span>

                    )}

                  </td>


                  {/* ==========================
                      ACTIONS
                  ========================== */}

                  <td>

                    <Link
                      to={`/admin/actualites/modifier/${actu.id}`}
                    >
                      <button className="btn-edit">
                        Modifier
                      </button>
                    </Link>


                    <button
                      className="btn-delete"
                      onClick={() =>
                        supprimerActualite(actu.id)
                      }
                    >
                      Supprimer
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminActualites;
