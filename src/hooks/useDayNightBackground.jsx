// src/hooks/useDayNightBackground.jsx
import { useEffect, useState } from "react";

/**
 * Very simple day/night helper:
 * - day: 06:00–17:59
 * - night: 18:00–05:59
 */
export default function useDayNightBackground(zipCode = "00000") {
  const [timeOfDay, setTimeOfDay] = useState("day");

  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours(); // local time
      setTimeOfDay(hour >= 18 || hour < 6 ? "night" : "day");
    };

    update();
    const id = setInterval(update, 60_000); // refresh once a minute
    return () => clearInterval(id);
  }, [zipCode]);

  return { timeOfDay };
}
