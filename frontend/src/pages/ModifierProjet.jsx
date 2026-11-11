import API_URL from '../services/api';

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./AjouterActualite.css";



function ModifierProjet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [objectifs, setObjectifs] = useState("");
  const [beneficiaires, setBeneficiaires] = useState("");
  const [zoneIntervention, setZoneIntervention] = useState("");
  const [partenaires, setPartenaires] = useState("");
  const [date, setDate] = useState("");

  const [anciennesImages, setAnciennesImages] = useState([]);
  const [imagesConservees, setImagesConservees] = useState([]);
  const [nouvellesImages, setNouvellesImages] = useState([]);

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  // ==================================
  // GESTION DE LA SESSION EXPIREE
  // ==================================

  const redirigerVersLogin = () => {
    localStorage.removeItem("user");

    alert(
      "Votre session a expiré. Veuillez vous reconnecter."
    );

    navigate("/login", { replace: true });
  };

  // ==================================
  // CHARGER LES INFORMATIONS DU PROJET
  // ==================================

  useEffect(() => {
    let actif = true;

    const chargerProjet = async () => {
      setChargement(true);
      setErreur("");

      try {
        const response = await fetch(
          `${API_URL}/projets/${id}`
        );

        if (!response.ok) {
          throw new Error(
            "Impossible de charger le projet."
          );
        }

        const data = await response.json();

        if (!actif) return;

        setTitre(data.titre || "");
        setDescription(data.description || "");
        setObjectifs(data.objectifs || "");
        setBeneficiaires(data.beneficiaires || "");
        setZoneIntervention(data.zone_intervention || "");
        setPartenaires(data.partenaires || "");
        setDate(data.date || "");

        const images =
          Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : data.image
              ? [data.image]
              : [];

        setAnciennesImages(images);
        setImagesConservees(images);

      } catch (error) {
        console.error("Erreur :", error);

        if (actif) {
          setErreur(error.message);
        }

      } finally {
        if (actif) {
          setChargement(false);
        }
      }
    };

    chargerProjet();

    return () => {
      actif = false;
    };
  }, [id]);

  // ==================================
  // COCHER OU DECOCHER UNE IMAGE
  // ==================================

  const changerSelection = (nomImage) => {
    setImagesConservees((precedentes) =>
      precedentes.includes(nomImage)
        ? precedentes.filter((nom) => nom !== nomImage)
        : [...precedentes, nomImage]
    );
  };

  // ==================================
  // SELECTIONNER LES NOUVELLES IMAGES
  // ==================================

  const handleImagesChange = (e) => {
    const fichiers = Array.from(e.target.files || []);
    setNouvellesImages(fichiers);
  };

  // ==================================
  // MODIFIER LE PROJET AVEC CSRF
  // ==================================

  const modifierProjet = async (e) => {
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
      formData.append("objectifs", objectifs);
      formData.append("beneficiaires", beneficiaires);
      formData.append("zone_intervention", zoneIntervention);
      formData.append("partenaires", partenaires);
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
        `${API_URL}/projets/${id}`,
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
          resultat.message ||
          "Erreur lors de la modification."
        );
      }

      // ==============================
      // 6. CONFIRMATION
      // ==============================

      alert("Projet modifié avec succès !");

      navigate("/admin/projets");

    } catch (error) {
      console.error(
        "Erreur modification projet :",
        error
      );

      alert(
        error.message ||
        "Erreur lors de la modification."
      );

    } finally {
      setEnregistrement(false);
    }
  };

  // ==================================
  // CHARGEMENT
  // ==================================

  if (chargement) {
    return (
      <div className="add-page">
        <p>Chargement du projet...</p>
      </div>
    );
  }

  // ==================================
  // AFFICHAGE DES ERREURS
  // ==================================

  if (erreur) {
    return (
      <div className="add-page">
        <p style={{ color: "red" }}>{erreur}</p>

        <button
          type="button"
          className="btn-cancel"
          onClick={() => navigate("/admin/projets")}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="add-page">

      <h1>Modifier un Projet</h1>

      <form
        className="add-form"
        onSubmit={modifierProjet}
      >

        {/* TITRE */}
        <label>Titre</label>

        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        {/* DESCRIPTION */}
        <label>Description</label>

        <textarea
          rows="6"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* OBJECTIFS */}
        <label>Objectifs du projet</label>

        <textarea
          rows="5"
          value={objectifs}
          onChange={(e) => setObjectifs(e.target.value)}
          required
        />

        {/* BENEFICIAIRES */}
        <label>Bénéficiaires</label>

        <textarea
          rows="5"
          value={beneficiaires}
          onChange={(e) => setBeneficiaires(e.target.value)}
          required
        />

        {/* ZONE */}
        <label>Zone d'intervention</label>

        <input
          type="text"
          value={zoneIntervention}
          onChange={(e) => setZoneIntervention(e.target.value)}
          required
        />

        {/* PARTENAIRES */}
        <label>Partenaires du projet</label>

        <input
          type="text"
          value={partenaires}
          onChange={(e) => setPartenaires(e.target.value)}
        />

        {/* DATE */}
        <label>Date</label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* IMAGES ACTUELLES */}
        <label>Images actuelles</label>

        <p>
          Décochez les images que vous ne souhaitez
          plus afficher.
        </p>

        {anciennesImages.length === 0 && (
          <p>Aucune image actuelle.</p>
        )}

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
              key={`${nom}-${index}`}
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

        {/* NOUVELLES IMAGES */}
        <label>Ajouter de nouvelles images</label>

        <input
          type="file"
          accept=".jpg,.jpeg,.jfif,.png,.webp,.gif,image/jpeg"
          multiple
          onChange={handleImagesChange}
        />

        {nouvellesImages.length > 0 && (
          <div
            style={{
              marginTop: "10px",
              marginBottom: "15px",
            }}
          >
            <p>
              {nouvellesImages.length} nouvelle(s)
              image(s) sélectionnée(s)
            </p>

            <ul>
              {nouvellesImages.map((fichier, index) => (
                <li key={`${fichier.name}-${index}`}>
                  {fichier.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* BOUTONS */}
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
            onClick={() => navigate("/admin/projets")}
          >
            Annuler
          </button>

        </div>

      </form>

    </div>
  );
}

export default ModifierProjet;
