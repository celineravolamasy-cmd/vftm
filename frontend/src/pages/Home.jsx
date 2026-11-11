import API_URL from '../services/api';

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

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // Diaporama automatique
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  // Charger les actualités et les projets
  useEffect(() => {
    const controller = new AbortController();

    const chargerDonnees = async () => {
      setChargement(true);
      setErreur("");

      try {
        const [actualitesResult, projetsResult] =
          await Promise.allSettled([
            fetch(`${API_URL}/actualites`, {
              signal: controller.signal,
            }).then(async (response) => {
              if (!response.ok) {
                throw new Error("Erreur actualités");
              }
              return response.json();
            }),

            fetch(`${API_URL}/projets`, {
              signal: controller.signal,
            }).then(async (response) => {
              if (!response.ok) {
                throw new Error("Erreur projets");
              }
              return response.json();
            }),
          ]);

        if (controller.signal.aborted) return;

        if (actualitesResult.status === "fulfilled") {
          const data = actualitesResult.value;

          setActualites(
            Array.isArray(data) ? data.slice(0, 3) : []
          );
        } else {
          setErreur(
            "Certaines informations sont indisponibles."
          );
        }

        if (projetsResult.status === "fulfilled") {
          const data = projetsResult.value;

          setProjets(
            Array.isArray(data) ? data.slice(0, 3) : []
          );
        } else {
          setErreur(
            "Certaines informations sont indisponibles."
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Erreur accueil :", error);
          setErreur("Impossible de charger les données.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setChargement(false);
        }
      }
    };

    chargerDonnees();

    return () => controller.abort();
  }, []);

  const slide = slides[current];

  return (
    <main className="home-page">

      {/* DIAPORAMA */}
      <section className="home-hero">
        {slides.map((item, index) => (
          <div
            key={item.image}
            className={`hero-slide ${
              index === current ? "active" : ""
            }`}
            style={{
              backgroundImage: `url("${item.image}")`,
            }}
          />
        ))}

        <div className="hero-overlay" />

        <div className="hero-content">
          <img
            src="/images/logo-vftm.png"
            alt="Logo VFTM"
            className="home-hero-logo"
          />

          <h1>
            Vondrona Fampandrosoana
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
            <Link
              to="/association"
              className="hero-btn primary"
            >
              Découvrir le VFTM
            </Link>

            <Link
              to="/projets"
              className="hero-btn secondary"
            >
              Nos projets
            </Link>
          </div>
        </div>

        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={
                index === current ? "active" : ""
              }
              onClick={() => setCurrent(index)}
              aria-label={
                `Afficher la diapositive ${index + 1}`
              }
            />
          ))}
        </div>
      </section>

      {/* PRESENTATION */}
      <section className="home-section presentation">
        <div className="section-heading">
          <span>À propos de nous</span>
          <h2>
            20 ans d'engagement au service des paysans
          </h2>
        </div>

        <div className="presentation-grid">
          <div>
            <p>
              Le <strong>VFTM</strong> est une
              organisation paysanne créée le
              <strong> 26 février 2006</strong> à
              Fianarantsoa, dans la région
              Haute Matsiatra.
            </p>

            <p>
              Il accompagne les agriculteurs,
              défend leurs intérêts communs
              et développe des activités
              économiques pour améliorer
              leurs conditions de vie.
            </p>

            <p>
              En 2026, le VFTM célèbre
              ses <strong>20 ans d'engagement</strong>
              au service des producteurs.
            </p>

            <Link
              to="/association"
              className="text-link"
            >
              En savoir plus sur le VFTM →
            </Link>
          </div>

          <div className="presentation-card">
            <strong>VFTM</strong>
            <span>
              Groupement pour le développement
              des paysans
            </span>
            <span>
              Haute Matsiatra · Madagascar
            </span>
            <span>
              Depuis 2006
            </span>
          </div>
        </div>
      </section>

      {/* DOMAINES */}
      <section className="home-section domaines">
        <div className="section-heading center">
          <span>Nos domaines</span>
          <h2>Des filières diversifiées</h2>
        </div>

        <div className="domain-grid">
          <div className="domain-card">
            <span>🌾</span>
            <h3>Agriculture</h3>
            <p>
              Riziculture, cultures maraîchères
              et production de semences.
            </p>
          </div>

          <div className="domain-card">
            <span>🍇</span>
            <h3>Viticulture</h3>
            <p>
              Développement de la vigne
              et valorisation de la production viticole.
            </p>
          </div>

          <div className="domain-card">
            <span>🐟</span>
            <h3>Pisciculture</h3>
            <p>
              Développement de la production
              et de la commercialisation.
            </p>
          </div>

          <div className="domain-card">
            <span>🧺</span>
            <h3>Artisanat</h3>
            <p>
              Valorisation de la vannerie
              et des savoir-faire locaux.
            </p>
          </div>
        </div>
      </section>

      {/* ACTUALITES */}
      <section className="home-section">
        <div className="section-heading">
          <span>Actualités</span>
          <h2>Les dernières nouvelles</h2>
        </div>

        {erreur && (
          <p className="empty-message">
            {erreur}
          </p>
        )}

        <div className="content-grid">
          {chargement ? (
            <p className="empty-message">
              Chargement des actualités...
            </p>
          ) : actualites.length > 0 ? (
            actualites.map((actu) => (
              <article
                className="content-card"
                key={actu.id}
              >
                {actu.image && (
                  <img
                    src={`${API_URL}/uploads/${actu.image}`}
                    alt={actu.titre}
                    loading="lazy"
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
            <p className="empty-message">
              Aucune actualité disponible.
            </p>
          )}
        </div>

        <div className="section-action">
          <Link
            to="/actualites"
            className="outline-btn"
          >
            Voir toutes les actualités
          </Link>
        </div>
      </section>

      {/* PROJETS */}
      <section className="home-section projects-section">
        <div className="section-heading">
          <span>Nos projets</span>
          <h2>
            Des actions concrètes pour le développement
          </h2>
        </div>

        <div className="content-grid">
          {chargement ? (
            <p className="empty-message">
              Chargement des projets...
            </p>
          ) : projets.length > 0 ? (
            projets.map((projet) => (
              <article
                className="content-card"
                key={projet.id}
              >
                {projet.image && (
                  <img
                    src={`${API_URL}/uploads/${projet.image}`}
                    alt={projet.titre}
                    loading="lazy"
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
            <p className="empty-message">
              Aucun projet disponible.
            </p>
          )}
        </div>

        <div className="section-action">
          <Link
            to="/projets"
            className="outline-btn"
          >
            Voir tous les projets
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section className="home-cta">
        <div>
          <span>
            Vous souhaitez collaborer avec le VFTM ?
          </span>

          <h2>
            Construisons ensemble un
            développement rural durable.
          </h2>
        </div>

        <Link
          to="/contact"
          className="cta-btn"
        >
          Contactez-nous
        </Link>
      </section>

    </main>
  );
}

export default Home;
