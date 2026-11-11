import API_URL from './services/api';

import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages publiques
import Home from "./pages/Home";
import Actualites from "./pages/Actualites";
import Projets from "./pages/Projets";
import DetailProjet from "./pages/DetailProjet";
import Association from "./pages/Association";
import Contact from "./pages/Contact";
import Login from "./pages/Login";

// Dashboard
import Admin from "./pages/Admin";

// Actualités
import AdminActualites from "./pages/AdminActualites";
import AjouterActualite from "./pages/AjouterActualite";
import ModifierActualite from "./pages/ModifierActualite";

// Projets
import AdminProjets from "./pages/AdminProjets";
import AjouterProjet from "./pages/AjouterProjet";
import ModifierProjet from "./pages/ModifierProjet";

// Messages
import AdminMessages from "./pages/AdminMessages";

// Partenaires
import AdminPartenaires from "./pages/AdminPartenaires";
import AjouterPartenaire from "./pages/AjouterPartenaire";
import ModifierPartenaire from "./pages/ModifierPartenaire";


// ======================================
// CONFIGURATION API
// ======================================




// ======================================
// PROTECTION DES ROUTES ADMIN
// ======================================

function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] =
    useState(null);

  useEffect(() => {
    let active = true;

    const verifierSession = async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/check`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (active) {
          setAuthenticated(response.ok);
        }

      } catch (error) {
        console.error(
          "Erreur vérification session :",
          error
        );

        if (active) {
          setAuthenticated(false);
        }
      }
    };

    verifierSession();

    return () => {
      active = false;
    };
  }, []);

  // Vérification en cours
  if (authenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "18px",
        }}
      >
        Vérification de la session...
      </div>
    );
  }

  // Session invalide
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Session valide
  return children;
}


// ======================================
// APPLICATION
// ======================================

function App() {
  const location = useLocation();

  // Masquer Navbar et Footer dans Login + Admin
  const hideLayout =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>

        {/* =========================
            PAGES PUBLIQUES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/actualites"
          element={<Actualites />}
        />

        <Route
          path="/projets"
          element={<Projets />}
        />

        <Route
          path="/projets/:id"
          element={<DetailProjet />}
        />

        <Route
          path="/association"
          element={<Association />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />


        {/* =========================
            CONNEXION
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =========================
            DASHBOARD ADMIN
        ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />


        {/* =========================
            ACTUALITÉS ADMIN
        ========================= */}

        <Route
          path="/admin/actualites"
          element={
            <ProtectedRoute>
              <AdminActualites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/actualites/ajouter"
          element={
            <ProtectedRoute>
              <AjouterActualite />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/actualites/modifier/:id"
          element={
            <ProtectedRoute>
              <ModifierActualite />
            </ProtectedRoute>
          }
        />


        {/* =========================
            PROJETS ADMIN
        ========================= */}

        <Route
          path="/admin/projets"
          element={
            <ProtectedRoute>
              <AdminProjets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/projets/ajouter"
          element={
            <ProtectedRoute>
              <AjouterProjet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/projets/modifier/:id"
          element={
            <ProtectedRoute>
              <ModifierProjet />
            </ProtectedRoute>
          }
        />


        {/* =========================
            MESSAGES ADMIN
        ========================= */}

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute>
              <AdminMessages />
            </ProtectedRoute>
          }
        />


        {/* =========================
            PARTENAIRES ADMIN
        ========================= */}

        <Route
          path="/admin/partenaires"
          element={
            <ProtectedRoute>
              <AdminPartenaires />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/partenaires/ajouter"
          element={
            <ProtectedRoute>
              <AjouterPartenaire />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/partenaires/modifier/:id"
          element={
            <ProtectedRoute>
              <ModifierPartenaire />
            </ProtectedRoute>
          }
        />

      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default App;
