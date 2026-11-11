import API_URL from '../services/api';

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Plus,
  Pencil,
  Trash2,
  Newspaper,
  X,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

import "./Admin.css";



function AdminActualites() {
  const navigate = useNavigate();

  const [actualites, setActualites] = useState([]);
  const [actualiteASupprimer, setActualiteASupprimer] = useState(null);

  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  // ================================
  // Session expirée
  // ================================

  const redirigerVersLogin = () => {
    localStorage.removeItem("user");

    alert(
      "Votre session a expiré. Veuillez vous reconnecter."
    );

    navigate("/login", { replace: true });
  };

  // ================================
  // Charger les actualités
  // ================================

  useEffect(() => {
    let actif = true;

    const chargerActualites = async () => {
      try {
        const response = await fetch(
          `${API_URL}/actualites`
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement");
        }

        const data = await response.json();

        if (actif) {
          setActualites(data);
        }

      } catch (error) {
        console.error("Erreur :", error);

        if (actif) {
          setMessage(
            "Impossible de charger les actualités."
          );

          setTypeMessage("erreur");
        }
      }
    };

    chargerActualites();

    return () => {
      actif = false;
    };
  }, []);

  // ================================
  // Supprimer une actualité
  // ================================

  const supprimerActualite = async () => {
    if (!actualiteASupprimer || suppressionEnCours) {
      return;
    }

    setSuppressionEnCours(true);
    setMessage("");

    try {

      // ================================
      // 1. Vérifier la session et
      // récupérer le token CSRF
      // ================================

      const checkResponse = await fetch(
        `${API_URL}/auth/check`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (checkResponse.status === 401) {
        setActualiteASupprimer(null);
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

      // ================================
      // 2. Supprimer avec session + CSRF
      // ================================

      const response = await fetch(
        `${API_URL}/actualites/${actualiteASupprimer.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      if (response.status === 401) {
        setActualiteASupprimer(null);
        redirigerVersLogin();
        return;
      }

      if (!response.ok) {
        const resultat = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          resultat.message ||
          "Erreur lors de la suppression"
        );
      }

      // ================================
      // 3. Actualiser le tableau
      // ================================

      setActualites((anciennes) =>
        anciennes.filter(
          (actu) =>
            actu.id !== actualiteASupprimer.id
        )
      );

      // Fermer la confirmation
      setActualiteASupprimer(null);

      // Notification
      setMessage(
        "Actualité supprimée avec succès !"
      );
      setTypeMessage("succes");

    } catch (error) {
      console.error("Erreur :", error);

      setMessage(
        error.message ||
        "Impossible de supprimer cette actualité."
      );

      setTypeMessage("erreur");

    } finally {
      setSuppressionEnCours(false);
    }
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        <AdminHeader />

        <h1 className="admin-title">
          <Newspaper size={30} />
          Gestion des Actualités
        </h1>

        <Link
          to="/admin/actualites/ajouter"
          className="btn-add actualite-add-link"
        >
          <Plus size={19} />
          Ajouter une actualité
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
              {actualites.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="actualite-empty"
                  >
                    Aucune actualité disponible.
                  </td>
                </tr>
              ) : (
                actualites.map((actu) => (
                  <tr key={actu.id}>

                    <td>{actu.id}</td>

                    <td>{actu.titre}</td>

                    <td className="actualite-description">
                      {actu.description}
                    </td>

                    <td>{actu.date}</td>

                    <td>
                      {actu.image ? (
                        <img
                          src={`${API_URL}/uploads/${actu.image}`}
                          alt={actu.titre}
                          className="actualite-image"
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
                          to={`/admin/actualites/modifier/${actu.id}`}
                          className="btn-edit actualite-action-btn"
                        >
                          <Pencil size={16} />
                          Modifier
                        </Link>

                        <button
                          type="button"
                          className="btn-delete actualite-action-btn"
                          onClick={() =>
                            setActualiteASupprimer(actu)
                          }
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

      {/* ================================
          FENETRE DE CONFIRMATION
      ================================ */}

      {actualiteASupprimer && (
        <div
          className="actualite-modal-overlay"
          onClick={() => {
            if (!suppressionEnCours) {
              setActualiteASupprimer(null);
            }
          }}
        >
          <div
            className="actualite-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="actualite-modal-title"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="actualite-modal-close"
              aria-label="Fermer"
              disabled={suppressionEnCours}
              onClick={() =>
                setActualiteASupprimer(null)
              }
            >
              <X size={20} />
            </button>

            <div className="actualite-modal-icon">
              <AlertTriangle size={30} />
            </div>

            <h2 id="actualite-modal-title">
              Confirmer la suppression
            </h2>

            <p>
              Voulez-vous vraiment supprimer
              l’actualité{" "}
              <strong>
                « {actualiteASupprimer.titre} »
              </strong>{" "}
              ? Cette action est définitive.
            </p>

            <div className="actualite-modal-actions">

              <button
                type="button"
                className="actualite-cancel-btn"
                disabled={suppressionEnCours}
                onClick={() =>
                  setActualiteASupprimer(null)
                }
              >
                Annuler
              </button>

              <button
                type="button"
                className="actualite-confirm-delete-btn"
                disabled={suppressionEnCours}
                onClick={supprimerActualite}
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

      {/* ================================
          NOTIFICATION
      ================================ */}

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

export default AdminActualites;
