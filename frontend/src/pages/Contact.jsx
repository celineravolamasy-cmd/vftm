
import API_URL from "../services/api";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

import "./Contact.css";

function Contact() {
  const location = useLocation();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (location.state?.sujet) {
      setSujet(location.state.sujet);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEnvoi(true);

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          email,
          sujet,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Votre message a été enregistré.");

        setNom("");
        setEmail("");
        setSujet("");
        setMessage("");
      } else {
        alert(
          data.message || "Erreur lors de l'envoi du message."
        );
      }

    } catch (error) {
      console.error("Erreur :", error);
      alert("Impossible de contacter le serveur.");

    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="page contact-page">
      <h1>Contactez-nous</h1>

      <p className="contact-intro">
        Vous souhaitez en savoir plus sur le VFTM
        ou nous contacter ? Retrouvez ci-dessous
        nos coordonnées.
      </p>

      <div className="contact-container">

        <div className="contact-info">
          <h2>Nos coordonnées</h2>

          <div className="contact-item">
            <h3>
              <MapPin size={22} color="#16a34a" />
              Adresse
            </h3>
            <p>
              Près IE Anjoma,
              Fianarantsoa, Madagascar
            </p>
          </div>

          <div className="contact-item">
            <h3>
              <Phone size={22} color="#16a34a" />
              Téléphone
            </h3>
            <p>
              <a href="tel:+261348684171">
                034 86 841 71
              </a>
            </p>
          </div>

          <div className="contact-item">
            <h3>
              <Mail size={22} color="#16a34a" />
              Email
            </h3>
            <p>
              <a href="mailto:asvftm@gmail.com">
                asvftm@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Envoyer un message</h2>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="nom">Nom complet</label>
            <input
              id="nom"
              type="text"
              placeholder="Votre nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="sujet">Sujet</label>
            <input
              id="sujet"
              type="text"
              placeholder="Sujet du message"
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              required
            />

            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              rows="6"
              placeholder="Écrivez votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={envoi}
            >
              {envoi
                ? "Envoi en cours..."
                : "Envoyer le message"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Contact;
