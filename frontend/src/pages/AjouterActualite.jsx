import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AjouterActualite.css";

function AjouterActualite() {
  const navigate = useNavigate();

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("titre", titre);
      formData.append("description", description);
      formData.append("date", date);

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        "http://127.0.0.1:5000/actualites",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout");
      }

      alert("Actualité ajoutée avec succès !");

      navigate("/admin/actualites");

    } catch (error) {
      console.error("Erreur :", error);
      alert("Erreur lors de l'ajout de l'actualité.");
    }
  };

  return (
    <div className="add-page">

      <h1>Ajouter une Actualité</h1>

      <form
        className="add-form"
        onSubmit={handleSubmit}
      >

        <label>Titre</label>

        <input
          type="text"
          placeholder="Entrer le titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />

        <label>Description</label>

        <textarea
          rows="6"
          placeholder="Entrer la description"
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

        <label>Image</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

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
            onClick={() => navigate("/admin/actualites")}
          >
            Annuler
          </button>

        </div>

      </form>

    </div>
  );
}

export default AjouterActualite;