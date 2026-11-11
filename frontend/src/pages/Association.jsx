import API_URL from '../services/api';

import { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Handshake,
} from "lucide-react";

import "./Association.css";



// Filières du VFTM
const filieres = [
  { nom: "Riz", organisation: "CRAM" },
  { nom: "Lait", organisation: "Union Coop ROFAMA" },
  { nom: "Apiculture", organisation: "SOATANTELY" },
  { nom: "Viticulture", organisation: "FFMV" },
  {
    nom: "Pisciculture",
    organisation:
      "APPAFI, FITARIKANDRO, VONISAHI, Union Coop MVPT",
  },
  { nom: "Huiles essentielles", organisation: "EMA" },
  { nom: "Vannerie", organisation: "FVM" },
  {
    nom: "Culture maraîchère",
    organisation: "FKH Ambatovaky, FTMT",
  },
];

// Activités économiques
const domaines = [
  {
    nom: "Pomme de terre",
    description:
      "Production de semences Meva, formation des producteurs, équipements et développement des marchés.",
  },
  {
    nom: "Service transport",
    description:
      "Transport des produits agricoles des zones rurales vers les marchés et recherche de débouchés.",
  },
  {
    nom: "Pépinière",
    description:
      "Production de jeunes plants greffés d'orangers et de mandariniers.",
  },
  {
    nom: "CTC Anjoma",
    description:
      "Distribution de produits agricoles, collecte et commercialisation des produits locaux.",
  },
  {
    nom: "Cantines scolaires",
    description:
      "Approvisionnement des cantines scolaires en produits agricoles, en collaboration avec Feedback Madagascar.",
  },
  {
    nom: "Projet Vigne",
    description:
      "Développement de la production viticole et transformation du vin en Haute Matsiatra.",
  },
];

const menus = [
  { id: "presentation", label: "Présentation", icon: "📌" },
  { id: "organisation", label: "Organisation", icon: "🏢" },
  { id: "missions", label: "Missions & objectifs", icon: "🎯" },
  {
    id: "domaines",
    label: "Domaines d'intervention",
    icon: "🌱",
  },
  { id: "valeurs", label: "Notre vision", icon: "👁️" },
  { id: "partenaires", label: "Nos Partenaires", icon: "🤝" },
];

function Association() {
  const [activeSection, setActiveSection] =
    useState("presentation");

  const [partenaires, setPartenaires] = useState([]);
  const [loadingPartenaires, setLoadingPartenaires] =
    useState(false);
  const [errorPartenaires, setErrorPartenaires] =
    useState("");

  // Charger les partenaires depuis Flask
  useEffect(() => {
    if (activeSection !== "partenaires") return;

    const controller = new AbortController();

    const chargerPartenaires = async () => {
      setLoadingPartenaires(true);
      setErrorPartenaires("");

      try {
        const response = await fetch(
          `${API_URL}/partenaires`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Erreur de chargement");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Format des données invalide");
        }

        setPartenaires(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Erreur partenaires :", error);
          setErrorPartenaires(
            "Impossible de charger les partenaires."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingPartenaires(false);
        }
      }
    };

    chargerPartenaires();

    return () => controller.abort();
  }, [activeSection]);

  // Contenus des sections
  const sections = {
    presentation: {
      title: "Présentation du VFTM",
      content: (
        <>
          <p>
            Le <strong>VFTM</strong> (Vondrona
            Fampandrosoana ny Tantsaha Matsiatra Ambony),
            ou <strong>Groupement pour le développement
            des paysans de la Haute Matsiatra</strong>,
            est une organisation paysanne engagée
            dans le développement agricole à Madagascar.
          </p>

          <p>
            Créé le <strong>26 février 2006</strong> à
            Anjoma, Fianarantsoa, le VFTM défend les
            intérêts communs des agriculteurs membres
            et favorise la concertation entre producteurs.
          </p>

          <p>
            Depuis sa création, l'organisation a élargi
            ses activités à la production de semences,
            à l'accompagnement des producteurs et à
            la valorisation des filières agricoles.
          </p>

          <p>
            En <strong>2026</strong>, le VFTM célèbre
            ses <strong>20 ans d'engagement</strong>
            au service des agriculteurs de la Haute Matsiatra.
          </p>

          <p className="motto">
            « Tantsaha mivoatsa ro fitaratsa »
          </p>
        </>
      ),
    },

    organisation: {
      title: "Organisation du VFTM",
      content: (
        <>
          <p>
            Le VFTM regroupe des organisations
            professionnelles agricoles qui travaillent
            ensemble pour renforcer les capacités
            et les activités économiques des producteurs.
          </p>

          <div className="vftm-stats">
            <div className="vftm-stat">
              <strong>15</strong>
              <span>Organisations professionnelles</span>
            </div>

            <div className="vftm-stat">
              <strong>3 500</strong>
              <span>Exploitations familiales</span>
            </div>

            <div className="vftm-stat">
              <strong>8</strong>
              <span>Filières présentées</span>
            </div>
          </div>

          <p>
            Des élus et une équipe technique participent
            au pilotage et à l'accompagnement des
            organisations membres.
          </p>

          <h3>Les filières agricoles du VFTM</h3>

          <div className="vftm-table-wrapper">
            <table className="vftm-modern-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Filière agricole</th>
                  <th>Organisation professionnelle</th>
                </tr>
              </thead>

              <tbody>
                {filieres.map((filiere, index) => (
                  <tr key={filiere.nom}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{filiere.nom}</strong>
                    </td>
                    <td>{filiere.organisation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ),
    },

    missions: {
      title: "Missions et objectifs",
      content: (
        <>
          <p>
            Le VFTM a pour mission de défendre les
            intérêts communs des agriculteurs et de
            contribuer au développement durable des
            exploitations agricoles familiales.
          </p>

          <ul>
            <li>
              Défendre les intérêts des producteurs
              et renforcer leur représentation.
            </li>
            <li>
              Favoriser la concertation entre
              les organisations paysannes.
            </li>
            <li>
              Accompagner la production agricole
              et améliorer la qualité des semences.
            </li>
            <li>
              Renforcer les capacités techniques
              et économiques des producteurs.
            </li>
            <li>
              Développer les filières agricoles
              et faciliter l'accès aux marchés.
            </li>
            <li>
              Développer des ressources propres
              pour assurer l'autonomie du VFTM.
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
            Le VFTM développe plusieurs activités
            économiques pour accompagner les producteurs,
            valoriser les produits agricoles et
            renforcer son autonomie.
          </p>

          <div className="vftm-table-wrapper">
            <table className="vftm-modern-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Domaine d'intervention</th>
                  <th>Activités principales</th>
                </tr>
              </thead>

              <tbody>
                {domaines.map((domaine, index) => (
                  <tr key={domaine.nom}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{domaine.nom}</strong>
                    </td>
                    <td>{domaine.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ),
    },

    valeurs: {
      title: "Notre vision",
      content: (
        <>
          <h3>Un VFTM économiquement fort</h3>

          <p>
            La vision du VFTM est de devenir une
            organisation économiquement forte,
            capable de financer progressivement
            ses activités et de poursuivre son
            accompagnement des producteurs.
          </p>

          <p>
            Cette orientation repose sur le
            développement d'activités économiques,
            la génération de revenus propres et
            la constitution de réserves financières.
          </p>

          <div className="vftm-vision-flow">
            Activité → Revenus → Réserve → Autonomie → Pérennité
          </div>

          <p>
            Le VFTM souhaite ainsi renforcer son
            autonomie et assurer la continuité de
            ses actions au service des paysans.
          </p>
        </>
      ),
    },

    partenaires: {
      title: "Nos Partenaires",
      content: (
        <>
          <p>
            Le VFTM collabore avec différents
            partenaires techniques, financiers
            et institutionnels pour accompagner
            les producteurs et développer les
            activités agricoles.
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
                <Handshake size={30} />
                <p>
                  Aucun partenaire enregistré
                  pour le moment.
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
                    <div className="partenaire-logo">
                      {partenaire.logo ? (
                        <img
                          src={`${API_URL}/uploads/${partenaire.logo}`}
                          alt={`Logo de ${partenaire.nom}`}
                        />
                      ) : (
                        <div className="no-logo">
                          <Handshake size={32} />
                        </div>
                      )}
                    </div>

                    <div className="partenaire-info">
                      <h3>{partenaire.nom}</h3>

                      {partenaire.description && (
                        <p>{partenaire.description}</p>
                      )}

                      {partenaire.site_web &&
                        /^(https?:\/\/)?[^\s/]+\.[^\s]+$/i.test(
                          partenaire.site_web
                        ) && (
                          <a
                            href={
                              /^https?:\/\//i.test(
                                partenaire.site_web
                              )
                                ? partenaire.site_web
                                : `https://${partenaire.site_web}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="partenaire-link"
                          >
                            <ExternalLink size={16} />
                            Visiter le site
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
      {/* HEADER */}
      <section className="association-header">
        <div>
          <span className="association-label">
            À PROPOS DE NOUS
          </span>

          <h1>Notre Association</h1>

          <p>
            <strong>VFTM</strong> — Vondrona
            Fampandrosoana ny Tantsaha Matsiatra Ambony
          </p>

          <p className="subtitle">
            Groupement pour le développement
            des paysans de la Haute Matsiatra
          </p>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="association-container">
        <div className="association-buttons">
          {menus.map((menu) => (
            <button
              key={menu.id}
              type="button"
              className={
                activeSection === menu.id ? "active" : ""
              }
              onClick={() => setActiveSection(menu.id)}
            >
              {menu.icon} {menu.label}
            </button>
          ))}
        </div>

        <div className="association-content">
          <h2>{sections[activeSection].title}</h2>

          <div className="content-text">
            {sections[activeSection].content}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="association-contact">
        <h2>Nous contacter</h2>

        <p>
          <MapPin size={18} />
          Près IE Anjoma, Fianarantsoa, Madagascar
        </p>

        <p>
          <Phone size={18} />
          <a href="tel:+261348684171">
            034 86 841 71
          </a>
        </p>

        <p>
          <Mail size={18} />
          <a href="mailto:asvftm@gmail.com">
            asvftm@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}

export default Association;
