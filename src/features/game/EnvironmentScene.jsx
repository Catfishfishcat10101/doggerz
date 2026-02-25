// src/features/game/EnvironmentScene.jsx

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolveSeason(mode) {
  const key = String(mode || "auto").toLowerCase();
  if (["spring", "summer", "fall", "winter"].includes(key)) return key;

  const month = new Date().getMonth();
  if (month === 11 || month <= 1) return "winter";
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  return "fall";
}

function normalizeWeather(weather) {
  const key = String(weather || "clear").toLowerCase();
  if (key.includes("snow")) return "snow";
  if (key.includes("rain") || key.includes("storm")) return "rain";
  if (key.includes("cloud")) return "cloudy";
  return "clear";
}

function paletteFor(season, isNight) {
  const table = {
    spring: {
      day: {
        skyA: "#7dd3fc",
        skyB: "#1e3a8a",
        horizon: "rgba(34,197,94,0.25)",
        grassA: "#14532d",
        grassB: "#0f3f20",
      },
      night: {
        skyA: "#0f172a",
        skyB: "#020617",
        horizon: "rgba(56,189,248,0.15)",
        grassA: "#0f3f20",
        grassB: "#0a2b16",
      },
    },
    summer: {
      day: {
        skyA: "#67e8f9",
        skyB: "#1d4ed8",
        horizon: "rgba(16,185,129,0.3)",
        grassA: "#166534",
        grassB: "#14532d",
      },
      night: {
        skyA: "#082f49",
        skyB: "#030712",
        horizon: "rgba(14,165,233,0.2)",
        grassA: "#14532d",
        grassB: "#102f22",
      },
    },
    fall: {
      day: {
        skyA: "#fdba74",
        skyB: "#7c2d12",
        horizon: "rgba(251,146,60,0.24)",
        grassA: "#365314",
        grassB: "#2f4a10",
      },
      night: {
        skyA: "#1c1917",
        skyB: "#020617",
        horizon: "rgba(245,158,11,0.15)",
        grassA: "#2f4a10",
        grassB: "#24380d",
      },
    },
    winter: {
      day: {
        skyA: "#dbeafe",
        skyB: "#1e3a8a",
        horizon: "rgba(147,197,253,0.25)",
        grassA: "#334155",
        grassB: "#1f2937",
      },
      night: {
        skyA: "#0f172a",
        skyB: "#020617",
        horizon: "rgba(148,163,184,0.15)",
        grassA: "#1f2937",
        grassB: "#111827",
      },
    },
  };

  return table[season]?.[isNight ? "night" : "day"] || table.spring.day;
}

export default function EnvironmentScene({
  season = "auto",
  timeOfDay = "day",
  weather = "clear",
  reduceMotion = false,
  reduceTransparency = false,
  holes = [],
}) {
  const resolvedSeason = resolveSeason(season);
  const keyTime = String(timeOfDay || "day").toLowerCase();
  const isNight = keyTime === "night" || keyTime === "evening";
  const weatherKey = normalizeWeather(weather);

  const palette = paletteFor(resolvedSeason, isNight);
  const windMultiplier = resolvedSeason === "fall" ? 1.35 : 1;

  const cloudOpacity =
    weatherKey === "cloudy" ? 0.6 : weatherKey === "rain" ? 0.45 : 0.35;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${palette.skyA} 0%, ${palette.skyB} 58%)`,
          opacity: reduceTransparency ? 0.88 : 1,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-[20%] h-[34%]"
        style={{
          background: `radial-gradient(ellipse at center, ${palette.horizon} 0%, transparent 70%)`,
        }}
      />

      <div
        className="absolute right-[12%] top-[10%] h-24 w-24 rounded-full blur-sm"
        style={{
          background: isNight
            ? "radial-gradient(circle, rgba(226,232,240,0.8), rgba(148,163,184,0.22))"
            : "radial-gradient(circle, rgba(254,240,138,0.95), rgba(253,186,116,0.28))",
          boxShadow: isNight
            ? "0 0 80px rgba(148,163,184,0.4)"
            : "0 0 90px rgba(253,224,71,0.45)",
        }}
      />

      <div className="absolute inset-0" style={{ opacity: cloudOpacity }}>
        <div
          className="absolute left-[-20%] top-[11%] h-16 w-72 rounded-full bg-white/35 blur-2xl"
          style={{
            animation: reduceMotion ? "none" : "dgCloudA 52s linear infinite",
          }}
        />
        <div
          className="absolute left-[-32%] top-[20%] h-14 w-64 rounded-full bg-white/25 blur-2xl"
          style={{
            animation: reduceMotion ? "none" : "dgCloudB 62s linear infinite",
          }}
        />
        <div
          className="absolute left-[-25%] top-[30%] h-12 w-56 rounded-full bg-white/20 blur-2xl"
          style={{
            animation: reduceMotion ? "none" : "dgCloudC 78s linear infinite",
          }}
        />
      </div>

      <div className="absolute bottom-[20%] left-[8%] h-44 w-36">
        <div className="absolute bottom-0 left-[44%] h-36 w-7 -translate-x-1/2 rounded-t-lg bg-[#3f2f1e]" />
        <div className="absolute bottom-20 left-[16%] h-3 w-20 rotate-[-18deg] rounded-full bg-[#3a2a1a]" />
        <div className="absolute bottom-16 left-[42%] h-3 w-20 rotate-[18deg] rounded-full bg-[#3a2a1a]" />
        <div
          className="absolute left-0 top-0 h-28 w-36 rounded-full"
          style={{
            background:
              resolvedSeason === "fall"
                ? "radial-gradient(circle at 35% 35%, rgba(251,146,60,0.75), rgba(120,53,15,0.9))"
                : resolvedSeason === "winter"
                  ? "radial-gradient(circle at 35% 35%, rgba(203,213,225,0.72), rgba(71,85,105,0.88))"
                  : "radial-gradient(circle at 35% 35%, rgba(74,222,128,0.75), rgba(22,101,52,0.92))",
            animation: reduceMotion
              ? "none"
              : `dgCanopySway ${8 / windMultiplier}s ease-in-out infinite alternate`,
          }}
        />
      </div>

      {!reduceMotion ? (
        <>
          <div
            className="absolute left-[22%] top-[35%] h-2.5 w-2.5 rounded-full"
            style={{
              background: resolvedSeason === "fall" ? "#fb923c" : "#4ade80",
              animation: `dgLeafDrift ${9 / windMultiplier}s linear infinite`,
            }}
          />
          <div
            className="absolute left-[30%] top-[32%] h-2 w-2 rounded-full"
            style={{
              background: resolvedSeason === "fall" ? "#f59e0b" : "#86efac",
              animation: `dgLeafDrift ${11 / windMultiplier}s linear infinite`,
              animationDelay: "-2.4s",
            }}
          />
          <div
            className="absolute left-[26%] top-[28%] h-1.5 w-1.5 rounded-full"
            style={{
              background: resolvedSeason === "fall" ? "#f97316" : "#22c55e",
              animation: `dgLeafDrift ${13 / windMultiplier}s linear infinite`,
              animationDelay: "-5.2s",
            }}
          />
        </>
      ) : null}

      {weatherKey === "rain" ? (
        <div className="absolute inset-0 overflow-hidden opacity-55">
          <div
            className="absolute -inset-[20%]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(105deg, rgba(191,219,254,0.0) 0px, rgba(191,219,254,0.0) 10px, rgba(191,219,254,0.6) 11px, rgba(191,219,254,0.6) 12px)",
              animation: reduceMotion ? "none" : "dgRain 0.7s linear infinite",
            }}
          />
        </div>
      ) : null}

      {weatherKey === "snow" ? (
        <div className="absolute inset-0 overflow-hidden opacity-65">
          <div
            className="absolute -inset-[25%]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(248,250,252,0.95) 0.8px, transparent 1px)",
              backgroundSize: "18px 18px",
              animation: reduceMotion ? "none" : "dgSnow 7s linear infinite",
            }}
          />
        </div>
      ) : null}

      {weatherKey === "cloudy" ? (
        <div className="absolute inset-0 bg-black/10" />
      ) : null}

      {!reduceMotion && !isNight ? (
        <div
          className="absolute left-[-10%] top-[28%] h-6 w-6 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, #fde68a, #f97316)",
            boxShadow: "0 0 12px rgba(251,146,60,0.6)",
            animation: "dgButterfly 19s ease-in-out infinite",
          }}
        />
      ) : null}

      {isNight ? (
        <>
          <div
            className="absolute bottom-[39%] left-[19%] h-5 w-8 rounded-full bg-zinc-200/90"
            style={{
              boxShadow: "0 0 8px rgba(248,250,252,0.45)",
              animation: reduceMotion
                ? "none"
                : "dgOwlPerch 4.5s ease-in-out infinite",
            }}
          >
            <div className="absolute left-1 top-1 h-1 w-1 rounded-full bg-zinc-900" />
            <div className="absolute right-1 top-1 h-1 w-1 rounded-full bg-zinc-900" />
          </div>
          {!reduceMotion ? (
            <div
              className="absolute top-[16%] left-[-20%] h-[2px] w-28 rotate-[-20deg]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0), rgba(248,250,252,0.95), rgba(255,255,255,0))",
                animation: "dgShootingStar 18s linear infinite",
              }}
            />
          ) : null}
        </>
      ) : null}

      <div
        className="absolute inset-x-0 bottom-0 h-[24%]"
        style={{
          background: `linear-gradient(180deg, ${palette.grassA} 0%, ${palette.grassB} 100%)`,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      {Array.isArray(holes)
        ? holes.map((hole) => {
            const radius = Number(hole?.radius || 22);
            const fillPct = clamp(Number(hole?.fillPct || 0), 0, 1);
            const depth = 1 - fillPct;

            return (
              <div
                key={hole.id}
                className="absolute rounded-full border border-black/40"
                style={{
                  left: `${Number(hole?.xPct || 50)}%`,
                  top: `${Number(hole?.yPct || 74)}%`,
                  width: `${radius * 2}px`,
                  height: `${radius * (1 + depth * 0.25)}px`,
                  transform: "translate(-50%, -50%)",
                  background:
                    "radial-gradient(ellipse at center, rgba(15,23,42,0.72), rgba(2,6,23,0.96))",
                  opacity: 0.35 + depth * 0.45,
                  boxShadow: `inset 0 ${Math.round(8 * depth)}px ${Math.round(18 * depth)}px rgba(0,0,0,0.45)`,
                }}
              />
            );
          })
        : null}

      <style>
        {`@keyframes dgCloudA { 0% { transform: translateX(0); } 100% { transform: translateX(155%); } }
@keyframes dgCloudB { 0% { transform: translateX(0); } 100% { transform: translateX(180%); } }
@keyframes dgCloudC { 0% { transform: translateX(0); } 100% { transform: translateX(170%); } }
@keyframes dgCanopySway { 0% { transform: rotate(-1.5deg); } 100% { transform: rotate(1.5deg); } }
@keyframes dgLeafDrift {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0.95; }
  100% { transform: translate(140px, 90px) rotate(260deg); opacity: 0; }
}
@keyframes dgRain { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-30px,110px,0); } }
@keyframes dgSnow { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-20px,120px,0); } }
@keyframes dgButterfly {
  0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
  10% { opacity: 1; }
  50% { transform: translate3d(56vw, -22px, 0) scale(1.1); }
  100% { transform: translate3d(110vw, 16px, 0) scale(0.95); opacity: 0; }
}
@keyframes dgOwlPerch { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-2px); } }
@keyframes dgShootingStar {
  0%, 82% { transform: translateX(0) rotate(-20deg); opacity: 0; }
  86% { opacity: 0.95; }
  100% { transform: translateX(160vw) rotate(-20deg); opacity: 0; }
}`}
      </style>
    </div>
  );
}
