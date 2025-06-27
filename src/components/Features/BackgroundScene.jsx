// src/components/Features/BackgroundScene.jsx
import React, {useEffect, useState } from "react";
const yardDay = process.env.PUBLIC_URL + "/backgrounds/yard_day.png";
const yardNight = process.env.PUBLIC_URL + "/backgrounds/yard_night.png";
 
const BackgroundScene = () => {
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18); // Daytime is between 6 AM and 6 PM
  }, []);

  return (
    <div
      className={`absolute inset-0 z-0 transition-all duration-1000 ${isDay ? "bg-gradient-to-b from-sky-300 to-lime-200":"bg-gradient-to-b from-gray-900 to-blue-900"
      }`}
      >
      </div>
  );
};

export default BackgroundScene;