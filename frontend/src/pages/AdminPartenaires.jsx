import API_URL from '../services/api';

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Plus,
  Pencil,
  Trash2,
  Handshake,
  X,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

import "./Admin.css";



function AdminPartenaires() {
  const navigate = useNavigate();

  const [partenaires, setPartenaires] = useState([]);
  const [partenaireASupprimer, setPartenaireASupprimer] = useState(null);
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

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
  // CHARGER LES PARTENAIRES
  // ==================================

  useEffect(() => {
    let actif = true;

    const chargerPartenaires = async () => {
      try {
        const response = await fetch(
          `${API_URL}/partenaires`
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement");
        }

        const data = await response.json();

        if (actif) {
          setPartenaires(data);
        }

      } catch (error) {
        console.error("Erreur :", error);

        if (actif) {
          setMessage(
            "Impossible de charger les partenaires."
          );
          setTypeMessage("erreur");
        }
      }
    };

    chargerPartenaires();

    return () => {
      actif = false;
    };
  }, []);

  // ==================================
  // SUPPRIMER UN PARTENAIRE AVEC CSRF
  // ==================================

  const supprimerPartenaire = async () => {
    if (!partenaireASupprimer || suppressionEnCours) {
      return;
    }

    setSuppressionEnCours(true);
    setMessage("");

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
        setPartenaireASupprimer(null);
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
      // 2. SUPPRIMER AVEC SESSION + CSRF
      // ==============================

      const response = await fetch(
        `${API_URL}/partenaires/${partenaireASupprimer.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      // ==============================
      // 3. SESSION EXPIREE
      // ==============================

      if (response.status === 401) {
        setPartenaireASupprimer(null);
        redirigerVersLogin();
        return;
      }

      // ==============================
      // 4. GESTION DES ERREURS
      // ==============================

      if (!response.ok) {
        const resultat = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          resultat.message ||
          "Erreur lors de la suppression"
        );
      }

      // ==============================
      // 5. ACTUALISER LE TABLEAU
      // ==============================

      setPartenaires((anciens) =>
        anciens.filter(
          (partenaire) =>
            partenaire.id !== partenaireASupprimer.id
        )
      );

      // Fermer la fenêtre de confirmation
      setPartenaireASupprimer(null);

      // Notification de succès
      setMessage(
        "Partenaire supprimé avec succès !"
      );
      setTypeMessage("succes");

    } catch (error) {
      console.error(
        "Erreur suppression partenaire :",
        error
      );

      setMessage(
        error.message ||
        "Impossible de supprimer ce partenaire."
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
          <Handshake size={30} />
          Gestion des Partenaires
        </h1>

        <Link
          to="/admin/partenaires/ajouter"
          className="btn-add actualite-add-link"
        >
          <Plus size={19} />
          Ajouter un partenaire
        </Link>

        <div className="actualite-table-container">
          <table className="admin-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Logo</th>
                <th>Site web</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {partenaires.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="actualite-empty"
                  >
                    Aucun partenaire disponible.
                  </td>
                </tr>
              ) : (
                partenaires.map((partenaire) => (
                  <tr key={partenaire.id}>

                    <td>{partenaire.id}</td>

                    <td>{partenaire.nom}</td>

                    <td className="actualite-description">
                      {partenaire.description}
                    </td>

                    <td>
                      {partenaire.logo ? (
                        <img
                          src={`${API_URL}/uploads/${partenaire.logo}`}
                          alt={partenaire.nom}
                          className="actualite-image"
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <span className="actualite-no-image">
                          <ImageIcon size={16} />
                          Aucun logo
                        </span>
                      )}
                    </td>

                    <td>
                      {partenaire.site_web ? (
                        <a
                          href={partenaire.site_web}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visiter
                        </a>
                      ) : (
                        <span>Non disponible</span>
                      )}
                    </td>

                    <td>
                      <div className="actualite-actions">

                        <Link
                          to={`/admin/partenaires/modifier/${partenaire.id}`}
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
                            setPartenaireASupprimer(partenaire);
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

      {partenaireASupprimer && (
        <div
          className="actualite-modal-overlay"
          onClick={() => {
            if (!suppressionEnCours) {
              setPartenaireASupprimer(null);
            }
          }}
        >
          <div
            className="actualite-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="partenaire-modal-title"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="actualite-modal-close"
              aria-label="Fermer"
              disabled={suppressionEnCours}
              onClick={() =>
                setPartenaireASupprimer(null)
              }
            >
              <X size={20} />
            </button>

            <div className="actualite-modal-icon">
              <AlertTriangle size={30} />
            </div>

            <h2 id="partenaire-modal-title">
              Confirmer la suppression
            </h2>

            <p>
              Voulez-vous vraiment supprimer le partenaire{" "}
              <strong>
                « {partenaireASupprimer.nom} »
              </strong>{" "}
              ? Cette action est définitive.
            </p>

            <div className="actualite-modal-actions">

              <button
                type="button"
                className="actualite-cancel-btn"
                disabled={suppressionEnCours}
                onClick={() =>
                  setPartenaireASupprimer(null)
                }
              >
                Annuler
              </button>

              <button
                type="button"
                className="actualite-confirm-delete-btn"
                disabled={suppressionEnCours}
                onClick={supprimerPartenaire}
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

export default AdminPartenaires;
