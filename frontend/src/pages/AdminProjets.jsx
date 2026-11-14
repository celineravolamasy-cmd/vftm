
import API_URL from "../services/api";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Plus,
  Pencil,
  Trash2,
  FolderKanban,
  X,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

import "./Admin.css";

// ==================================
// GERER LES URL DES IMAGES
// ==================================

function getImageUrl(image) {
  if (!image) return "";

  // Image déjà hébergée sur Cloudinary
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  // Ancienne image enregistrée dans le dossier uploads
  return `${API_URL}/uploads/${image}`;
}

function AdminProjets() {
  const navigate = useNavigate();

  const [projets, setProjets] = useState([]);
  const [projetASupprimer, setProjetASupprimer] = useState(null);
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  // ==================================
  // SESSION EXPIREE
  // ==================================

  const redirigerVersLogin = () => {
    localStorage.removeItem("user");

    alert(
      "Votre session a expiré. Veuillez vous reconnecter."
    );

    navigate("/login", { replace: true });
  };

  // ==================================
  // CHARGER LES PROJETS
  // ==================================

  useEffect(() => {
    let actif = true;

    const chargerProjets = async () => {
      try {
        const response = await fetch(`${API_URL}/projets`);

        if (!response.ok) {
          throw new Error("Erreur lors du chargement");
        }

        const data = await response.json();

        if (actif) {
          setProjets(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Erreur :", error);

        if (actif) {
          setMessage("Impossible de charger les projets.");
          setTypeMessage("erreur");
        }
      }
    };

    chargerProjets();

    return () => {
      actif = false;
    };
  }, []);

  // ==================================
  // SUPPRIMER UN PROJET AVEC CSRF
  // ==================================

  const supprimerProjet = async () => {
    if (!projetASupprimer || suppressionEnCours) {
      return;
    }

    setSuppressionEnCours(true);
    setMessage("");

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
        setProjetASupprimer(null);
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

      // 2. Supprimer le projet avec session et CSRF

      const response = await fetch(
        `${API_URL}/projets/${projetASupprimer.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      // 3. Vérifier si la session a expiré

      if (response.status === 401) {
        setProjetASupprimer(null);
        redirigerVersLogin();
        return;
      }

      // 4. Gérer les erreurs

      if (!response.ok) {
        const resultat = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          resultat.message ||
          "Erreur lors de la suppression"
        );
      }

      // 5. Actualiser le tableau

      setProjets((anciens) =>
        anciens.filter(
          (projet) =>
            projet.id !== projetASupprimer.id
        )
      );

      setProjetASupprimer(null);
      setMessage("Projet supprimé avec succès !");
      setTypeMessage("succes");

    } catch (error) {
      console.error("Erreur suppression :", error);

      setMessage(
        error.message ||
        "Impossible de supprimer ce projet."
      );

      setTypeMessage("erreur");

    } finally {
      setSuppressionEnCours(false);
    }
  };

  // ==================================
  // AFFICHAGE
  // ==================================

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        <AdminHeader />

        <h1 className="admin-title">
          <FolderKanban size={30} />
          Gestion des Projets
        </h1>

        <Link
          to="/admin/projets/ajouter"
          className="btn-add actualite-add-link"
        >
          <Plus size={19} />
          Ajouter un projet
        </Link>

        <div className="actualite-table-container">

          <table className="admin-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Description</th>
                <th>Date</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {projets.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="actualite-empty"
                  >
                    Aucun projet disponible.
                  </td>
                </tr>
              ) : (
                projets.map((projet) => (
                  <tr key={projet.id}>

                    <td>{projet.id}</td>

                    <td>{projet.titre}</td>

                    <td className="actualite-description">
                      {projet.description}
                    </td>

                    <td>
                      {projet.date || projet.date_projet || ""}
                    </td>

                    <td>
                      {projet.image ? (
                        <img
                          src={getImageUrl(projet.image)}
                          alt={projet.titre || "Image du projet"}
                          className="actualite-image"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="actualite-no-image">
                          <ImageIcon size={16} />
                          Aucune image
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="actualite-actions">

                        <Link
                          to={`/admin/projets/modifier/${projet.id}`}
                          className="btn-edit actualite-action-btn"
                        >
                          <Pencil size={16} />
                          Modifier
                        </Link>

                        <button
                          type="button"
                          className="btn-delete actualite-action-btn"
                          onClick={() => {
                            setMessage("");
                            setProjetASupprimer(projet);
                          }}
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ==================================
          FENETRE DE CONFIRMATION
      ================================== */}

      {projetASupprimer && (
        <div
          className="actualite-modal-overlay"
          onClick={() => {
            if (!suppressionEnCours) {
              setProjetASupprimer(null);
            }
          }}
        >

          <div
            className="actualite-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="projet-modal-title"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="actualite-modal-close"
              aria-label="Fermer"
              disabled={suppressionEnCours}
              onClick={() => setProjetASupprimer(null)}
            >
              <X size={20} />
            </button>

            <div className="actualite-modal-icon">
              <AlertTriangle size={30} />
            </div>

            <h2 id="projet-modal-title">
              Confirmer la suppression
            </h2>

            <p>
              Voulez-vous vraiment supprimer le projet{" "}
              <strong>
                « {projetASupprimer.titre} »
              </strong>
              {" "}?
              Cette action est définitive.
            </p>

            <div className="actualite-modal-actions">

              <button
                type="button"
                className="actualite-cancel-btn"
                disabled={suppressionEnCours}
                onClick={() => setProjetASupprimer(null)}
              >
                Annuler
              </button>

              <button
                type="button"
                className="actualite-confirm-delete-btn"
                disabled={suppressionEnCours}
                onClick={supprimerProjet}
              >
                <Trash2 size={17} />

                {suppressionEnCours
                  ? "Suppression..."
                  : "Oui, supprimer"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==================================
          NOTIFICATION
      ================================== */}

      {message && (
        <div
          className={`actualite-toast ${
            typeMessage === "erreur"
              ? "actualite-toast-error"
              : "actualite-toast-success"
          }`}
          role="status"
        >

          {typeMessage === "erreur" ? (
            <AlertTriangle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}

          <span>{message}</span>

          <button
            type="button"
            aria-label="Fermer la notification"
            onClick={() => setMessage("")}
          >
            <X size={18} />
          </button>

        </div>
      )}

    </div>
  );
}

export default AdminProjets;
