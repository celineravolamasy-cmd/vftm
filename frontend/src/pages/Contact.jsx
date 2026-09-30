import { useState } from "react";
import "./Contact.css";

function Contact() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");

  const [envoi, setEnvoi] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEnvoi(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/messages",
        {
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
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Votre message a été envoyé avec succès !");

        setNom("");
        setEmail("");
        setSujet("");
        setMessage("");
      } else {
        alert(data.message || "Erreur lors de l'envoi du message.");
      }
    } catch (error) {
      console.error(error);
      alert("Impossible de contacter le serveur.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="page contact-page">

      <h1>Contactez-nous</h1>

      <p className="contact-intro">
        Vous souhaitez en savoir plus sur le VFTM ou nous contacter ?
        Retrouvez ci-dessous nos coordonnées.
      </p>

      <div className="contact-container">

        {/* Informations de contact */}
        <div className="contact-info">

          <h2>Nos coordonnées</h2>

          <div className="contact-item">
            <h3>📍 Adresse</h3>
            <p>Fianarantsoa - Madagascar</p>
          </div>

          <div className="contact-item">
            <h3>📞 Téléphone</h3>
            <p>Coordonnée officielle du VFTM</p>
          </div>

          <div className="contact-item">
            <h3>📧 Email</h3>
            <p>Adresse email officielle du VFTM</p>
          </div>

        </div>

        {/* Formulaire */}
        <div className="contact-form-container">

          <h2>Envoyer un message</h2>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            <label>Nom complet</label>

            <input
              type="text"
              placeholder="Votre nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />

            <label>Email</label>

            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Sujet</label>

            <input
              type="text"
              placeholder="Sujet du message"
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              required
            />

            <label>Message</label>

            <textarea
              rows="6"
              placeholder="Écrivez votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>

            <button type="submit" disabled={envoi}>
              {envoi ? "Envoi en cours..." : "Envoyer le message"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Contact;