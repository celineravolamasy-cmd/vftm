import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AjouterProjet() {
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [objectifs, setObjectifs] = useState("");
  const [beneficiaires, setBeneficiaires] = useState("");
  const [zoneIntervention, setZoneIntervention] = useState("");
  const [partenaires, setPartenaires] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("titre", titre);
      formData.append("description", description);
      formData.append("objectifs", objectifs);
      formData.append("beneficiaires", beneficiaires);
      formData.append("zone_intervention", zoneIntervention);
      formData.append("partenaires", partenaires);
      formData.append("date", date);

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        "http://127.0.0.1:5000/projets",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout");
      }

      alert("Projet ajouté avec succès !");

      navigate("/admin/projets");

    } catch (error) {
      console.error("Erreur :", error);
      alert("Erreur lors de l'ajout du projet.");
    }
  };

  return (
    <div className="add-page">

      <h1>Ajouter un Projet</h1>

      <form
        className="add-form"
        onSubmit={handleSubmit}
      >

        {/* TITRE */}
        <label>Titre</label>

        <input
          type="text"
          placeholder="Entrer le titre du projet"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />


        {/* DESCRIPTION */}
        <label>Description</label>

        <textarea
          rows="6"
          placeholder="Entrer la description du projet"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>


        {/* OBJECTIFS */}
        <label>Objectifs du projet</label>

        <textarea
          rows="5"
          placeholder="Entrer les objectifs du projet"
          value={objectifs}
          onChange={(e) => setObjectifs(e.target.value)}
          required
        ></textarea>


        {/* BENEFICIAIRES */}
        <label>Bénéficiaires</label>

        <textarea
          rows="5"
          placeholder="Entrer les bénéficiaires du projet"
          value={beneficiaires}
          onChange={(e) => setBeneficiaires(e.target.value)}
          required
        ></textarea>


        {/* ZONE */}
        <label>Zone d'intervention</label>

        <input
          type="text"
          placeholder="Exemple : Haute Matsiatra"
          value={zoneIntervention}
          onChange={(e) =>
            setZoneIntervention(e.target.value)
          }
          required
        />


        {/* PARTENAIRES */}
        <label>Partenaires du projet</label>

        <input
          type="text"
          placeholder="Entrer les partenaires du projet"
          value={partenaires}
          onChange={(e) =>
            setPartenaires(e.target.value)
          }
        />


        {/* DATE */}
        <label>Date</label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />


        {/* IMAGE */}
        <label>Image</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(e.target.files[0])
          }
        />


        {/* BOUTONS */}
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
              navigate("/admin/projets")
            }
          >
            Annuler
          </button>

        </div>

      </form>

    </div>
  );
}

export default AjouterProjet;