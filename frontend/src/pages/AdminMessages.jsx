import API_URL from '../services/api';

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MessageSquare,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  CheckCircle,
  Mail,
  User,
  CalendarDays,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

import "./Admin.css";
import "./AdminMessages.css";



function AdminMessages() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [messageAConsulter, setMessageAConsulter] = useState(null);
  const [messageASupprimer, setMessageASupprimer] = useState(null);

  const [notification, setNotification] = useState("");
  const [typeNotification, setTypeNotification] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [chargement, setChargement] = useState(true);

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
  // CHARGER LES MESSAGES
  // ==================================

  useEffect(() => {
    let actif = true;

    const chargerMessages = async () => {
      setChargement(true);

      try {
        const response = await fetch(
          `${API_URL}/messages`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!actif) return;

        if (response.status === 401) {
          localStorage.removeItem("user");

          alert(
            "Votre session a expiré. Veuillez vous reconnecter."
          );

          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Erreur lors du chargement"
          );
        }

        const data = await response.json();

        if (actif) {
          setMessages(data);
        }

      } catch (error) {
        console.error(
          "Erreur chargement messages :",
          error
        );

        if (actif) {
          setNotification(
            "Impossible de charger les messages."
          );
          setTypeNotification("erreur");
        }

      } finally {
        if (actif) {
          setChargement(false);
        }
      }
    };

    chargerMessages();

    return () => {
      actif = false;
    };
  }, [navigate]);

  // ==================================
  // CONSULTER UN MESSAGE
  // ==================================

  const consulterMessage = (msg) => {
    setMessageAConsulter(msg);
  };

  const fermerConsultation = () => {
    setMessageAConsulter(null);
  };

  // ==================================
  // SUPPRIMER UN MESSAGE AVEC CSRF
  // ==================================

  const supprimerMessage = async () => {
    if (!messageASupprimer || suppressionEnCours) {
      return;
    }

    setSuppressionEnCours(true);
    setNotification("");

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
        setMessageASupprimer(null);
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
        `${API_URL}/messages/${messageASupprimer.id}`,
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
        setMessageASupprimer(null);
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

      setMessages((anciens) =>
        anciens.filter(
          (msg) =>
            msg.id !== messageASupprimer.id
        )
      );

      setMessageASupprimer(null);

      setNotification(
        "Message supprimé avec succès !"
      );

      setTypeNotification("succes");

    } catch (error) {
      console.error(
        "Erreur suppression message :",
        error
      );

      setNotification(
        error.message ||
        "Impossible de supprimer ce message."
      );

      setTypeNotification("erreur");

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
          <MessageSquare size={30} />
          Gestion des Messages
        </h1>

        {/* TABLEAU DES MESSAGES */}
        <div className="actualite-table-container">

          <table className="admin-table messages-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Sujet</th>
                <th>Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {chargement ? (
                <tr>
                  <td colSpan="7" className="actualite-empty">
                    Chargement des messages...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="7" className="actualite-empty">
                    Aucun message pour le moment.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id}>

                    <td>{msg.id}</td>

                    <td>{msg.nom}</td>

                    <td>
                      <a href={`mailto:${msg.email}`}>
                        {msg.email}
                      </a>
                    </td>

                    <td>{msg.sujet}</td>

                    {/* BOUTON CONSULTER */}
                    <td>
                      <button
                        type="button"
                        className="message-consulter-btn"
                        onClick={() => consulterMessage(msg)}
                      >
                        <Eye size={17} />
                        Consulter
                      </button>
                    </td>

                    <td>{msg.date}</td>

                    <td>
                      <div className="actualite-actions">
                        <button
                          type="button"
                          className="btn-delete actualite-action-btn"
                          onClick={() => {
                            setNotification("");
                            setMessageASupprimer(msg);
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
          FENETRE CONSULTER MESSAGE
      ================================== */}

      {messageAConsulter && (
        <div
          className="message-consult-overlay"
          onClick={fermerConsultation}
        >
          <div
            className="message-consult-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-consult-title"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="message-consult-header">

              <div className="message-consult-heading">
                <MessageSquare size={24} />

                <h2 id="message-consult-title">
                  Détails du message
                </h2>
              </div>

              <button
                type="button"
                className="message-consult-close"
                aria-label="Fermer"
                onClick={fermerConsultation}
              >
                <X size={22} />
              </button>

            </div>

            <div className="message-consult-body">

              <div className="message-consult-field">
                <User size={18} />

                <div>
                  <strong>Nom de l'expéditeur</strong>
                  <p>{messageAConsulter.nom}</p>
                </div>
              </div>

              <div className="message-consult-field">
                <Mail size={18} />

                <div>
                  <strong>Adresse email</strong>

                  <p>
                    <a
                      href={`mailto:${messageAConsulter.email}`}
                    >
                      {messageAConsulter.email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="message-consult-field">
                <CalendarDays size={18} />

                <div>
                  <strong>Date de réception</strong>
                  <p>{messageAConsulter.date}</p>
                </div>
              </div>

              <div className="message-consult-subject">
                <strong>Sujet</strong>
                <p>{messageAConsulter.sujet}</p>
              </div>

              <div className="message-consult-text">
                <strong>Message reçu</strong>
                <p>{messageAConsulter.message}</p>
              </div>

            </div>

            <div className="message-consult-footer">
              <button
                type="button"
                className="message-consult-done"
                onClick={fermerConsultation}
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================
          CONFIRMATION DE SUPPRESSION
      ================================== */}

      {messageASupprimer && (
        <div
          className="actualite-modal-overlay"
          onClick={() => {
            if (!suppressionEnCours) {
              setMessageASupprimer(null);
            }
          }}
        >
          <div
            className="actualite-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-modal-title"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="actualite-modal-close"
              aria-label="Fermer"
              disabled={suppressionEnCours}
              onClick={() => setMessageASupprimer(null)}
            >
              <X size={20} />
            </button>

            <div className="actualite-modal-icon">
              <AlertTriangle size={30} />
            </div>

            <h2 id="message-modal-title">
              Confirmer la suppression
            </h2>

            <p>
              Voulez-vous vraiment supprimer le message de{" "}
              <strong>
                « {messageASupprimer.nom} »
              </strong>{" "}
              ? Cette action est définitive.
            </p>

            <div className="actualite-modal-actions">

              <button
                type="button"
                className="actualite-cancel-btn"
                disabled={suppressionEnCours}
                onClick={() => setMessageASupprimer(null)}
              >
                Annuler
              </button>

              <button
                type="button"
                className="actualite-confirm-delete-btn"
                disabled={suppressionEnCours}
                onClick={supprimerMessage}
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

      {notification && (
        <div
          className={`actualite-toast ${
            typeNotification === "erreur"
              ? "actualite-toast-error"
              : "actualite-toast-success"
          }`}
          role="status"
        >

          {typeNotification === "erreur" ? (
            <AlertTriangle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}

          <span>{notification}</span>

          <button
            type="button"
            aria-label="Fermer la notification"
            onClick={() => setNotification("")}
          >
            <X size={18} />
          </button>

        </div>
      )}

    </div>
  );
}

export default AdminMessages;
