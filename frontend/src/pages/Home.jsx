import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const slides = [
  {
    image: "/images/vftm-raisin.jpg",
    title: "Valoriser les productions des paysans",
    text: "Le VFTM accompagne les producteurs et valorise les produits agricoles de la Haute Matsiatra.",
  },
  {
    image: "/images/vftm-huile-essentielle.jpg",
    title: "Des produits issus du savoir-faire local",
    text: "Découvrez les productions et les initiatives développées au sein du réseau VFTM.",
  },
  {
    image: "/images/vftm-riz.jpg",
    title: "Agriculture et développement rural",
    text: "Le VFTM œuvre pour l'amélioration des revenus et des conditions de vie des producteurs.",
  },
  {
    image: "/images/vftm-lait.jpg",
    title: "Soutenir les filières agricoles",
    text: "Une dynamique collective au service des producteurs et de leurs organisations.",
  },
  {
    image: "/images/vftm-poisson.jpg",
    title: "Diversifier les activités",
    text: "Le réseau intervient dans plusieurs filières et contribue au développement économique local.",
  },
  {
    image: "/images/vftm-vannerie.jpg",
    title: "Valoriser les savoir-faire",
    text: "Les activités des membres contribuent à la création de revenus et à l'autonomisation.",
  },
];

function Home() {
  const [current, setCurrent] = useState(0);
  const [actualites, setActualites] = useState([]);
  const [projets, setProjets] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [actualitesResponse, projetsResponse] = await Promise.all([
          fetch("http://127.0.0.1:5000/actualites"),
          fetch("http://127.0.0.1:5000/projets"),
        ]);

        if (actualitesResponse.ok) {
          const actualitesData = await actualitesResponse.json();
          setActualites(actualitesData.slice(0, 3));
        }

        if (projetsResponse.ok) {
          const projetsData = await projetsResponse.json();
          setProjets(projetsData.slice(0, 3));
        }
      } catch (error) {
        console.error("Erreur chargement accueil :", error);
      }
    };

    chargerDonnees();
  }, []);

  const slide = slides[current];

  return (
    <main className="home-page">

      <section className="home-hero">
        {slides.map((item, index) => (
          <div
            key={item.image}
            className={`hero-slide ${index === current ? "active" : ""}`}
            style={{ backgroundImage: `url("${item.image}")` }}
          />
        ))}

        <div className="hero-overlay" />

        <div className="hero-content">
          <span className="hero-badge">VFTM</span>

          <h1>
            Vondron'ny Fampandrosoana
            <br />
            ny Tantsaha Matsiatra Ambony
          </h1>

          <p className="hero-subtitle">
            {slide.title}
          </p>

          <p className="hero-text">
            {slide.text}
          </p>

          <div className="hero-buttons">
            <Link to="/association" className="hero-btn primary">
              Découvrir le VFTM
            </Link>

            <Link to="/projets" className="hero-btn secondary">
              Nos projets
            </Link>
          </div>
        </div>

        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={index === current ? "active" : ""}
              onClick={() => setCurrent(index)}
              aria-label={`Afficher la diapositive ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="home-section presentation">
        <div className="section-heading">
          <span>À propos de nous</span>
          <h2>Une organisation au service des paysans</h2>
        </div>

        <div className="presentation-grid">
          <div>
            <p>
              Le VFTM est une plateforme d'organisations paysannes engagée
              dans le développement agricole et rural de la Haute Matsiatra.
            </p>
            <p>
              Il rassemble des organisations de producteurs et œuvre à la
              valorisation des produits, à l'amélioration des revenus et au
              renforcement de l'autonomie de ses membres.
            </p>

            <Link to="/association" className="text-link">
              En savoir plus sur le VFTM →
            </Link>
          </div>

          <div className="presentation-card">
            <strong>VFTM</strong>
            <span>Plateforme d'Organisations Paysannes</span>
            <span>Haute Matsiatra · Madagascar</span>
          </div>
        </div>
      </section>

      <section className="home-section domaines">
        <div className="section-heading center">
          <span>Nos domaines</span>
          <h2>Des filières diversifiées</h2>
        </div>

        <div className="domain-grid">
          <div className="domain-card">
            <span>🌾</span>
            <h3>Agriculture</h3>
            <p>Riziculture, cultures maraîchères et autres productions.</p>
          </div>

          <div className="domain-card">
            <span>🍇</span>
            <h3>Productions agricoles</h3>
            <p>Valorisation et transformation des produits des membres.</p>
          </div>

          <div className="domain-card">
            <span>🐟</span>
            <h3>Pisciculture</h3>
            <p>Développement de la production et de la commercialisation.</p>
          </div>

          <div className="domain-card">
            <span>🧺</span>
            <h3>Artisanat</h3>
            <p>Valorisation des savoir-faire et création de revenus.</p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span>Actualités</span>
          <h2>Les dernières nouvelles</h2>
        </div>

        <div className="content-grid">
          {actualites.length > 0 ? (
            actualites.map((actu) => (
              <article className="content-card" key={actu.id}>
                {actu.image && (
                  <img
                    src={`http://127.0.0.1:5000/uploads/${actu.image}`}
                    alt={actu.titre}
                  />
                )}
                <div className="content-card-body">
                  <small>{actu.date}</small>
                  <h3>{actu.titre}</h3>
                  <p>{actu.description}</p>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-message">Aucune actualité disponible.</p>
          )}
        </div>

        <div className="section-action">
          <Link to="/actualites" className="outline-btn">
            Voir toutes les actualités
          </Link>
        </div>
      </section>

      <section className="home-section projects-section">
        <div className="section-heading">
          <span>Nos projets</span>
          <h2>Des actions concrètes pour le développement</h2>
        </div>

        <div className="content-grid">
          {projets.length > 0 ? (
            projets.map((projet) => (
              <article className="content-card" key={projet.id}>
                {projet.image && (
                  <img
                    src={`http://127.0.0.1:5000/uploads/${projet.image}`}
                    alt={projet.titre}
                  />
                )}
                <div className="content-card-body">
                  <small>{projet.date}</small>
                  <h3>{projet.titre}</h3>
                  <p>{projet.description}</p>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-message">Aucun projet disponible.</p>
          )}
        </div>

        <div className="section-action">
          <Link to="/projets" className="outline-btn">
            Voir tous les projets
          </Link>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span>Vous souhaitez collaborer avec le VFTM ?</span>
          <h2>Construisons ensemble un développement rural durable.</h2>
        </div>

        <Link to="/contact" className="cta-btn">
          Contactez-nous
        </Link>
      </section>

    </main>
  );
}

export default Home;
