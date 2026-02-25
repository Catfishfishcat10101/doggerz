// src/features/game/EnvironmentScene.jsx

function useSceneGradient(season, timeOfDay) {
  const s = String(season || "auto").toLowerCase();
  const t = String(timeOfDay || "day").toLowerCase();

  const isNight = t === "night" || t === "evening";
  if (isNight) {
    return "radial-gradient(circle at top, rgba(15,23,42,0.95), rgba(2,6,23,1) 60%)";
  }

  if (s === "winter") {
    return "radial-gradient(circle at top, rgba(191,219,254,0.25), rgba(15,23,42,0.9) 65%)";
  }
  if (s === "fall") {
    return "radial-gradient(circle at top, rgba(251,191,36,0.2), rgba(2,6,23,0.95) 65%)";
  }
  if (s === "summer") {
    return "radial-gradient(circle at top, rgba(16,185,129,0.2), rgba(2,6,23,0.9) 65%)";
  }

  return "radial-gradient(circle at top, rgba(56,189,248,0.2), rgba(2,6,23,0.95) 65%)";
}

export default function EnvironmentScene({
  season = "auto",
  timeOfDay = "day",
  weather = "clear",
  reduceMotion = false,
  reduceTransparency = false,
  holes = [],
}) {
  const gradient = useSceneGradient(season, timeOfDay);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: gradient,
          opacity: reduceTransparency ? 0.85 : 1,
        }}
      />

      {weather && weather !== "clear" ? (
        <div className="absolute inset-0 bg-black/15" />
      ) : null}

      {!reduceMotion ? (
        <div className="absolute inset-0 opacity-70">
          <div className="absolute top-8 left-[-15%] h-16 w-64 rounded-full bg-white/10 blur-2xl animate-[float_18s_linear_infinite]" />
          <div className="absolute top-24 right-[-10%] h-12 w-48 rounded-full bg-white/10 blur-2xl animate-[float_22s_linear_infinite]" />
        </div>
      ) : null}

      {Array.isArray(holes)
        ? holes.map((hole) => (
            <div
              key={hole.id}
              className="absolute rounded-full bg-black/40 border border-black/40"
              style={{
                left: `${hole.xPct || 50}%`,
                top: `${hole.yPct || 70}%`,
                width: `${(hole.radius || 24) * 2}px`,
                height: `${(hole.radius || 24) * 1.2}px`,
                transform: "translate(-50%, -50%)",
                opacity: 0.6,
              }}
            />
          ))
        : null}

      <style>
        {`@keyframes float { 0% { transform: translateX(0); } 100% { transform: translateX(40%); } }`}
      </style>
    </div>
  );
}
