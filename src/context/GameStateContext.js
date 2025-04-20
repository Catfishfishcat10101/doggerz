import React, { createContext, useState, useContext } from "react";

const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {
  const [toyList, setToyList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <GameStateContext.Provider value={{ toyList, setToyList, modalOpen, setModalOpen }}>
      {children}
    </GameStateContext.Provider>
  );
};

// Custom hook
export const useGameState = () => useContext(GameStateContext);
