import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { ActualiteProvider } from "./context/ActualiteContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ActualiteProvider>
        <App />
      </ActualiteProvider>
    </BrowserRouter>
  </React.StrictMode>
);