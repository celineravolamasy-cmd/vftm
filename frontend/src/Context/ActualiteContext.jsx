import { createContext, useState } from "react";

export const ActualiteContext = createContext();

export function ActualiteProvider({ children }) {
  const [actualites, setActualites] = useState([
    {
      id: 1,
      titre: "Formation Agricole",
      date: "15/07/2026",
    },
    {
      id: 2,
      titre: "Projet Riziculture",
      date: "20/07/2026",
    },
  ]);

  return (
    <ActualiteContext.Provider
      value={{
        actualites,
        setActualites,
      }}
    >
      {children}
    </ActualiteContext.Provider>
  );
}
