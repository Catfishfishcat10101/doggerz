/** @format */

// src/components/YardBackground.jsx
import * as React from "react";

const DAY_URL = "/backgrounds/backyard-day-wide.webp";
const NIGHT_URL = "/backgrounds/backyard-night-wide.webp";

/**
 * Full-bleed yard background.
 * - If `isNight` is not provided, it falls back to local time (good for wiring verification).
 */
export default function YardBackground({ isNight }) {
  const derivedNight = React.useMemo(() => {
    if (typeof isNight === "boolean") return isNight;
    const h = new Date().getHours();
    return h < 6 || h >= 19;
  }, [isNight]);

  const url = derivedNight ? NIGHT_URL : DAY_URL;

  return (
    <div className="absolute inset-0 -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${url})` }}
      />
      {/* readability + low-glare overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />
    </div>
  );
}
