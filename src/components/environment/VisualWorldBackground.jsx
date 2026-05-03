import { useSelector } from "react-redux";
import { useDayNightBackground } from "@/hooks/environment/useDayNightBackground.js";
import {
  selectWeatherCondition,
  selectWeatherIntensity,
} from "@/store/weatherSlice.js";
import { selectUserZip } from "@/store/userSlice.js";
import WeatherFXCanvas from "./WeatherFX.jsx";

/**
 * A global background component that provides a unified "visual world"
 * across all screens. It adapts to time of day and weather.
 */
export default function VisualWorldBackground({
  blur = false,
  dim = false,
  showAtmosphere = true,
}) {
  const zip = useSelector(selectUserZip);
  const weatherCondition = useSelector(selectWeatherCondition);
  const weatherIntensity = useSelector(selectWeatherIntensity);

  const {
    style: dayNightStyle,
    isNight,
    timeOfDayBucket,
  } = useDayNightBackground({
    zip,
    enableImages: true,
  });

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden transition-colors duration-1000"
      style={{
        ...dayNightStyle,
        filter: blur ? "blur(20px) saturate(1.2)" : "none",
      }}
    >
      {/* Base Dimmer Layer */}
      {dim && (
        <div className="absolute inset-0 bg-black/40 transition-opacity duration-700" />
      )}

      {/* Atmospheric Glow */}
      {showAtmosphere && (
        <div
          className="absolute inset-0 opacity-50 transition-opacity duration-1000"
          style={{
            background: isNight
              ? "radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.2) 0%, transparent 70%)"
              : timeOfDayBucket === "dawn" || timeOfDayBucket === "dusk"
                ? "radial-gradient(circle at 50% 0%, rgba(251, 146, 60, 0.15) 0%, transparent 70%)"
                : "radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Unified Weather Layer */}
      <WeatherFXCanvas
        mode={weatherCondition}
        intensity={weatherIntensity}
        className="opacity-40"
      />

      {/* Surface Depth Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
    </div>
  );
}
