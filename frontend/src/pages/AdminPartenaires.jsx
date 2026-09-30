import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

import "./Admin.css";

function AdminPartenaires() {

  const [partenaires, setPartenaires] = useState([]);

  useEffect(() => {
    chargerPartenaires();
  }, []);

  // ==========================
  // Charger les partenaires
  // ==========================

  const chargerPartenaires = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:5000/partenaires"
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors du chargement des partenaires"
        );
      }

      const data = await response.json();

      setPartenaires(data);

    } catch (error) {

      console.error("Erreur :", error);

    }
  };


  // ==========================
  // Supprimer un partenaire
  // ==========================

  const supprimerPartenaire = async (id) => {

    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce partenaire ?"
    );

    if (!confirmation) {
      return;
    }

    try {

      const response = await fetch(
        `http://127.0.0.1:5000/partenaires/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la suppression"
        );
      }

      alert("Partenaire supprimé avec succès !");

      chargerPartenaires();

    } catch (error) {

      console.error("Erreur :", error);

      alert(
        "Impossible de supprimer le partenaire."
      );

    }
  };


  return (

    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        <AdminHeader />

        <h1 className="admin-title">
          Gestion des Partenaires
        </h1>


        <Link to="/admin/partenaires/ajouter">

          <button className="btn-add">
            + Ajouter un partenaire
          </button>

        </Link>


        <div className="activity">

          <h2>Liste des partenaires</h2>


          <table className="admin-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Nom</th>

                <th>Description</th>

                <th>Logo</th>

                <th>Site web</th>

                <th>Actions</th>

              </tr>

            </thead>


            <tbody>

              {partenaires.length === 0 ? (

                <tr>

                  <td colSpan="6">
                    Aucun partenaire pour le moment.
                  </td>

                </tr>

              ) : (

                partenaires.map((partenaire) => (

                  <tr key={partenaire.id}>

                    <td>
                      {partenaire.id}
                    </td>


                    <td>
                      {partenaire.nom}
                    </td>


                    <td>
                      {partenaire.description}
                    </td>


                    <td>

                      {partenaire.logo ? (

                        <img
                          src={`http://127.0.0.1:5000/uploads/${partenaire.logo}`}
                          alt={partenaire.nom}
                          style={{
                            width: "80px",
                            height: "60px",
                            objectFit: "contain",
                            borderRadius: "6px"
                          }}
                        />

                      ) : (

                        <span>
                          Aucun logo
                        </span>

                      )}

                    </td>


                    <td>

                      {partenaire.site_web ? (

                        <a
                          href={partenaire.site_web}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visiter
                        </a>

                      ) : (

                        <span>
                          Non disponible
                        </span>

                      )}

                    </td>


                    <td>

                      <Link
                        to={`/admin/partenaires/modifier/${partenaire.id}`}
                      >

                        <button className="btn-edit">
                          Modifier
                        </button>

                      </Link>


                      <button
                        className="btn-delete"
                        onClick={() =>
                          supprimerPartenaire(partenaire.id)
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

    </div>

  );
}

export default AdminPartenaires;