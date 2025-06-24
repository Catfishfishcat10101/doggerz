// src/components/Features/BackgroundScene.jsx
import React from "react";
import yardDay from "../../../assets/backgrounds/yard_day.png";

const BackgroundScene = ({ children }) => {
  return (
    <div
      className="w-screen h-screen bg-cover bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: `url(${yardDay})`,
      }}
    >
      {children}
    </div>
  );
};

export default BackgroundScene;