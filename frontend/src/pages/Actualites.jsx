import { useEffect, useState } from "react";

function Actualites() {
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://vftm.onrender.com/actualites")
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

      <p>
        Retrouvez toutes les actualités du VFTM.
      </p>

      {loading && (
        <p>Chargement des actualités...</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      {!loading &&
        !error &&
        actualites.length === 0 && (
          <p>
            Aucune actualité disponible pour le moment.
          </p>
        )}

      <div className="actualites-list">

        {actualites.map((actualite) => (

          <div
            className="actualite-card"
            key={actualite.id}
          >

            {/* IMAGE */}
            {actualite.image && (
              <img
                src={`https://vftm.onrender.com/uploads/${actualite.image}`}
                alt={actualite.titre}
                className="actualite-image"
              />
            )}

            <div className="actualite-content">

              <h2>
                {actualite.titre}
              </h2>

              <p>
                {actualite.description}
              </p>

              <small>
                Date : {actualite.date}
              </small>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Actualites;
