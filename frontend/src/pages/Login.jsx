import "./Login.css";

function Login() {
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

          <form>

            <input
              type="email"
              placeholder="Adresse e-mail"
            />

            <input
              type="password"
              placeholder="Mot de passe"
            />

            <button type="submit">
              Se connecter
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;
