import API_URL from '../services/api';

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AjouterActualite.css";



function AjouterPartenaire() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [logo, setLogo] = useState(null);

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
  // AJOUTER UN PARTENAIRE AVEC CSRF
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

      formData.append("nom", nom);
      formData.append("description", description);
      formData.append("site_web", siteWeb);

      if (logo) {
        formData.append("logo", logo);
      }

      // ==============================
      // 3. ENVOYER AVEC SESSION + CSRF
      // ==============================

      const response = await fetch(
        `${API_URL}/partenaires`,
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
      // 5. VERIFIER LA REPONSE
      // ==============================

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Erreur lors de l'ajout du partenaire."
        );
      }

      // ==============================
      // 6. CONFIRMATION
      // ==============================

      alert("Partenaire ajouté avec succès !");

      navigate("/admin/partenaires");

    } catch (error) {
      console.error(
        "Erreur ajout partenaire :",
        error
      );

      alert(
        error.message ||
        "Impossible de contacter le serveur."
      );

    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div className="add-page">

      <h1>Ajouter un Partenaire</h1>

      <form
        className="add-form"
        onSubmit={handleSubmit}
      >

        {/* NOM */}
        <label>
          Nom du partenaire
        </label>

        <input
          type="text"
          placeholder="Entrer le nom du partenaire"
          value={nom}
          onChange={(e) =>
            setNom(e.target.value)
          }
          required
        />

        {/* DESCRIPTION */}
        <label>
          Description
        </label>

        <textarea
          rows="5"
          placeholder="Entrer une description (facultatif)"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        ></textarea>

        {/* LOGO */}
        <label>
          Logo
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setLogo(e.target.files?.[0] || null)
          }
        />

        {/* SITE WEB */}
        <label>
          Site web
        </label>

        <input
          type="url"
          placeholder="https://exemple.com (facultatif)"
          value={siteWeb}
          onChange={(e) =>
            setSiteWeb(e.target.value)
          }
        />

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
            onClick={() =>
              navigate("/admin/partenaires")
            }
          >
            Annuler
          </button>

        </div>

      </form>

    </div>
  );
}

export default AjouterPartenaire;
