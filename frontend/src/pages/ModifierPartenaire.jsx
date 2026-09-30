import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./AjouterActualite.css";

function ModifierPartenaire() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [logo, setLogo] = useState(null);
  const [ancienLogo, setAncienLogo] = useState("");


  // ==========================
  // Charger le partenaire
  // ==========================

  useEffect(() => {

    chargerPartenaire();

  }, [id]);


  const chargerPartenaire = async () => {

    try {

      const response = await fetch(
        `http://127.0.0.1:5000/partenaires/${id}`
      );

      if (!response.ok) {

        throw new Error(
          "Partenaire introuvable"
        );

      }

      const data = await response.json();

      setNom(data.nom || "");
      setDescription(data.description || "");
      setSiteWeb(data.site_web || "");
      setAncienLogo(data.logo || "");

    } catch (error) {

      console.error("Erreur :", error);

    }

  };


  // ==========================
  // Modifier le partenaire
  // ==========================

  const modifierPartenaire = async (e) => {

    e.preventDefault();

    const formData = new FormData();

    formData.append("nom", nom);
    formData.append("description", description);
    formData.append("site_web", siteWeb);

    if (logo) {

      formData.append("logo", logo);

    }


    try {

      const response = await fetch(
        `http://127.0.0.1:5000/partenaires/${id}`,
        {
          method: "PUT",
          body: formData
        }
      );

      const data = await response.json();


      if (response.ok) {

        alert(
          "Partenaire modifié avec succès !"
        );

        navigate("/admin/partenaires");

      } else {

        alert(
          data.message ||
          "Erreur lors de la modification."
        );

      }

    } catch (error) {

      console.error("Erreur :", error);

      alert(
        "Impossible de contacter le serveur."
      );

    }

  };


  return (

    <div className="add-page">

      <h1>
        Modifier un Partenaire
      </h1>


      <form
        className="add-form"
        onSubmit={modifierPartenaire}
      >

        {/* Nom */}

        <label>
          Nom du partenaire
        </label>

        <input
          type="text"
          value={nom}
          onChange={(e) =>
            setNom(e.target.value)
          }
          required
        />


        {/* Description */}

        <label>
          Description
        </label>

        <textarea
          rows="5"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        ></textarea>


        {/* Ancien logo */}

        {ancienLogo && (

          <div>

            <label>
              Logo actuel
            </label>

            <br />

            <img
              src={`http://127.0.0.1:5000/uploads/${ancienLogo}`}
              alt={nom}
              style={{
                width: "120px",
                height: "90px",
                objectFit: "contain",
                marginBottom: "15px"
              }}
            />

          </div>

        )}


        {/* Nouveau logo */}

        <label>
          Nouveau logo
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setLogo(e.target.files[0])
          }
        />


        {/* Site web */}

        <label>
          Site web
        </label>

        <input
          type="url"
          placeholder="https://exemple.com (facultatif)"
          value={siteWeb}
          onChange={(e) =>
            setSiteWeb(e.target.value)
          }
        />


        {/* Boutons */}

        <div className="buttons">

          <button
            type="submit"
            className="btn-save"
          >
            Modifier
          </button>


          <button
            type="button"
            className="btn-cancel"
            onClick={() =>
              navigate("/admin/partenaires")
            }
          >
            Annuler
          </button>

        </div>

      </form>

    </div>

  );

}

export default ModifierPartenaire;