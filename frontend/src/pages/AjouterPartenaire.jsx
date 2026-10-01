import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AjouterActualite.css";

function AjouterPartenaire() {

  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [logo, setLogo] = useState(null);


  // ==========================
  // Ajouter le partenaire
  // ==========================

  const handleSubmit = async (e) => {

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
        "https://vftm.onrender.com/partenaires",
        {
          method: "POST",
          body: formData
        }
      );


      const data = await response.json();


      if (response.ok) {

        alert("Partenaire ajouté avec succès !");

        navigate("/admin/partenaires");

      } else {

        alert(
          data.message || "Erreur lors de l'ajout."
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

      <h1>Ajouter un Partenaire</h1>


      <form
        className="add-form"
        onSubmit={handleSubmit}
      >

        {/* Nom */}

        <label>
          Nom du partenaire
        </label>

        <input
          type="text"
          placeholder="Entrer le nom du partenaire"
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
          placeholder="Entrer une description (facultatif)"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        ></textarea>


        {/* Logo */}

        <label>
          Logo
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
            Enregistrer
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

export default AjouterPartenaire;
