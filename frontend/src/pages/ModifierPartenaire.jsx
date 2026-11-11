import API_URL from '../services/api';

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./AjouterActualite.css";



function ModifierPartenaire() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [logo, setLogo] = useState(null);
  const [ancienLogo, setAncienLogo] = useState("");

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
  // CHARGER LE PARTENAIRE
  // ==================================

  useEffect(() => {
    let actif = true;

    const chargerPartenaire = async () => {
      setChargement(true);
      setErreur("");

      try {
        const response = await fetch(
          `${API_URL}/partenaires/${id}`
        );

        if (!response.ok) {
          throw new Error("Partenaire introuvable");
        }

        const data = await response.json();

        if (!actif) return;

        setNom(data.nom || "");
        setDescription(data.description || "");
        setSiteWeb(data.site_web || "");
        setAncienLogo(data.logo || "");
        setLogo(null);

      } catch (error) {
        console.error("Erreur chargement :", error);

        if (actif) {
          setErreur(
            "Impossible de charger le partenaire."
          );
        }

      } finally {
        if (actif) {
          setChargement(false);
        }
      }
    };

    chargerPartenaire();

    return () => {
      actif = false;
    };
  }, [id]);

  // ==================================
  // MODIFIER LE PARTENAIRE AVEC CSRF
  // ==================================

  const modifierPartenaire = async (e) => {
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

      // Envoyer le nouveau logo si sélectionné
      if (logo) {
        formData.append("logo", logo);
      }

      // ==============================
      // 3. MODIFICATION AVEC CSRF
      // ==============================

      const response = await fetch(
        `${API_URL}/partenaires/${id}`,
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

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Erreur lors de la modification."
        );
      }

      // ==============================
      // 6. CONFIRMATION
      // ==============================

      alert("Partenaire modifié avec succès !");

      navigate("/admin/partenaires");

    } catch (error) {
      console.error(
        "Erreur modification partenaire :",
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

  // ==================================
  // CHARGEMENT
  // ==================================

  if (chargement) {
    return (
      <div className="add-page">
        <p>Chargement du partenaire...</p>
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
          onClick={() =>
            navigate("/admin/partenaires")
          }
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="add-page">

      <h1>Modifier un Partenaire</h1>

      <form
        className="add-form"
        onSubmit={modifierPartenaire}
      >

        {/* NOM */}
        <label>
          Nom du partenaire
        </label>

        <input
          type="text"
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
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        ></textarea>

        {/* LOGO ACTUEL */}
        {ancienLogo && (
          <div>
            <label>
              Logo actuel
            </label>

            <br />

            <img
              src={`${API_URL}/uploads/${ancienLogo}`}
              alt={nom}
              style={{
                width: "120px",
                height: "90px",
                objectFit: "contain",
                marginBottom: "15px",
              }}
            />
          </div>
        )}

        {/* NOUVEAU LOGO */}
        <label>
          Nouveau logo
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
              ? "Modification..."
              : "Modifier"}
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

export default ModifierPartenaire;
