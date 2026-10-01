import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./AjouterActualite.css";

function ModifierActualite() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [ancienneImage, setAncienneImage] = useState("");
  const [nouvelleImage, setNouvelleImage] = useState(null);

  useEffect(() => {
    chargerActualite();
  }, [id]);

  const chargerActualite = async () => {
    try {
      const response = await fetch(
        `https://vftm.onrender.com/actualites/${id}`
      );

      if (!response.ok) {
        throw new Error("Actualité introuvable");
      }

      const data = await response.json();

      setTitre(data.titre);
      setDescription(data.description);
      setDate(data.date);
      setAncienneImage(data.image || "");

    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  const modifierActualite = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("titre", titre);
      formData.append("description", description);
      formData.append("date", date);

      // Raha misy image vaovao
      if (nouvelleImage) {
        formData.append("image", nouvelleImage);
      }

      // Raha tsy misy image vaovao,
      // alefa ny anaran'ilay ancienne image
      else {
        formData.append("ancienne_image", ancienneImage);
      }

      const response = await fetch(
        `https://vftm.onrender.com/actualites/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la modification");
      }

      alert("Actualité modifiée avec succès !");

      navigate("/admin/actualites");

    } catch (error) {
      console.error("Erreur :", error);
      alert("Erreur lors de la modification.");
    }
  };

  return (
    <div className="add-page">

      <h1>Modifier une Actualité</h1>

      <form
        className="add-form"
        onSubmit={modifierActualite}
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
              src={`https://vftm.onrender.com/uploads/${ancienneImage}`}
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
              navigate("/admin/actualites")
            }
          >
            Annuler
          </button>

        </div>

      </form>

    </div>
  );
}

export default ModifierActualite;
