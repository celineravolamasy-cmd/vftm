
import API_URL from "../services/api";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Projets.css";

// ==================================
// FONCTION URL IMAGE
// ==================================

function getImageUrl(image) {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${API_URL}/uploads/${image}`;
}

// ==================================
// CAROUSEL DES IMAGES
// ==================================

function ProjetCard({ projet }) {
  const [indexImage, setIndexImage] = useState(0);
  const [imageErreur, setImageErreur] = useState(false);
  const navigate = useNavigate();

  const images =
    Array.isArray(projet.images) && projet.images.length > 0
      ? projet.images
      : projet.image
        ? [projet.image]
        : [];

  useEffect(() => {
    setIndexImage(0);
    setImageErreur(false);

    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIndexImage((index) =>
        (index + 1) % images.length
      );

      setImageErreur(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [projet.id, images.length]);

  const dateProjet = projet.date || projet.date_projet;

  const handleContact = () => {
    navigate("/contact", {
      state: {
        sujet: `Demande concernant le projet : ${projet.titre}`
      }
    });
  };

  return (
    <article className="projet-card">

      {images.length > 0 && !imageErreur ? (
        <div className="projet-image-container">

          <img
            src={getImageUrl(images[indexImage])}
            alt={`${projet.titre} - Photo ${indexImage + 1}`}
            className="projet-image"
            onError={() => setImageErreur(true)}
          />

          {images.length > 1 && (
            <span className="projet-photo-count">
              {indexImage + 1} / {images.length}
            </span>
          )}

        </div>
      ) : (
        <div className="projet-no-image">
          🌱
        </div>
      )}

      <div className="projet-content">

        <span className="projet-date">
          {dateProjet
            ? new Date(dateProjet).toLocaleDateString("fr-FR")
            : "Projet VFTM"}
        </span>

        <h3>{projet.titre}</h3>

        <p>{projet.description}</p>

        <div className="projet-footer">

          <span>VFTM</span>

          <div className="projet-actions">
            <Link
              to={`/projets/${projet.id}`}
              className="projet-details-link"
            >
              En savoir plus →
            </Link>

            <button
              type="button"
              className="projet-contact-button"
              onClick={handleContact}
            >
              Contacter
            </button>
          </div>

        </div>

      </div>

    </article>
  );
}

// ==================================
// PAGE PUBLIC PROJETS
// ==================================

function Projets() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let actif = true;

    const chargerProjets = async () => {
      try {
        const response = await fetch(`${API_URL}/projets`);

        if (!response.ok) {
          throw new Error(
            "Erreur lors du chargement des projets"
          );
        }

        const data = await response.json();

        if (actif) {
          setProjets(Array.isArray(data) ? data : []);
        }

      } catch (err) {
        console.error("Erreur chargement projets :", err);

        if (actif) {
          setError("Impossible de charger les projets.");
        }

      } finally {
        if (actif) {
          setLoading(false);
        }
      }
    };

    chargerProjets();

    return () => {
      actif = false;
    };
  }, []);

  return (
    <div className="projets-page">

      <section className="projets-header">

        <span>VFTM</span>

        <h1>Nos Projets</h1>

        <p>
          Découvrez les projets et initiatives mis en œuvre par le VFTM
          pour accompagner les producteurs et contribuer au développement
          agricole de la Haute Matsiatra.
        </p>

      </section>

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
              <ProjetCard
                key={projet.id}
                projet={projet}
              />
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default Projets;
