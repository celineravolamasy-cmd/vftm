
import API_URL from "../services/api";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./DetailProjet.css";

// Fonction pour récupérer l'adresse de l'image
function getImageUrl(image) {
  if (!image) return "";

  // Si l'image possède déjà une URL complète (Cloudinary)
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Pour les anciennes images stockées dans uploads
  return `${API_URL}/uploads/${image}`;
}

function DetailProjet() {
  const { id } = useParams();

  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [indexImage, setIndexImage] = useState(0);

  // ==================================
  // CHARGER LES DETAILS DU PROJET
  // ==================================
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");
    setProjet(null);
    setIndexImage(0);

    const chargerProjet = async () => {
      try {
        const response = await fetch(
          `${API_URL}/projets/${id}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Projet introuvable");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setProjet(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Erreur :", err);
          setError(
            "Impossible de charger les informations du projet."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    chargerProjet();

    return () => controller.abort();
  }, [id]);

  // ==================================
  // RECUPERER TOUTES LES IMAGES
  // ==================================
  const images = projet
    ? Array.isArray(projet.images) && projet.images.length > 0
      ? projet.images
      : projet.image
        ? [projet.image]
        : []
    : [];

  // ==================================
  // CAROUSEL AUTOMATIQUE : 10 SECONDES
  // ==================================
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIndexImage((ancienIndex) =>
        (ancienIndex + 1) % images.length
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  // ==================================
  // AFFICHAGE PENDANT LE CHARGEMENT
  // ==================================
  if (loading) {
    return (
      <div className="detail-projet-message">
        Chargement du projet...
      </div>
    );
  }

  // ==================================
  // AFFICHAGE EN CAS D'ERREUR
  // ==================================
  if (error || !projet) {
    return (
      <div className="detail-projet-message error">
        <p>{error || "Projet introuvable."}</p>

        <Link to="/projets" className="retour-projets">
          ← Retour aux projets
        </Link>
      </div>
    );
  }

  // ==================================
  // DATE DU PROJET
  // ==================================
  const dateProjet = projet.date || projet.date_projet;

  // ==================================
  // PAGE DETAILS DU PROJET
  // ==================================
  return (
    <div className="detail-projet-page">

      {/* HEADER */}
      <section className="detail-projet-header">
        <span>VFTM • NOS PROJETS</span>

        <h1>{projet.titre}</h1>

        <p>
          Découvrez les détails de cette initiative du VFTM.
        </p>
      </section>

      {/* CONTENU */}
      <section className="detail-projet-container">

        <Link
          to="/projets"
          className="retour-projets"
        >
          ← Retour aux projets
        </Link>

        {/* CARTE PRINCIPALE */}
        <div className="detail-projet-card">

          {/* ==========================
              IMAGE A GAUCHE
          ========================== */}
          {images.length > 0 && (
            <div className="detail-projet-image">

              <img
                src={getImageUrl(images[indexImage])}
                alt={`${projet.titre} - Photo ${indexImage + 1}`}
                onError={(e) => {
                  console.error("Erreur de chargement de l'image");
                  e.currentTarget.style.display = "none";
                }}
              />

              {images.length > 1 && (
                <span className="detail-photo-count">
                  {indexImage + 1} / {images.length}
                </span>
              )}

            </div>
          )}

          {/* ==========================
              INFORMATIONS A DROITE
          ========================== */}
          <div className="detail-projet-content">

            {/* DATE */}
            <span className="detail-projet-date">
              {dateProjet
                ? new Date(
                    `${String(dateProjet).slice(0, 10)}T00:00:00`
                  ).toLocaleDateString("fr-FR")
                : "Projet VFTM"}
            </span>

            {/* TITRE */}
            <h2>{projet.titre}</h2>

            {/* DESCRIPTION */}
            <h3>Description du projet</h3>

            <p>
              {projet.description ||
                "Aucune description disponible."}
            </p>

            {/* INFORMATIONS GENERALES */}
            <div className="detail-projet-info">

              <div>
                <strong>Organisation</strong>
                <span>VFTM</span>
              </div>

              <div>
                <strong>Secteur</strong>
                <span>Développement agricole</span>
              </div>

              <div>
                <strong>Zone d'intervention</strong>
                <span>
                  {projet.zone_intervention ||
                    "Non renseignée"}
                </span>
              </div>

            </div>

            {/* OBJECTIFS */}
            <div className="detail-inline-section">
              <h3>Objectifs du projet</h3>

              <p>
                {projet.objectifs ||
                  "Aucun objectif renseigné pour ce projet."}
              </p>
            </div>

            {/* BENEFICIAIRES */}
            <div className="detail-inline-section">
              <h3>Bénéficiaires</h3>

              <p>
                {projet.beneficiaires ||
                  "Aucun bénéficiaire renseigné pour ce projet."}
              </p>
            </div>

            {/* PARTENAIRES */}
            <div className="detail-inline-section">
              <h3>Partenaires</h3>

              <p>
                {projet.partenaires ||
                  "Aucun partenaire renseigné pour ce projet."}
              </p>
            </div>

          </div>
        </div>

      </section>
    </div>
  );
}

export default DetailProjet;
