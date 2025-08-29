// src/components/Features/BackgroundScene.jsx
import React, { useEffect, useState } from "react";
import "./BackgroundScene.css";
import yardDay from "../../assets/backgrounds/yard_day.jpg"; // use .jpg like we set up earlier

export default function BackgroundScene({
  // Optional overrides
  mode = "auto", // "auto" | "day" | "night"
  updateEveryMs = 60_000, // re-check time each minute
}) {
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    if (mode !== "auto") return; // manual override
    const compute = () => {
      const hour = new Date().getHours();
      setIsDay(hour >= 6 && hour < 18); // 6am–6pm = day
    };
    compute();
    const t = setInterval(compute, updateEveryMs);
    return () => clearInterval(t);
  }, [mode, updateEveryMs]);

  const day = mode === "day" || (mode === "auto" && isDay);
  // We only import one image (yard_day.jpg).
  // At night we "recolor" it with filters + overlay to fake nighttime.
  const imgStyle = {
    backgroundImage: `url(${yardDay})`,
    filter: day ? "none" : "brightness(0.55) saturate(0.9) hue-rotate(-12deg)",
  };

  return (
    <div className="bg-root">
      <div className="bg-image" style={imgStyle} />
      <div className={`bg-overlay ${day ? "day" : "night"}`} />
    </div>
  );
}
