import { motion } from "framer-motion";
import { useMemo } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function seeded(index) {
  return ((index * 9301 + 49297) % 233280) / 233280;
}

function normalizeWeather(input) {
  const value = String(input || "clear")
    .trim()
    .toLowerCase();

  if (value.includes("storm") || value.includes("thunder")) return "storm";
  if (value.includes("rain") || value.includes("drizzle")) return "rain";
  if (value.includes("fog") || value.includes("mist")) return "fog";
  if (value.includes("cloud")) return "clouds";
  if (value.includes("snow")) return "snow";

  return "clear";
}

function buildClouds(count) {
  return Array.from({ length: count }, (_, index) => {
    const s = seeded(index + 1);
    const width = 90 + Math.round(s * 90);
    const height = 34 + Math.round(s * 26);
    const top = 18 + Math.round(seeded(index + 11) * 96);
    const startX = -20 - Math.round(seeded(index + 21) * 20);
    const duration = 24 + Math.round(seeded(index + 31) * 28);
    const delay = seeded(index + 41) * -18;
    const opacity = 0.09 + seeded(index + 51) * 0.12;

    return {
      id: `cloud-${index}`,
      width,
      height,
      top,
      startX,
      duration,
      delay,
      opacity,
    };
  });
}

function buildRain(count, height) {
  return Array.from({ length: count }, (_, index) => {
    const s = seeded(index + 101);
    return {
      id: `rain-${index}`,
      left: `${Math.round(s * 100)}%`,
      delay: seeded(index + 111) * -1.8,
      duration: 0.55 + seeded(index + 121) * 0.45,
      opacity: 0.18 + seeded(index + 131) * 0.34,
      scale: 0.85 + seeded(index + 141) * 0.6,
      length: 28 + Math.round(seeded(index + 151) * 42),
      containerHeight: height,
    };
  });
}

function buildSnow(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `snow-${index}`,
    left: `${Math.round(seeded(index + 201) * 100)}%`,
    size: 2 + Math.round(seeded(index + 211) * 4),
    delay: seeded(index + 221) * -4,
    duration: 5 + seeded(index + 231) * 6,
    drift: -18 + seeded(index + 241) * 36,
    opacity: 0.22 + seeded(index + 251) * 0.5,
  }));
}

function buildStars(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `star-${index}`,
    left: `${Math.round(seeded(index + 301) * 100)}%`,
    top: `${Math.round(seeded(index + 311) * 48)}%`,
    size: 1 + Math.round(seeded(index + 321) * 2),
    delay: seeded(index + 331) * -2,
    opacity: 0.2 + seeded(index + 341) * 0.7,
  }));
}

function buildFireflies(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `firefly-${index}`,
    left: `${18 + Math.round(seeded(index + 401) * 64)}%`,
    bottom: `${16 + Math.round(seeded(index + 411) * 20)}%`,
    size: 3 + Math.round(seeded(index + 421) * 3),
    xOffset: -16 + seeded(index + 431) * 32,
    yOffset: -12 + seeded(index + 441) * 24,
    duration: 3.2 + seeded(index + 451) * 2.6,
    delay: seeded(index + 461) * -2,
    opacity: 0.25 + seeded(index + 471) * 0.45,
  }));
}

function CloudLayer({ clouds, isNight }) {
  return (
    <>
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute"
          style={{
            top: cloud.top,
            left: `${cloud.startX}%`,
            width: cloud.width,
            height: cloud.height,
            opacity: cloud.opacity,
          }}
          animate={{ x: ["0vw", "118vw"] }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div
            className="relative h-full w-full rounded-full blur-[1px]"
            style={{
              background: isNight
                ? "rgba(214, 224, 255, 0.16)"
                : "rgba(255, 255, 255, 0.20)",
            }}
          >
            <div className="absolute -left-3 top-2 h-[72%] w-[42%] rounded-full bg-inherit" />
            <div className="absolute left-[22%] -top-2 h-[86%] w-[42%] rounded-full bg-inherit" />
            <div className="absolute right-[14%] top-1 h-[78%] w-[38%] rounded-full bg-inherit" />
          </div>
        </motion.div>
      ))}
    </>
  );
}

function RainLayer({ drops }) {
  return (
    <>
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute top-[-60px] w-[1.5px] rounded-full bg-white"
          style={{
            left: drop.left,
            height: drop.length,
            opacity: drop.opacity,
            transform: `scaleY(${drop.scale}) rotate(16deg)`,
            transformOrigin: "top center",
            boxShadow: "0 0 6px rgba(255,255,255,0.18)",
          }}
          animate={{ y: [-20, drop.containerHeight + 60] }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}

function SnowLayer({ flakes, height }) {
  return (
    <>
      {flakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute top-[-10px] rounded-full bg-white"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            boxShadow: "0 0 6px rgba(255,255,255,0.25)",
          }}
          animate={{
            y: [-10, height + 20],
            x: [0, flake.drift, 0],
          }}
          transition={{
            y: {
              duration: flake.duration,
              delay: flake.delay,
              repeat: Infinity,
              ease: "linear",
            },
            x: {
              duration: flake.duration * 0.9,
              delay: flake.delay,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      ))}
    </>
  );
}

function StarLayer({ stars }) {
  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            boxShadow: "0 0 8px rgba(255,255,255,0.35)",
          }}
          animate={{
            opacity: [star.opacity * 0.45, star.opacity, star.opacity * 0.55],
          }}
          transition={{
            duration: 2.4,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

function FireflyLayer({ fireflies }) {
  return (
    <>
      {fireflies.map((firefly) => (
        <motion.div
          key={firefly.id}
          className="absolute rounded-full bg-lime-300"
          style={{
            left: firefly.left,
            bottom: firefly.bottom,
            width: firefly.size,
            height: firefly.size,
            opacity: firefly.opacity,
            boxShadow: "0 0 12px rgba(190, 242, 100, 0.7)",
          }}
          animate={{
            x: [0, firefly.xOffset, 0],
            y: [0, firefly.yOffset, 0],
            opacity: [
              firefly.opacity * 0.4,
              firefly.opacity,
              firefly.opacity * 0.5,
            ],
          }}
          transition={{
            duration: firefly.duration,
            delay: firefly.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

export default function AnimatedStageBackground({
  backgroundSrc = "",
  weather = "clear",
  isNight = false,
  intensity = 0.7,
  height = 430,
  className = "",
  children,
}) {
  const weatherMode = normalizeWeather(weather);
  const clampedIntensity = clamp(Number(intensity) || 0.7, 0.15, 1.25);

  const clouds = useMemo(
    () => buildClouds(weatherMode === "clear" ? 3 : 5),
    [weatherMode]
  );

  const rainDrops = useMemo(() => {
    if (weatherMode !== "rain" && weatherMode !== "storm") return [];
    const count = weatherMode === "storm" ? 54 : 34;
    return buildRain(Math.round(count * clampedIntensity), height);
  }, [weatherMode, clampedIntensity, height]);

  const snowFlakes = useMemo(() => {
    if (weatherMode !== "snow") return [];
    return buildSnow(Math.round(26 * clampedIntensity));
  }, [weatherMode, clampedIntensity]);

  const stars = useMemo(() => (isNight ? buildStars(28) : []), [isNight]);
  const fireflies = useMemo(
    () => (isNight ? buildFireflies(8) : []),
    [isNight]
  );

  const skyTint = isNight
    ? "linear-gradient(180deg, rgba(9,16,36,0.46), rgba(8,13,20,0.18) 55%, rgba(6,12,18,0.28) 100%)"
    : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 45%, rgba(8,16,24,0.12) 100%)";

  return (
    <div
      className={`relative overflow-hidden rounded-[16px] ring-1 ring-white/8 ${className}`}
      style={{ height }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: backgroundSrc
            ? `url(${backgroundSrc})`
            : isNight
              ? "linear-gradient(180deg,#19274b 0%,#12223d 42%,#0d1c31 68%,#0b1621 100%)"
              : "linear-gradient(180deg,#375486 0%,#42679a 38%,#2b4d79 60%,#193251 100%)",
        }}
        animate={{
          scale: [1, 1.018, 1],
          x: [0, -4, 0],
          y: [0, -2, 0],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0" style={{ background: skyTint }} />

      <motion.div
        className="absolute inset-x-0 top-0 h-24"
        style={{
          background:
            weatherMode === "storm"
              ? "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12), transparent 70%)"
              : "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 72%)",
        }}
        animate={
          weatherMode === "storm"
            ? { opacity: [0.4, 0.9, 0.45] }
            : { opacity: [0.7, 1, 0.75] }
        }
        transition={{
          duration: weatherMode === "storm" ? 2.8 : 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <CloudLayer clouds={clouds} isNight={isNight} />

        {isNight ? <StarLayer stars={stars} /> : null}
        {isNight ? <FireflyLayer fireflies={fireflies} /> : null}
        {rainDrops.length ? <RainLayer drops={rainDrops} /> : null}
        {snowFlakes.length ? (
          <SnowLayer flakes={snowFlakes} height={height} />
        ) : null}

        {(weatherMode === "fog" ||
          weatherMode === "rain" ||
          weatherMode === "storm") && (
          <>
            <motion.div
              className="absolute inset-x-[-12%] bottom-[20%] h-24 rounded-full blur-3xl"
              style={{ background: "rgba(220, 228, 238, 0.14)" }}
              animate={{ x: [0, 18, 0], opacity: [0.18, 0.28, 0.2] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-x-[-8%] bottom-[10%] h-20 rounded-full blur-2xl"
              style={{ background: "rgba(220, 228, 238, 0.10)" }}
              animate={{ x: [0, -22, 0], opacity: [0.1, 0.2, 0.12] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        <motion.div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(8,16,24,0.08) 28%, rgba(8,16,24,0.22) 100%)",
          }}
          animate={{ opacity: [0.75, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {children}
    </div>
  );
}
