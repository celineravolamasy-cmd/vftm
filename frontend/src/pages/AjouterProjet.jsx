import API_URL from '../services/api';

import { useState } from "react";
import { useNavigate } from "react-router-dom";



function AjouterProjet() {
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [objectifs, setObjectifs] = useState("");
  const [beneficiaires, setBeneficiaires] = useState("");
  const [zoneIntervention, setZoneIntervention] = useState("");
  const [partenaires, setPartenaires] = useState("");
  const [date, setDate] = useState("");

  // Plusieurs images
  const [images, setImages] = useState([]);
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
  // SELECTIONNER PLUSIEURS IMAGES
  // ==================================

  const handleImagesChange = (e) => {
    const fichiers = Array.from(e.target.files || []);
    setImages(fichiers);
  };

  // ==================================
  // AJOUTER UN PROJET AVEC CSRF
  // ==================================

  const handleSubmit = async (e) => {
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

      // Envoyer toutes les images sélectionnées
      images.forEach((image) => {
        formData.append("images", image);
      });

      // ==============================
      // 3. ENVOYER AVEC SESSION + CSRF
      // ==============================

      const response = await fetch(
        `${API_URL}/projets`,
        {
          method: "POST",

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
          "Erreur lors de l'ajout du projet"
        );
      }

      // ==============================
      // 6. CONFIRMATION
      // ==============================

      alert("Projet ajouté avec succès !");

      navigate("/admin/projets");

    } catch (error) {
      console.error("Erreur ajout projet :", error);

      alert(
        error.message ||
        "Erreur lors de l'ajout du projet."
      );

    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div className="add-page">

      <h1>Ajouter un Projet</h1>

      <form
        className="add-form"
        onSubmit={handleSubmit}
      >

        {/* TITRE */}
        <label>Titre</label>

        <input
          type="text"
          placeholder="Entrer le titre du projet"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        {/* DESCRIPTION */}
        <label>Description</label>

        <textarea
          rows="6"
          placeholder="Entrer la description du projet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* OBJECTIFS */}
        <label>Objectifs du projet</label>

        <textarea
          rows="5"
          placeholder="Entrer les objectifs du projet"
          value={objectifs}
          onChange={(e) => setObjectifs(e.target.value)}
          required
        />

        {/* BENEFICIAIRES */}
        <label>Bénéficiaires</label>

        <textarea
          rows="5"
          placeholder="Entrer les bénéficiaires du projet"
          value={beneficiaires}
          onChange={(e) => setBeneficiaires(e.target.value)}
          required
        />

        {/* ZONE */}
        <label>Zone d'intervention</label>

        <input
          type="text"
          placeholder="Exemple : Haute Matsiatra"
          value={zoneIntervention}
          onChange={(e) => setZoneIntervention(e.target.value)}
          required
        />

        {/* PARTENAIRES */}
        <label>Partenaires du projet</label>

        <input
          type="text"
          placeholder="Entrer les partenaires du projet"
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

        {/* IMAGES */}
        <label>Images du projet</label>

        <input
          type="file"
          accept=".jpg,.jpeg,.jfif,.png,.webp,.gif,image/jpeg"
          multiple
          onChange={handleImagesChange}
        />

        {images.length > 0 && (
          <div
            style={{
              marginTop: "10px",
              marginBottom: "15px",
            }}
          >
            <p>
              {images.length} image(s) sélectionnée(s)
            </p>

            <ul>
              {images.map((image, index) => (
                <li key={`${image.name}-${index}`}>
                  {image.name}
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
              ? "Enregistrement..."
              : "Enregistrer"}
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

export default AjouterProjet;
