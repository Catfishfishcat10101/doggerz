// src/components/Features/BackgroundScene.jsx
import React, { Children } from "react";
import yardDay from "../../assets/backgrounds/yard_day.png";
import yardNight from "../../assets/backgrounds/yard_night.png";

const BackgroundScene = ({ isNight = false, Children }) => {
  const bg = isNight ? yardNight : yardDay;

  return (
    <div
      className="w-screen h-screen bg-cover bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: `URL(${bg})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {children}
    </div>
  );
};

export default BackgroundScene;