import { useEffect, useState } from "react";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

import "./Admin.css";

function AdminMessages() {

  const [messages, setMessages] = useState([]);

  // ==========================
  // Charger les messages
  // ==========================

  useEffect(() => {
    chargerMessages();
  }, []);

  const chargerMessages = async () => {

    try {

      const response = await fetch(
        "https://vftm.onrender.com/messages"
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors du chargement des messages"
        );
      }

      const data = await response.json();

      setMessages(data);

    } catch (error) {

      console.error("Erreur :", error);

    }

  };


  // ==========================
  // Supprimer un message
  // ==========================

  const supprimerMessage = async (id) => {

    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce message ?"
    );

    if (!confirmation) {
      return;
    }

    try {

      const response = await fetch(
        `https://vftm.onrender.com/messages/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {

        throw new Error(
          "Erreur lors de la suppression"
        );

      }

      alert("Message supprimé avec succès !");

      // Recharger la liste
      chargerMessages();

    } catch (error) {

      console.error("Erreur :", error);

      alert(
        "Impossible de supprimer le message."
      );

    }

  };


  // ==========================
  // Affichage
  // ==========================

  return (

    <div className="admin-page">

      {/* Sidebar */}

      <AdminSidebar />


      {/* Contenu principal */}

      <div className="admin-content">

        <AdminHeader />


        <h1 className="admin-title">
          Gestion des Messages
        </h1>


        <div className="activity">

          <h2>Messages reçus</h2>


          <table className="admin-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Nom</th>

                <th>Email</th>

                <th>Sujet</th>

                <th>Message</th>

                <th>Date</th>

                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {messages.length === 0 ? (

                <tr>

                  <td colSpan="7">

                    Aucun message pour le moment.

                  </td>

                </tr>

              ) : (

                messages.map((msg) => (

                  <tr key={msg.id}>

                    <td>
                      {msg.id}
                    </td>


                    <td>
                      {msg.nom}
                    </td>


                    <td>
                      {msg.email}
                    </td>


                    <td>
                      {msg.sujet}
                    </td>


                    <td>
                      {msg.message}
                    </td>


                    <td>
                      {msg.date}
                    </td>


                    <td>

                      <button
                        className="btn-delete"
                        onClick={() =>
                          supprimerMessage(msg.id)
                        }
                      >
                        Supprimer
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}

export default AdminMessages;
