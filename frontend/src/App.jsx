import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminActualites from "./pages/AdminActualites";
import AjouterActualite from "./pages/AjouterActualite";
import ModifierActualite from "./pages/ModifierActualite";
import AjouterProjet from "./pages/AjouterProjet";
import AdminProjets from "./pages/AdminProjets";
import ModifierProjet from "./pages/ModifierProjet";
import Home from "./pages/Home";
import Actualites from "./pages/Actualites";
import Projets from "./pages/Projets";
import DetailProjet from "./pages/DetailProjet";
import Association from "./pages/Association";
import Contact from "./pages/Contact";
import AdminMessages from "./pages/AdminMessages";
import AdminPartenaires from "./pages/AdminPartenaires";
import AjouterPartenaire from "./pages/AjouterPartenaire";
import ModifierPartenaire from "./pages/ModifierPartenaire";

function App() {
  const location = useLocation();

  // Tsy aseho ny Navbar sy Footer amin'ny Login sy Admin
  const hideLayout =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route
        path="/admin/actualites"
        element={<AdminActualites />}
        />
        <Route
        path="/admin/actualites/ajouter"
        element={<AjouterActualite />}
        />
        <Route
        path="/admin/actualites/modifier/:id"
        element={<ModifierActualite />}
        />
        <Route
        path="/admin/projets/ajouter"
        element={<AjouterProjet />}
        />
        <Route
        path="/admin/projets/modifier/:id"
        element={<ModifierProjet />}
       />
        <Route
        path="/admin/projets"
        element={<AdminProjets />}
        />
        <Route
        path="/admin/messages"
        element={<AdminMessages />}
       />
       <Route
        path="/admin/partenaires"
        element={<AdminPartenaires />}
        />
        <Route
  path="/admin/partenaires/ajouter"
  element={<AjouterPartenaire />}
/>

<Route
  path="/admin/partenaires/modifier/:id"
  element={<ModifierPartenaire />}
/>

        <Route path="/actualites" element={<Actualites />} />
        <Route path="/projets" element={<Projets />} />
        <Route path="/projets/:id" element={<DetailProjet />} />
        <Route path="/association" element={<Association />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default App;