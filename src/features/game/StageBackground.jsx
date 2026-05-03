function getStageMood({ isNight, weather, scene }) {
  const weatherKey = String(
    scene?.weatherKey || scene?.weather || weather || "clear"
  ).toLowerCase();
  const timeKey = String(
    scene?.timeOfDayBucket || scene?.timeOfDay || ""
  ).toLowerCase();
  const rainy =
    weatherKey.includes("rain") ||
    weatherKey.includes("storm") ||
    weatherKey.includes("drizzle");
  const evening =
    timeKey.includes("evening") ||
    timeKey.includes("sunset") ||
    timeKey.includes("dusk");
  const night = Boolean(isNight) || timeKey.includes("night");

  if (night) {
    return {
      key: "night",
      sky: "linear-gradient(180deg,#0b1228 0%,#132849 44%,#183728 100%)",
      horizon:
        "linear-gradient(180deg,rgba(31,70,51,0.92),rgba(18,46,31,0.98))",
      light:
        "radial-gradient(circle at 52% 12%,rgba(213,228,255,0.24),rgba(153,188,255,0.08) 42%,rgba(153,188,255,0) 68%)",
      cloudOpacity: rainy ? 0.22 : 0.1,
      starsOpacity: rainy ? 0.06 : 0.28,
      rainy,
    };
  }

  if (evening) {
    return {
      key: "evening",
      sky: "linear-gradient(180deg,#7fb8d6 0%,#e4c498 44%,#5f8f58 100%)",
      horizon:
        "linear-gradient(180deg,rgba(91,126,82,0.92),rgba(46,88,51,0.98))",
      light:
        "radial-gradient(circle at 24% 18%,rgba(255,206,139,0.54),rgba(255,206,139,0.16) 38%,rgba(255,206,139,0) 68%)",
      cloudOpacity: rainy ? 0.3 : 0.18,
      starsOpacity: 0,
      rainy,
    };
  }

  return {
    key: "day",
    sky: rainy
      ? "linear-gradient(180deg,#88a9bd 0%,#c7d7dc 48%,#6d9365 100%)"
      : "linear-gradient(180deg,#8cccf0 0%,#d9f0f5 50%,#71a864 100%)",
    horizon: rainy
      ? "linear-gradient(180deg,rgba(78,105,78,0.92),rgba(48,82,50,0.98))"
      : "linear-gradient(180deg,rgba(99,148,93,0.92),rgba(51,99,54,0.98))",
    light: rainy
      ? "radial-gradient(circle at 52% 10%,rgba(255,255,255,0.18),rgba(255,255,255,0.05) 42%,rgba(255,255,255,0) 72%)"
      : "radial-gradient(circle at 28% 14%,rgba(255,241,184,0.62),rgba(255,241,184,0.18) 40%,rgba(255,241,184,0) 70%)",
    cloudOpacity: rainy ? 0.36 : 0.2,
    starsOpacity: 0,
    rainy,
  };
}

export function StageBackground({
  isNight = false,
  weather = "clear",
  scene = null,
  reduceMotion = false,
}) {
  const mood = getStageMood({ isNight, weather, scene });
  const animationStyle = reduceMotion
    ? { animation: "none" }
    : { animation: "dgLightShift 18s ease-in-out infinite" };

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden bg-[#0b1320] select-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={{ background: mood.sky }} />

      <div
        className="absolute inset-0 opacity-80"
        style={{ background: mood.light, ...animationStyle }}
      />

      <div
        className="absolute inset-x-0 top-[31%] h-[24%]"
        style={{
          background: mood.horizon,
          clipPath:
            "polygon(0 58%,8% 48%,17% 56%,28% 42%,39% 60%,50% 47%,61% 57%,72% 39%,83% 59%,92% 46%,100% 58%,100% 100%,0 100%)",
        }}
      />

      <div
        className="absolute inset-x-[-18%] top-[8%] h-[28%]"
        style={{
          opacity: mood.cloudOpacity,
          background:
            "radial-gradient(ellipse at 16% 55%,rgba(255,255,255,0.82) 0 11%,transparent 24%),radial-gradient(ellipse at 42% 44%,rgba(255,255,255,0.74) 0 10%,transparent 24%),radial-gradient(ellipse at 76% 58%,rgba(255,255,255,0.7) 0 12%,transparent 27%)",
          filter: "blur(1.5px)",
          animation: reduceMotion
            ? "none"
            : "dgPremiumCloudDrift 150s linear infinite alternate",
        }}
      />

      {mood.starsOpacity ? (
        <div
          className="absolute inset-x-0 top-0 h-[36%]"
          style={{
            opacity: mood.starsOpacity,
            backgroundImage:
              "radial-gradient(circle at 18% 32%,rgba(255,255,255,0.9) 0 1px,transparent 1.5px),radial-gradient(circle at 36% 18%,rgba(255,255,255,0.75) 0 1px,transparent 1.5px),radial-gradient(circle at 66% 26%,rgba(255,255,255,0.8) 0 1px,transparent 1.5px),radial-gradient(circle at 82% 12%,rgba(255,255,255,0.68) 0 1px,transparent 1.5px)",
          }}
        />
      ) : null}

      <div
        className="absolute inset-x-0 bottom-0 h-[48%]"
        style={{
          background:
            mood.key === "night"
              ? "linear-gradient(180deg,#31583d 0%,#24442f 42%,#1b3428 100%)"
              : mood.rainy
                ? "linear-gradient(180deg,#6f9567 0%,#55794e 44%,#3c633d 100%)"
                : "linear-gradient(180deg,#78ad66 0%,#5f974f 44%,#43763f 100%)",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-[34%] opacity-55"
        style={{
          backgroundImage:
            "linear-gradient(96deg,rgba(255,255,255,0.12) 0 1px,transparent 1px),linear-gradient(84deg,rgba(0,0,0,0.12) 0 1px,transparent 1px)",
          backgroundSize: "18px 100%,22px 100%",
          backgroundPosition: "0 100%,8px 100%",
          animation: reduceMotion
            ? "none"
            : "dgGrassBreathe 7s ease-in-out infinite",
        }}
      />

      {mood.rainy ? (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(105deg,rgba(225,239,255,0.36) 0 1px,transparent 1px 14px)",
            backgroundSize: "120px 120px",
            animation: reduceMotion
              ? "none"
              : "dgRainFall 0.9s linear infinite",
          }}
        />
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0)_42%,rgba(2,6,23,0.18)_100%)]" />
    </div>
  );
}
