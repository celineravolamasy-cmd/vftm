import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./DetailProjet.css";

function DetailProjet() {
  const { id } = useParams();

  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`https://vftm.onrender.com/projets/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Projet introuvable");
        }

        return response.json();
      })
      .then((data) => {
        setProjet(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(
          "Impossible de charger les informations du projet."
        );
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="detail-projet-message">
        Chargement du projet...
      </div>
    );
  }

  if (error || !projet) {
    return (
      <div className="detail-projet-message error">
        {error || "Projet introuvable."}
      </div>
    );
  }

  return (
    <div className="detail-projet-page">

      {/* ==========================
          HEADER
      ========================== */}
      <section className="detail-projet-header">

        <span>
          VFTM • NOS PROJETS
        </span>

        <h1>
          {projet.titre}
        </h1>

        <p>
          Découvrez les détails de cette initiative du VFTM.
        </p>

      </section>


      {/* ==========================
          CONTENU
      ========================== */}
      <section className="detail-projet-container">

        <Link
          to="/projets"
          className="retour-projets"
        >
          ← Retour aux projets
        </Link>


        {/* ==========================
            INFORMATIONS PRINCIPALES
        ========================== */}
        <div className="detail-projet-card">

          {/* IMAGE */}
          {projet.image && (
            <div className="detail-projet-image">

              <img
                src={`https://vftm.onrender.com/uploads/${projet.image}`}
                alt={projet.titre}
              />

            </div>
          )}


          {/* INFORMATIONS */}
          <div className="detail-projet-content">

            <span className="detail-projet-date">
              {projet.date
                ? new Date(
                    projet.date
                  ).toLocaleDateString("fr-FR")
                : "Projet VFTM"}
            </span>

            <h2>
              {projet.titre}
            </h2>


            {/* DESCRIPTION */}
            <h3>
              Description du projet
            </h3>

            <p>
              {projet.description ||
                "Aucune description disponible."}
            </p>


            {/* INFORMATIONS GENERALES */}
            <div className="detail-projet-info">

              <div>
                <strong>
                  Organisation
                </strong>

                <span>
                  VFTM
                </span>
              </div>


              <div>
                <strong>
                  Secteur
                </strong>

                <span>
                  Développement agricole
                </span>
              </div>


              <div>
                <strong>
                  Zone d'intervention
                </strong>

                <span>
                  {projet.zone_intervention ||
                    "Non renseignée"}
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* ==========================
            OBJECTIFS
        ========================== */}
        <div className="detail-section">

          <h2>
            🎯 Objectifs du projet
          </h2>

          <p>
            {projet.objectifs ||
              "Aucun objectif renseigné pour ce projet."}
          </p>

        </div>


        {/* ==========================
            BENEFICIAIRES
        ========================== */}
        <div className="detail-section">

          <h2>
            👥 Bénéficiaires
          </h2>

          <p>
            {projet.beneficiaires ||
              "Aucun bénéficiaire renseigné pour ce projet."}
          </p>

        </div>


        {/* ==========================
            PARTENAIRES
        ========================== */}
        <div className="detail-section">

          <h2>
            🤝 Partenaires
          </h2>

          <p>
            {projet.partenaires ||
              "Aucun partenaire renseigné pour ce projet."}
          </p>

        </div>

      </section>

    </div>
  );
}

export default DetailProjet;
