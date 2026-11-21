
import API_URL from '../services/api';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function getImageUrl(image) {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_URL}/uploads/${image}`;
}

function ActualiteCard({ actualite }) {
  const [indexImage, setIndexImage] = useState(0);
  const navigate = useNavigate();

  const images =
    actualite.images?.length > 0
      ? actualite.images
      : actualite.image
        ? [actualite.image]
        : [];

  useEffect(() => {
    setIndexImage(0);

    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIndexImage((index) => (index + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [actualite.id, images.length]);

  const handleContact = () => {
    navigate("/contact", {
      state: {
        sujet: `Demande concernant l'actualité : ${actualite.titre}`
      }
    });
  };

  return (
    <div className="actualite-card">
      {images.length > 0 && (
        <img
          src={getImageUrl(images[indexImage])}
          alt={`${actualite.titre} - Photo ${indexImage + 1}`}
          className="actualite-image"
        />
      )}

      <div className="actualite-content">
        <h2>{actualite.titre}</h2>

        <p>{actualite.description}</p>

        <small>Date : {actualite.date}</small>

        {images.length > 1 && (
          <small style={{ display: "block", marginTop: "8px" }}>
            Photo {indexImage + 1} / {images.length}
          </small>
        )}

        <button
          type="button"
          onClick={handleContact}
          className="actualite-contact-button"
        >
          Contacter l'association
        </button>
      </div>
    </div>
  );
}

function Actualites() {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/actualites`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des actualités"
          );
        }

        return response.json();
      })
      .then((data) => {
        setActualites(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Impossible de charger les actualités.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1>Nos Actualités</h1>

      <p>Retrouvez toutes les actualités du VFTM.</p>

      {loading && <p>Chargement des actualités...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && actualites.length === 0 && (
        <p>Aucune actualité disponible pour le moment.</p>
      )}

      {!loading && !error && (
        <div className="actualites-list">
          {actualites.map((actualite) => (
            <ActualiteCard
              key={actualite.id}
              actualite={actualite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Actualites;
