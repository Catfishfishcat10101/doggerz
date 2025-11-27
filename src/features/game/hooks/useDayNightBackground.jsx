import { useMemo, useState, useEffect } from "react";
import { getTimeOfDay } from "@/utils/weather.js";

export default function useDayNightBackground({ zip } = {}) {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());

  useEffect(() => {
    const id = setInterval(() => setTimeOfDay(getTimeOfDay()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const style = useMemo(() => {
    // Prefer a photo background (backyard) when available, falling back
    // to subtle gradients. Use local assets bundled in `src/assets/backgrounds`.
    try {
      const day = new URL(
        "../../../assets/backgrounds/backyard-day.png",
        import.meta.url,
      ).href;
      const night = new URL(
        "../../../assets/backgrounds/backyard-night.png",
        import.meta.url,
      ).href;

      switch (timeOfDay) {
        case "dawn":
        case "morning":
        case "afternoon":
          return {
            backgroundImage: `url(${day})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          };
        case "dusk":
        case "evening":
        case "night":
        default:
          return {
            backgroundImage: `url(${night})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          };
      }
    } catch (e) {
      // fallback gradient
      return {
        backgroundImage: "linear-gradient(180deg, #020617 0%, #000000 100%)",
        backgroundSize: "cover",
      };
    }
  }, [timeOfDay, zip]);

  return { style, timeOfDay };
}
