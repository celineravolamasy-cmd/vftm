import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Projets.css";

function Projets() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/projets")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des projets");
        }
        return response.json();
      })
      .then((data) => {
        setProjets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les projets.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="projets-page">

      {/* HEADER */}
      <section className="projets-header">
        <span>VFTM</span>
        <h1>Nos Projets</h1>
        <p>
          Découvrez les projets et initiatives mis en œuvre par le VFTM
          pour accompagner les producteurs et contribuer au développement
          agricole de la Haute Matsiatra.
        </p>
      </section>

      {/* CONTENU */}
      <section className="projets-container">

        <div className="projets-intro">
          <h2>Nos initiatives</h2>
          <p>
            À travers ses différents projets, le VFTM accompagne les
            organisations paysannes, développe les filières agricoles et
            favorise l'amélioration durable des revenus des exploitations
            agricoles familiales.
          </p>
        </div>

        {loading && (
          <div className="projets-message">
            Chargement des projets...
          </div>
        )}

        {error && (
          <div className="projets-message error">
            {error}
          </div>
        )}

        {!loading && !error && projets.length === 0 && (
          <div className="projets-message">
            Aucun projet disponible pour le moment.
          </div>
        )}

        {!loading && !error && projets.length > 0 && (
          <div className="projets-grid">

            {projets.map((projet) => (
              <article className="projet-card" key={projet.id}>

                {projet.image ? (
                  <div className="projet-image-container">
                    <img
                      src={`http://127.0.0.1:5000/uploads/${projet.image}`}
                      alt={projet.titre}
                      className="projet-image"
                    />
                  </div>
                ) : (
                  <div className="projet-no-image">
                    🌱
                  </div>
                )}

                <div className="projet-content">

                  <span className="projet-date">
                    {projet.date
                      ? new Date(projet.date).toLocaleDateString("fr-FR")
                      : "Projet VFTM"}
                  </span>

                  <h3>{projet.titre}</h3>

                  <p>
                    {projet.description}
                  </p>

                  <div className="projet-footer">
  <span>VFTM</span>

  <Link
    to={`/projets/${projet.id}`}
    className="projet-details-link"
  >
    En savoir plus →
  </Link>
</div>

                </div>
              </article>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default Projets;