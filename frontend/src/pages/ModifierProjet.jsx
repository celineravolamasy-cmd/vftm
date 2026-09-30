import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./AjouterActualite.css";

function ModifierProjet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [objectifs, setObjectifs] = useState("");
  const [beneficiaires, setBeneficiaires] = useState("");
  const [zoneIntervention, setZoneIntervention] = useState("");
  const [partenaires, setPartenaires] = useState("");
  const [date, setDate] = useState("");

  const [ancienneImage, setAncienneImage] = useState("");
  const [nouvelleImage, setNouvelleImage] = useState(null);

  useEffect(() => {
    chargerProjet();
  }, [id]);

  const chargerProjet = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/projets/${id}`
      );

      if (!response.ok) {
        throw new Error("Projet introuvable");
      }

      const data = await response.json();

      setTitre(data.titre || "");
      setDescription(data.description || "");
      setObjectifs(data.objectifs || "");
      setBeneficiaires(data.beneficiaires || "");
      setZoneIntervention(data.zone_intervention || "");
      setPartenaires(data.partenaires || "");
      setDate(data.date || "");
      setAncienneImage(data.image || "");
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  const modifierProjet = async (e) => {
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

      if (nouvelleImage) {
        formData.append("image", nouvelleImage);
      } else {
        formData.append("ancienne_image", ancienneImage);
      }

      const response = await fetch(
        `http://127.0.0.1:5000/projets/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la modification");
      }

      alert("Projet modifié avec succès !");

      navigate("/admin/projets");
    } catch (error) {
      console.error("Erreur :", error);

      alert("Erreur lors de la modification.");
    }
  };

  return (
    <div className="add-page">
      <h1>Modifier un Projet</h1>

      <form
        className="add-form"
        onSubmit={modifierProjet}
      >
        <label>Titre</label>

        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        <label>Description</label>

        <textarea
          rows="6"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>

        <label>Objectifs du projet</label>

        <textarea
          rows="5"
          placeholder="Entrer les objectifs du projet"
          value={objectifs}
          onChange={(e) => setObjectifs(e.target.value)}
          required
        ></textarea>

        <label>Bénéficiaires</label>

        <textarea
          rows="5"
          placeholder="Entrer les bénéficiaires du projet"
          value={beneficiaires}
          onChange={(e) => setBeneficiaires(e.target.value)}
          required
        ></textarea>

        <label>Zone d'intervention</label>

        <input
          type="text"
          placeholder="Exemple : Haute Matsiatra"
          value={zoneIntervention}
          onChange={(e) => setZoneIntervention(e.target.value)}
          required
        />

        <label>Partenaires du projet</label>

        <input
          type="text"
          placeholder="Entrer les partenaires du projet"
          value={partenaires}
          onChange={(e) => setPartenaires(e.target.value)}
        />

        <label>Date</label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label>Image actuelle</label>

        {ancienneImage && (
          <div style={{ marginBottom: "15px" }}>
            <img
              src={`http://127.0.0.1:5000/uploads/${ancienneImage}`}
              alt="Image actuelle"
              style={{
                width: "200px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        )}

        <label>Nouvelle image</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNouvelleImage(e.target.files[0])
          }
        />

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

export default ModifierProjet;