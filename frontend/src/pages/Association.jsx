import { useEffect, useState } from "react";
import "./Association.css";

function Association() {
  const [activeSection, setActiveSection] = useState("presentation");

  // ==========================
  // Partenaires
  // ==========================
  const [partenaires, setPartenaires] = useState([]);
  const [loadingPartenaires, setLoadingPartenaires] = useState(false);
  const [errorPartenaires, setErrorPartenaires] = useState("");

  // Récupérer les partenaires depuis le backend
  useEffect(() => {
    if (activeSection !== "partenaires") {
      return;
    }

    setLoadingPartenaires(true);
    setErrorPartenaires("");

    fetch("https://vftm.onrender.com/partenaires")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des partenaires");
        }

        return response.json();
      })
      .then((data) => {
        setPartenaires(data);
        setLoadingPartenaires(false);
      })
      .catch((error) => {
        console.error("Erreur partenaires :", error);
        setErrorPartenaires(
          "Impossible de charger les partenaires."
        );
        setLoadingPartenaires(false);
      });
  }, [activeSection]);

  const sections = {
    presentation: {
      title: "Présentation du VFTM",
      content: (
        <>
          <p>
            Le <strong>VFTM</strong> (Vondrona Fampandrosoana ny Tantsaha
            Matsiatra Ambony) est un groupement œuvrant pour le développement
            des paysans dans la région de la Haute Matsiatra.
          </p>

          <p>
            Créé en <strong>2006</strong>, le VFTM regroupe actuellement
            <strong> 47 organisations de base</strong> représentant environ
            <strong> 4 555 exploitations agricoles familiales (EAF)</strong>,
            dont <strong>2 979 femmes</strong>.
          </p>

          <p className="motto">
            « Tantsaha mivoatsa ro fitaratsa »
          </p>

          <p>
            Le VFTM défend et accompagne les agriculteurs afin de renforcer
            l'agriculture familiale, améliorer les revenus des exploitations
            agricoles et valoriser le métier de paysan.
          </p>
        </>
      ),
    },

    organisation: {
      title: "Organisation",
      content: (
        <>
          <p>
            Le fonctionnement du VFTM repose sur plusieurs instances qui
            assurent sa gouvernance et son bon fonctionnement.
          </p>

          <ul>
            <li>
              <strong>Assemblée Générale :</strong> 2 représentants par
              organisation membre.
            </li>

            <li>
              <strong>Conseil d'administration :</strong> 15 membres.
            </li>

            <li>
              <strong>Équipe exécutive :</strong> 10 techniciens.
            </li>

            <li>
              <strong>Comité de surveillance :</strong> 2 élus.
            </li>
          </ul>

          <p>
            Les comptes de l'organisation font également l'objet d'un audit
            externe annuel.
          </p>
        </>
      ),
    },

    missions: {
      title: "Missions et objectifs",
      content: (
        <>
          <p>
            La mission principale du VFTM est de défendre les intérêts
            communs des paysans et de contribuer à l'amélioration durable de
            leurs conditions de vie.
          </p>

          <ul>
            <li>Défendre les intérêts communs des producteurs.</li>

            <li>Valoriser le métier de paysan.</li>

            <li>Promouvoir l'agriculture familiale.</li>

            <li>
              Améliorer les revenus des exploitations agricoles familiales.
            </li>

            <li>
              Renforcer l'autonomie organisationnelle et financière.
            </li>

            <li>
              Développer des activités génératrices de revenus.
            </li>
          </ul>
        </>
      ),
    },

    domaines: {
      title: "Domaines d'intervention",
      content: (
        <>
          <p>
            Le VFTM intervient dans plusieurs filières agricoles et activités
            économiques afin de diversifier les sources de revenus des
            producteurs.
          </p>

          <div className="domaines-grid">
            <div>🌾 Riz</div>
            <div>🍯 Miel</div>
            <div>🥛 Lait</div>
            <div>🐟 Poisson</div>
            <div>🥬 Culture maraîchère</div>
            <div>🧺 Vannerie</div>
            <div>🍇 Vigne</div>
            <div>🌿 Huiles essentielles</div>
          </div>
        </>
      ),
    },

    valeurs: {
      title: "Notre vision",
      content: (
        <>
          <p>
            Le VFTM œuvre pour une agriculture familiale dynamique, autonome
            et capable d'assurer des revenus durables aux exploitations
            agricoles.
          </p>

          <p>
            L'organisation souhaite contribuer à faire du métier de paysan
            une activité professionnelle valorisée et économiquement viable.
          </p>

          <p>
            Son action repose notamment sur la solidarité entre producteurs,
            le développement des filières agricoles et le renforcement des
            capacités des organisations paysannes.
          </p>
        </>
      ),
    },

    // ==========================
    // PARTENAIRES
    // ==========================
    partenaires: {
      title: "Nos Partenaires",
      content: (
        <>
          <p>
            Le VFTM travaille en collaboration avec différents partenaires
            afin de renforcer ses actions en faveur du développement agricole
            et des organisations paysannes.
          </p>

          {loadingPartenaires && (
            <div className="partenaires-loading">
              Chargement des partenaires...
            </div>
          )}

          {errorPartenaires && (
            <div className="partenaires-error">
              {errorPartenaires}
            </div>
          )}

          {!loadingPartenaires &&
            !errorPartenaires &&
            partenaires.length === 0 && (
              <div className="partenaires-message">
                <h3>🤝 Nos partenaires</h3>

                <p>
                  Aucun partenaire n'est disponible pour le moment.
                </p>
              </div>
            )}

          {!loadingPartenaires &&
            !errorPartenaires &&
            partenaires.length > 0 && (
              <div className="partenaires-grid">

                {partenaires.map((partenaire) => (
                  <div
                    className="partenaire-card"
                    key={partenaire.id}
                  >

                    {/* LOGO */}
                    <div className="partenaire-logo">

                      {partenaire.logo ? (
                        <img
                          src={`https://vftm.onrender.com/uploads/${partenaire.logo}`}
                          alt={partenaire.nom}
                        />
                      ) : (
                        <div className="no-logo">
                          🤝
                        </div>
                      )}

                    </div>

                    {/* INFORMATIONS */}
                    <div className="partenaire-info">

                      <h3>
                        {partenaire.nom}
                      </h3>

                      {partenaire.description && (
                        <p>
                          {partenaire.description}
                        </p>
                      )}

                      {partenaire.site_web && (
                        <a
                          href={
                            partenaire.site_web.startsWith("http")
                              ? partenaire.site_web
                              : `https://${partenaire.site_web}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="partenaire-link"
                        >
                          🌐 Visiter le site
                        </a>
                      )}

                    </div>

                  </div>
                ))}

              </div>
            )}
        </>
      ),
    },
  };

  return (
    <div className="association-page">

      {/* ==========================
          HEADER
      ========================== */}
      <section className="association-header">
        <div>

          <span className="association-label">
            À PROPOS DE NOUS
          </span>

          <h1>
            Notre Association
          </h1>

          <p>
            <strong>VFTM</strong> — Vondrona Fampandrosoana ny Tantsaha
            Matsiatra Ambony
          </p>

          <p className="subtitle">
            Groupement pour le développement des paysans de la Haute
            Matsiatra
          </p>

        </div>
      </section>

      {/* ==========================
          CONTENU PRINCIPAL
      ========================== */}
      <section className="association-container">

        {/* BOUTONS */}
        <div className="association-buttons">

          <button
            className={
              activeSection === "presentation"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("presentation")
            }
          >
            📌 Présentation
          </button>

          <button
            className={
              activeSection === "organisation"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("organisation")
            }
          >
            🏢 Organisation
          </button>

          <button
            className={
              activeSection === "missions"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("missions")
            }
          >
            🎯 Missions & objectifs
          </button>

          <button
            className={
              activeSection === "domaines"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("domaines")
            }
          >
            🌱 Domaines d'intervention
          </button>

          <button
            className={
              activeSection === "valeurs"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("valeurs")
            }
          >
            👁️ Notre vision
          </button>

          <button
            className={
              activeSection === "partenaires"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("partenaires")
            }
          >
            🤝 Nos Partenaires
          </button>

        </div>

        {/* CONTENU */}
        <div className="association-content">

          <h2>
            {sections[activeSection].title}
          </h2>

          <div className="content-text">
            {sections[activeSection].content}
          </div>

        </div>

      </section>

      {/* ==========================
          CONTACT
      ========================== */}
      <section className="association-contact">

        <h2>
          Nous contacter
        </h2>

        <p>
          📍 Près lot IE 035 Anjoma, près de l'arrêt taxi Anjoma,
          Fianarantsoa — Madagascar
        </p>

        <p>
          ✉️ asvftm@gmail.com
        </p>

      </section>

    </div>
  );
}

export default Association;
