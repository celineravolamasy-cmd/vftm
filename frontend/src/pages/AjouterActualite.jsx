
import API_URL from "../services/api";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AjouterActualite.css";

function AjouterActualite() {
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [images, setImages] = useState([]);
  const [enregistrement, setEnregistrement] = useState(false);

  // Redirection si la session a expiré
  const redirigerVersLogin = () => {
    localStorage.removeItem("user");

    alert("Votre session a expiré. Veuillez vous reconnecter.");

    navigate("/login", { replace: true });
  };

  // Sélection des images
  const handleImagesChange = (e) => {
    const fichiers = Array.from(e.target.files || []);

    const formatsAutorises = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const fichiersValides = fichiers.filter((fichier) =>
      formatsAutorises.includes(fichier.type)
    );

    if (fichiersValides.length !== fichiers.length) {
      alert("Certains fichiers ne sont pas des images autorisées.");
    }

    setImages(fichiersValides);
  };

  // Ajouter une actualité
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enregistrement) return;

    setEnregistrement(true);

    try {
      // 1. Vérifier la session
      const checkResponse = await fetch(`${API_URL}/auth/check`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (checkResponse.status === 401) {
        redirigerVersLogin();
        return;
      }

      if (!checkResponse.ok) {
        throw new Error("Impossible de vérifier la session.");
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
      formData.append("date", date);

      // Envoyer les images sous le nom attendu par le backend
      images.forEach((image) => {
        formData.append("images", image);
      });

      // 3. Envoyer au backend Flask
      // Le backend se charge de l'envoi vers Cloudinary
      const response = await fetch(`${API_URL}/actualites`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        body: formData,
      });

      if (response.status === 401) {
        redirigerVersLogin();
        return;
      }

      // 4. Vérifier la réponse
      if (!response.ok) {
        const resultat = await response.json().catch(() => ({}));

        throw new Error(
          resultat.message || "Erreur lors de l'ajout de l'actualité."
        );
      }

      // 5. Confirmation
      alert("Actualité ajoutée avec succès !");

      navigate("/admin/actualites");
    } catch (error) {
      console.error("Erreur ajout actualité :", error);

      alert(
        error.message || "Erreur lors de l'ajout de l'actualité."
      );
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div className="add-page">
      <h1>Ajouter une Actualité</h1>

      <form className="add-form" onSubmit={handleSubmit}>
        {/* TITRE */}
        <label>Titre</label>

        <input
          type="text"
          placeholder="Entrer le titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        {/* DESCRIPTION */}
        <label>Description</label>

        <textarea
          rows="6"
          placeholder="Entrer la description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
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
        <label>Images de l'actualité</label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleImagesChange}
        />

        {/* IMAGES SÉLECTIONNÉES */}
        {images.length > 0 && (
          <div className="images-selectionnees">
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
            {enregistrement ? "Enregistrement..." : "Enregistrer"}
          </button>

          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/actualites")}
            disabled={enregistrement}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default AjouterActualite;
