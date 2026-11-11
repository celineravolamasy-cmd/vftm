import API_URL from '../services/api';

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";



function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================
  // CONNEXION ADMIN
  // ==================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setLoading(true);

    try {
      // ==============================
      // 1. ENVOYER LES IDENTIFIANTS
      // ==============================

      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !data.success) {
        setMessage(
          data.message ||
          "Adresse e-mail ou mot de passe incorrect."
        );
        return;
      }

      // ==============================
      // 2. VERIFIER LA SESSION FLASK
      // ==============================

      const checkResponse = await fetch(
        `${API_URL}/auth/check`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const checkData = await checkResponse
        .json()
        .catch(() => ({}));

      if (
        !checkResponse.ok ||
        !checkData.authenticated
      ) {
        setMessage(
          "Connexion acceptée, mais la session n'est pas reconnue. Vérifiez les cookies."
        );
        return;
      }

      // ==============================
      // 3. CONSERVER LES INFORMATIONS
      // POUR LES ANCIENS COMPOSANTS
      // ==============================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // ==============================
      // 4. OUVRIR LE DASHBOARD
      // ==============================

      navigate("/admin", { replace: true });

    } catch (error) {
      console.error(
        "Erreur connexion :",
        error
      );

      setMessage(
        "Impossible de contacter le serveur Flask."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <h1>VFTM</h1>

        <p>
          Vondron'ny Fampandrosoana ny
          Tantsaha Matsiatra Ambony
        </p>

        <h2>Bienvenue</h2>

        <p>
          Connectez-vous pour accéder au
          tableau de bord administrateur.
        </p>
      </div>

      <div className="login-right">

        <div className="login-card">

          <h2>Connexion</h2>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              placeholder="Adresse e-mail"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Connexion en cours..."
                : "Se connecter"}
            </button>

          </form>

          {message && (
            <p className="login-message">
              {message}
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default Login;
