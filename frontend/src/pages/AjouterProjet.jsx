
import API_URL from "../services/api";

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

    const formatsAutorises = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const fichiersInvalides = fichiers.filter(
      (fichier) => !formatsAutorises.includes(fichier.type)
    );

    if (fichiersInvalides.length > 0) {
      alert(
        "Format non autorisé. Utilisez JPG, JPEG, PNG, WEBP ou GIF."
      );

      e.target.value = "";
      setImages([]);
      return;
    }

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
      // 1. Vérifier la session et récupérer le token CSRF

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
        throw new Error("Token CSRF introuvable.");
      }

      // 2. Préparer les données

      const formData = new FormData();

      formData.append("titre", titre.trim());
      formData.append("description", description.trim());
      formData.append("objectifs", objectifs.trim());
      formData.append("beneficiaires", beneficiaires.trim());
      formData.append("zone_intervention", zoneIntervention.trim());
      formData.append("partenaires", partenaires.trim());
      formData.append("date", date);

      // Ajouter toutes les images sélectionnées

      images.forEach((image) => {
        formData.append("images", image);
      });

      // 3. Envoyer les données au backend

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

      // 4. Vérifier la session

      if (response.status === 401) {
        redirigerVersLogin();
        return;
      }

      // 5. Gérer les erreurs

      if (!response.ok) {
        const resultat = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          resultat.message ||
          "Erreur lors de l'ajout du projet."
        );
      }

      // 6. Confirmation

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

  // ==================================
  // AFFICHAGE
  // ==================================

  return (
    <div className="add-page">

      <h1>Ajouter un Projet</h1>

      <form
        className="add-form"
        onSubmit={handleSubmit}
      >

        <label>Titre</label>
        <input
          type="text"
          placeholder="Entrer le titre du projet"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        <label>Description</label>
        <textarea
          rows="6"
          placeholder="Entrer la description du projet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Objectifs du projet</label>
        <textarea
          rows="5"
          placeholder="Entrer les objectifs du projet"
          value={objectifs}
          onChange={(e) => setObjectifs(e.target.value)}
          required
        />

        <label>Bénéficiaires</label>
        <textarea
          rows="5"
          placeholder="Entrer les bénéficiaires du projet"
          value={beneficiaires}
          onChange={(e) => setBeneficiaires(e.target.value)}
          required
        />

        <label>Zone d'intervention</label>
        <input
          type="text"
          placeholder="Exemple : Haute Matsiatra"
          value={zoneIntervention}
          onChange={(e) => setZoneIntervention(e.target.value)}
          required
        />

        <label>Partenaires du projet</label>
        <input
          type="text"
          placeholder="Entrer les partenaires du projet"
          value={partenaires}
          onChange={(e) => setPartenaires(e.target.value)}
        />

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label>Images du projet</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
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
