import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://vftm.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/admin");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <h1>VFTM</h1>

        <p>
          Vondron'ny Fampandrosoana ny Tantsaha Matsiatra Ambony
        </p>

        <h2>Bienvenue</h2>

        <p>
          Connectez-vous pour accéder au tableau de bord administrateur.
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              Se connecter
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
