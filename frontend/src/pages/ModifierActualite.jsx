import API_URL from '../services/api';

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AjouterActualite.css";



function ModifierActualite() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [anciennesImages, setAnciennesImages] = useState([]);
  const [imagesConservees, setImagesConservees] = useState([]);
  const [nouvellesImages, setNouvellesImages] = useState([]);

  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  // ==================================
  // Gestion de la session expirée
  // ==================================

  const redirigerVersLogin = () => {
    localStorage.removeItem("user");

    alert(
      "Votre session a expiré. Veuillez vous reconnecter."
    );

    navigate("/login", { replace: true });
  };

  // ==================================
  // Charger l'actualité
  // ==================================

  useEffect(() => {
    let actif = true;

    const chargerActualite = async () => {
      try {
        const response = await fetch(
          `${API_URL}/actualites/${id}`
        );

        if (!response.ok) {
          throw new Error("Actualité introuvable");
        }

        const data = await response.json();

        if (!actif) return;

        setTitre(data.titre || "");
        setDescription(data.description || "");
        setDate(data.date || "");

        const images = (
          Array.isArray(data.images) && data.images.length
            ? data.images
            : data.image
              ? [data.image]
              : []
        );

        setAnciennesImages(images);
        setImagesConservees(images);

      } catch (error) {
        console.error("Erreur chargement :", error);

        if (actif) {
          alert("Impossible de charger cette actualité.");
        }

      } finally {
        if (actif) {
          setChargement(false);
        }
      }
    };

    chargerActualite();

    return () => {
      actif = false;
    };
  }, [id]);

  // ==================================
  // Sélection des anciennes images
  // ==================================

  const changerSelection = (nomImage) => {
    setImagesConservees((precedentes) =>
      precedentes.includes(nomImage)
        ? precedentes.filter((nom) => nom !== nomImage)
        : [...precedentes, nomImage]
    );
  };

  // ==================================
  // Modifier une actualité avec CSRF
  // ==================================

  const modifierActualite = async (e) => {
    e.preventDefault();

    if (enregistrement) return;

    setEnregistrement(true);

    try {

      // ==============================
      // 1. VERIFIER LA SESSION
      // ET RECUPERER LE TOKEN CSRF
      // ==============================

      const checkResponse = await fetch(
        `${API_URL}/auth/check`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (checkResponse.status === 401) {
        redirigerVersLogin();
        return;
      }

      if (!checkResponse.ok) {
        throw new Error(
          "Impossible de vérifier la session."
        );
      }

      const checkData = await checkResponse.json();

      const csrfToken = checkData.csrf_token;

      if (!csrfToken) {
        throw new Error(
          "Token CSRF introuvable."
        );
      }

      // ==============================
      // 2. PREPARER LES DONNEES
      // ==============================

      const formData = new FormData();

      formData.append("titre", titre);
      formData.append("description", description);
      formData.append("date", date);

      // Activer la gestion des images
      formData.append("gestion_images", "1");

      // Images anciennes à conserver
      imagesConservees.forEach((nom) => {
        formData.append("images_a_conserver", nom);
      });

      // Nouvelles images à ajouter
      nouvellesImages.forEach((fichier) => {
        formData.append("images", fichier);
      });

      // ==============================
      // 3. MODIFICATION AVEC CSRF
      // ==============================

      const response = await fetch(
        `${API_URL}/actualites/${id}`,
        {
          method: "PUT",

          credentials: "include",

          headers: {
            "X-CSRF-Token": csrfToken,
          },

          body: formData,
        }
      );

      // ==============================
      // 4. SESSION EXPIREE
      // ==============================

      if (response.status === 401) {
        redirigerVersLogin();
        return;
      }

      // ==============================
      // 5. GESTION DES ERREURS
      // ==============================

      if (!response.ok) {
        const resultat = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          resultat.message || "Erreur de modification"
        );
      }

      // ==============================
      // 6. CONFIRMATION
      // ==============================

      alert("Actualité modifiée avec succès !");

      navigate("/admin/actualites");

    } catch (error) {
      console.error("Erreur modification :", error);

      alert(
        error.message ||
        "Erreur lors de la modification."
      );

    } finally {
      setEnregistrement(false);
    }
  };

  // ==================================
  // Affichage du chargement
  // ==================================

  if (chargement) {
    return (
      <div className="add-page">
        <p>Chargement de l'actualité...</p>
      </div>
    );
  }

  return (
    <div className="add-page">

      <h1>Modifier une Actualité</h1>

      <form
        className="add-form"
        onSubmit={modifierActualite}
      >

        <label>Titre</label>

        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        <label>Description</label>

        <textarea
          rows="6"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Date</label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label>Images actuelles</label>

        <p>
          Décochez les images que vous ne souhaitez
          plus afficher.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          {anciennesImages.map((nom, index) => (
            <div
              key={nom}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                width: "160px",
              }}
            >
              <img
                src={`${API_URL}/uploads/${nom}`}
                alt={`Image ${index + 1}`}
                style={{
                  width: "160px",
                  height: "110px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                }}
              >
                <input
                  type="checkbox"
                  checked={imagesConservees.includes(nom)}
                  onChange={() => changerSelection(nom)}
                />

                Conserver
              </label>
            </div>
          ))}
        </div>

        <label>Ajouter de nouvelles images</label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) =>
            setNouvellesImages(
              Array.from(e.target.files || [])
            )
          }
        />

        {nouvellesImages.length > 0 && (
          <p>
            {nouvellesImages.length} nouvelle(s)
            image(s) sélectionnée(s).
          </p>
        )}

        <div className="buttons">

          <button
            type="submit"
            className="btn-save"
            disabled={enregistrement}
          >
            {enregistrement
              ? "Modification..."
              : "Modifier"}
          </button>

          <button
            type="button"
            className="btn-cancel"
            disabled={enregistrement}
            onClick={() =>
              navigate("/admin/actualites")
            }
          >
            Annuler
          </button>

        </div>

      </form>

    </div>
  );
}

export default ModifierActualite;
