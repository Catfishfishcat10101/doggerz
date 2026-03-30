// src/components/game/YardBackdrop.jsx

import { useEffect, useMemo, useState } from "react";

const LAYER = Object.freeze({
  SKY: 1,
  FENCE: 5,
  YARD: 9,
  OBJECTS: 14,
  OVERLAY: 18,
});

function svgToDataUrl(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const YARD_OBJECT_SPRITES = Object.freeze({
  fence: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 220">
      <g fill="none" stroke-linecap="round">
        <path d="M0 112h1200" stroke="rgba(245,158,11,0.65)" stroke-width="10"/>
        <path d="M0 144h1200" stroke="rgba(120,53,15,0.7)" stroke-width="12"/>
        ${Array.from({ length: 32 }, (_, i) => {
          const x = i * 38 + 8;
          return `<rect x="${x}" y="34" width="14" height="146" rx="5" fill="rgba(146,64,14,0.82)"/>`;
        }).join("")}
      </g>
    </svg>
  `),
  tree: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 360">
      <defs>
        <radialGradient id="leaf" cx="48%" cy="40%" r="62%">
          <stop offset="0%" stop-color="rgba(74,222,128,0.98)"/>
          <stop offset="58%" stop-color="rgba(34,197,94,0.95)"/>
          <stop offset="100%" stop-color="rgba(20,83,45,0.92)"/>
        </radialGradient>
        <linearGradient id="trunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(120,53,15,0.98)"/>
          <stop offset="100%" stop-color="rgba(68,38,14,0.98)"/>
        </linearGradient>
      </defs>
      <ellipse cx="130" cy="116" rx="104" ry="88" fill="url(#leaf)"/>
      <ellipse cx="78" cy="142" rx="56" ry="46" fill="url(#leaf)" opacity="0.94"/>
      <ellipse cx="182" cy="142" rx="56" ry="46" fill="url(#leaf)" opacity="0.94"/>
      <rect x="112" y="170" width="38" height="160" rx="20" fill="url(#trunk)"/>
    </svg>
  `),
  doghouse: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 260">
      <defs>
        <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(194,65,12,0.98)"/>
          <stop offset="100%" stop-color="rgba(124,45,18,0.98)"/>
        </linearGradient>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(180,83,9,0.98)"/>
          <stop offset="100%" stop-color="rgba(146,64,14,0.99)"/>
        </linearGradient>
      </defs>
      <path d="M30 108 160 24 290 108V116H30Z" fill="url(#roof)"/>
      <rect x="52" y="110" width="216" height="126" rx="18" fill="url(#body)"/>
      <rect x="122" y="148" width="76" height="88" rx="32" fill="rgba(15,23,42,0.8)"/>
      <rect x="44" y="236" width="232" height="12" rx="6" fill="rgba(15,23,42,0.2)"/>
    </svg>
  `),
  doghouseFront: svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 260">
      <defs>
        <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(251,191,36,0.38)"/>
          <stop offset="100%" stop-color="rgba(120,53,15,0.35)"/>
        </linearGradient>
      </defs>
      <rect x="112" y="136" width="96" height="110" rx="42" fill="url(#rim)"/>
      <rect x="125" y="148" width="70" height="90" rx="30" fill="rgba(15,23,42,0.88)"/>
      <rect x="42" y="238" width="236" height="12" rx="6" fill="rgba(15,23,42,0.34)"/>
    </svg>
  `),
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Number(Number(value || 0).toFixed(2));
}

function mix(from, to, amount) {
  return Number(from) + (Number(to) - Number(from)) * clamp(amount, 0, 1);
}

function hsla(h, s, l, a = 1) {
  return `hsla(${round(h)}, ${round(s)}%, ${round(l)}%, ${round(a)})`;
}

function getLiveSkyState(nowValue = Date.now()) {
  const now = new Date(nowValue);
  const hourFloat =
    Number(now.getHours() || 0) + Number(now.getMinutes() || 0) / 60;
  const daylight = clamp(
    Math.sin(((hourFloat - 6) / 12) * Math.PI),
    0,
    1
  );
  const dawnGlow = clamp(1 - Math.abs(hourFloat - 6.5) / 2.5, 0, 1);
  const duskGlow = clamp(1 - Math.abs(hourFloat - 18.5) / 2.5, 0, 1);
  const warmth = Math.max(dawnGlow, duskGlow);
  const nightDepth = clamp(1 - daylight * 0.92, 0.08, 1);

  return {
    daylight,
    warmth,
    nightDepth,
  };
}

function getDepthZIndex(yNorm, offset = 0) {
  return Math.max(
    4,
    Math.round(15 + clamp(Number(yNorm || 0.5), 0, 1) * 20) + offset
  );
}

const BACKDROP_MOTION_STYLES = `
  @keyframes dgTreeWindPulse {
    0%, 100% { transform: translate(-50%, -100%) scale(1); opacity: 0.98; }
    50% { transform: translate(-50%, -100%) scale(1.015); opacity: 1; }
  }
  @keyframes dgTreeWindBounce {
    0%, 100% { margin-top: 0; }
    50% { margin-top: -0.45%; }
  }
  @keyframes dgGrassWindPulse {
    0%, 100% { opacity: 0.54; transform: translateY(0) scaleY(1); }
    50% { opacity: 0.68; transform: translateY(-0.35%) scaleY(1.02); }
  }
  @keyframes dgGrassWindBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-0.6%); }
  }
`;

function renderFrontOccluders(occluders = []) {
  return occluders.map((occluder) => (
    <div
      key={occluder.key}
      className="absolute pointer-events-none"
      style={{
        left: `${round(Number(occluder.xNorm || 0.5) * 100)}%`,
        top: `${round(Number(occluder.yNorm || 0.5) * 100)}%`,
        width: occluder.width,
        height: occluder.height,
        transform: occluder.transform || "translate(-50%, -50%)",
        zIndex: getDepthZIndex(occluder.yNorm, Number(occluder.zOffset || 2)),
        borderRadius: occluder.borderRadius,
        background: occluder.background,
        border: occluder.border,
        boxShadow: occluder.boxShadow,
        opacity: occluder.opacity,
        filter: occluder.filter,
      }}
    />
  ));
}

function renderProps({ props, activePropId, onPropTap }) {
  return props.map((prop) => {
    const isActive = prop.id === activePropId;
    const tone = String(prop.theme || "").toLowerCase();
    const toneClass =
      tone === "amber"
        ? "border-amber-200/45 bg-amber-200/16 text-amber-100"
        : tone === "rose"
          ? "border-rose-200/45 bg-rose-200/16 text-rose-100"
          : tone === "slate"
            ? "border-slate-200/40 bg-slate-200/14 text-slate-100"
            : prop.id === "bone"
              ? "border-cyan-200/45 bg-cyan-200/18 text-cyan-100"
              : "border-fuchsia-200/45 bg-fuchsia-200/16 text-fuchsia-100";

    return (
      <div
        key={prop.id}
        className="absolute z-[3]"
        style={{
          left: `${round(prop.xNorm * 100)}%`,
          top: `${round(prop.yNorm * 100)}%`,
          transform: "translate(-50%, -50%)",
          zIndex: getDepthZIndex(prop.yNorm, 0),
        }}
      >
        <button
          type="button"
          onClick={() => onPropTap?.(prop.id)}
          className={`grid place-items-center rounded-full border text-[18px] shadow-[0_8px_18px_rgba(2,6,23,0.3)] ${toneClass} ${
            tone === "amber" ? "h-11 w-11" : "h-9 w-9"
          }`}
          style={{
            pointerEvents: "auto",
            boxShadow: isActive
              ? "0 0 0 6px rgba(251,191,36,0.16), 0 0 28px rgba(250,204,21,0.42)"
              : undefined,
          }}
          aria-label={
            prop.label ? `Inspect ${prop.label}` : `Inspect ${prop.id}`
          }
        >
          <span aria-hidden="true">{prop.icon}</span>
        </button>
      </div>
    );
  });
}

function renderEnvironmentTargets({
  targets = [],
  activeTargetId = "",
  environment = "yard",
}) {
  return targets
    .filter(
      (target) =>
        target &&
        typeof target === "object" &&
        String(target.type || "").toLowerCase() !== "food_bowl"
    )
    .map((target) => {
      const type = String(target.type || "").toLowerCase();
      const isActive = String(target.id || "") === String(activeTargetId || "");
      const xNorm = Number(target.xNorm || 0.5);
      const yNorm = Number(target.yNorm || 0.5);
      const baseStyle = {
        position: "absolute",
        left: `${round(xNorm * 100)}%`,
        top: `${round(yNorm * 100)}%`,
        transform: "translate(-50%, -50%)",
        zIndex: getDepthZIndex(yNorm, 1),
        pointerEvents: "none",
      };
      const ringStyle = isActive
        ? {
            boxShadow:
              "0 0 0 6px rgba(34,211,238,0.12), 0 0 18px rgba(45,212,191,0.28)",
          }
        : null;

      if (type === "hole_spot") {
        return (
          <div
            key={target.id}
            style={{
              ...baseStyle,
              width: "54px",
              height: "18px",
              borderRadius: "999px",
              background:
                "radial-gradient(ellipse at center, rgba(30,41,59,0.88) 0%, rgba(71,85,105,0.42) 65%, rgba(0,0,0,0) 100%)",
              border: "1px solid rgba(120,53,15,0.26)",
              filter: "drop-shadow(0 4px 8px rgba(15,23,42,0.22))",
              ...ringStyle,
            }}
            aria-hidden="true"
          />
        );
      }

      const icon =
        type === "ball"
          ? "🎾"
          : type === "bone"
            ? "🦴"
            : type === "water_bowl"
              ? "🥣"
              : type === "tree"
                ? "🌳"
                : type === "doghouse"
                  ? String(environment || "").toLowerCase() === "apartment"
                    ? "🛏️"
                    : "🏠"
                  : "✨";
      const size =
        type === "tree" || type === "doghouse"
          ? "h-10 w-10 text-[18px]"
          : "h-9 w-9 text-[18px]";
      const tone =
        type === "ball"
          ? "border-lime-200/40 bg-lime-200/16 text-lime-50"
          : type === "bone"
            ? "border-cyan-200/40 bg-cyan-200/14 text-cyan-50"
            : type === "water_bowl"
              ? "border-sky-200/40 bg-sky-200/16 text-sky-50"
              : type === "tree"
                ? "border-emerald-200/35 bg-emerald-200/12 text-emerald-50"
                : "border-amber-200/40 bg-amber-200/14 text-amber-50";

      return (
        <div key={target.id} style={baseStyle} aria-hidden="true">
          <span
            className={`grid place-items-center rounded-full border shadow-[0_10px_20px_rgba(2,6,23,0.25)] backdrop-blur-sm ${size} ${tone}`}
            style={ringStyle || undefined}
          >
            {icon}
          </span>
        </div>
      );
    });
}

export default function YardBackdrop({
  environment = "yard",
  dogXNorm = 0.5,
  isNight = false,
  sunriseProgress = 0,
  reduceMotion = false,
  dogSleepingInDoghouse = false,
  environmentTargets = [],
  activeEnvironmentTargetId = "",
  props = [],
  activePropId = "",
  onPropTap = null,
}) {
  const [clockTick, setClockTick] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClockTick(Date.now());
    }, 60_000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const parallax = useMemo(() => {
    const x = clamp(Number(dogXNorm || 0.5), 0, 1) - 0.5;
    return {
      back: round(x * -18),
      mid: round(x * -38),
      front: round(x * -62),
    };
  }, [dogXNorm]);

  const nightOpacity = isNight ? round(0.74 * (1 - sunriseProgress)) : 0;
  const sunriseOpacity = round(clamp(sunriseProgress, 0, 1));
  const environmentKey = String(environment || "yard").toLowerCase();
  const liveSky = useMemo(() => getLiveSkyState(clockTick), [clockTick]);
  const liveNightOpacity = clamp(
    Math.max(nightOpacity, liveSky.nightDepth * 0.76),
    0.08,
    0.84
  );
  const skyTop = hsla(
    mix(224, 202, liveSky.daylight) - liveSky.warmth * 10,
    mix(42, 82, liveSky.daylight),
    mix(12, 74, liveSky.daylight) + liveSky.warmth * 2
  );
  const skyMid = hsla(
    mix(216, 194, liveSky.daylight) - liveSky.warmth * 9,
    mix(46, 78, liveSky.daylight),
    mix(16, 67, liveSky.daylight) + liveSky.warmth * 4
  );
  const skyHorizon = hsla(
    mix(209, 176, liveSky.daylight) - liveSky.warmth * 6,
    mix(48, 72, liveSky.daylight),
    mix(22, 58, liveSky.daylight) + liveSky.warmth * 10
  );
  const skyFloor = hsla(
    mix(205, 160, liveSky.daylight) + liveSky.warmth * 8,
    mix(46, 66, liveSky.daylight),
    mix(16, 44, liveSky.daylight) + liveSky.warmth * 6
  );
  const skyGlowOpacity = round(mix(0.26, 0.84, liveSky.daylight));
  const horizonGlowOpacity = round(mix(0.14, 0.58, liveSky.daylight) + liveSky.warmth * 0.08);
  const midGroundOpacity = round(mix(0.26, 0.68, liveSky.daylight));
  const grassStripeOpacity = round(mix(0.42, 0.72, liveSky.daylight));
  const horizonLineOpacity = round(
    mix(0.18, 0.46, liveSky.daylight) + liveSky.warmth * 0.06
  );
  const groundPlaneOpacity = round(mix(0.54, 0.88, liveSky.daylight));
  const groundVignetteOpacity = round(mix(0.24, 0.42, liveSky.nightDepth));
  const topLightOpacity = round(mix(0.18, 0.82, liveSky.daylight) + liveSky.warmth * 0.06);
  const topLightCore = hsla(
    44 + liveSky.warmth * 6,
    mix(70, 94, liveSky.daylight),
    mix(66, 82, liveSky.daylight),
    0.16 + liveSky.daylight * 0.12 + liveSky.warmth * 0.08
  );
  const topLightMid = hsla(
    192 - liveSky.warmth * 10,
    mix(38, 76, liveSky.daylight),
    mix(50, 72, liveSky.daylight),
    0.1 + liveSky.daylight * 0.08
  );
  const lawnBase = `linear-gradient(180deg, ${hsla(
    mix(144, 137, liveSky.daylight),
    mix(48, 62, liveSky.daylight),
    mix(20, 40, liveSky.daylight)
  )} 0%, ${hsla(
    mix(134, 126, liveSky.daylight),
    mix(52, 70, liveSky.daylight),
    mix(18, 33, liveSky.daylight)
  )} 18%, ${hsla(
    mix(128, 120, liveSky.daylight),
    mix(56, 64, liveSky.daylight),
    mix(16, 24, liveSky.daylight)
  )} 52%, ${hsla(
    mix(124, 118, liveSky.daylight),
    mix(52, 58, liveSky.daylight),
    mix(14, 19, liveSky.daylight)
  )} 100%)`;
  const treeBaseZIndex = getDepthZIndex(0.58, -1);
  const doghouseBaseZIndex = getDepthZIndex(0.65, -3);
  const doghouseFrontZIndex = getDepthZIndex(0.65, -2);
  const doghouseEntranceZIndex = getDepthZIndex(0.65, -1);

  if (environmentKey === "apartment") {
    const windowGlow = isNight
      ? "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.84) 100%)"
      : "linear-gradient(180deg, rgba(186,230,253,0.95) 0%, rgba(125,211,252,0.88) 100%)";

    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
        <style>{BACKDROP_MOTION_STYLES}</style>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#1f2937_0%,#111827_45%,#0b1120_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[64%] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
        <div className="absolute inset-x-0 bottom-0 h-[36%] bg-[linear-gradient(180deg,#3f2a1d_0%,#2b1b12_100%)]" />
        <div className="absolute left-[8%] top-[14%] h-[34%] w-[26%] rounded-[18px] border border-white/15 bg-black/30 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div
            className="absolute inset-3 rounded-[12px]"
            style={{ background: windowGlow }}
          />
          <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-white/20" />
          <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-white/20" />
        </div>
        <div className="absolute left-[12%] bottom-[11%] h-[24%] w-[26%] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#6b7280_0%,#374151_100%)] shadow-[0_18px_32px_rgba(15,23,42,0.35)]" />
        <div className="absolute left-[56%] top-[43%] h-[10%] w-[24%] rounded-[16px] border border-amber-200/20 bg-[linear-gradient(180deg,#a16207_0%,#713f12_100%)] shadow-[0_12px_20px_rgba(15,23,42,0.25)]" />
        <div className="absolute left-[60%] top-[52%] h-[13%] w-[3%] rounded-full bg-amber-900/70" />
        <div className="absolute left-[76%] top-[52%] h-[13%] w-[3%] rounded-full bg-amber-900/70" />
        <div className="absolute right-[10%] bottom-[12%] h-[12%] w-[11%] rotate-[-8deg] rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,#1f2937_0%,#0f172a_100%)] opacity-90" />
        <div className="absolute left-[30%] bottom-[8%] h-[14%] w-[26%] rounded-[999px] border border-emerald-200/10 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),rgba(2,6,23,0.08)_70%,transparent_100%)]" />

        {renderProps({ props, activePropId, onPropTap })}
        {renderEnvironmentTargets({
          targets: environmentTargets,
          activeTargetId: activeEnvironmentTargetId,
          environment,
        })}
        {renderFrontOccluders([
          {
            key: "apartment-couch-front",
            xNorm: 0.25,
            yNorm: 0.84,
            width: "24%",
            height: "7%",
            borderRadius: "999px",
            background:
              "linear-gradient(180deg, rgba(71,85,105,0.94) 0%, rgba(51,65,85,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 -4px 14px rgba(15,23,42,0.2)",
            zOffset: 2,
          },
          {
            key: "apartment-table-front",
            xNorm: 0.68,
            yNorm: 0.61,
            width: "27%",
            height: "8%",
            borderRadius: "18px",
            background:
              "linear-gradient(180deg, rgba(146,64,14,0.96) 0%, rgba(120,53,15,0.98) 100%)",
            border: "1px solid rgba(253,230,138,0.14)",
            boxShadow: "0 -4px 14px rgba(15,23,42,0.24)",
            zOffset: 2,
          },
          {
            key: "apartment-table-leg-left",
            xNorm: 0.61,
            yNorm: 0.66,
            width: "3.8%",
            height: "12%",
            borderRadius: "999px",
            background:
              "linear-gradient(180deg, rgba(146,64,14,0.95) 0%, rgba(120,53,15,0.98) 100%)",
            zOffset: 2,
          },
          {
            key: "apartment-table-leg-right",
            xNorm: 0.76,
            yNorm: 0.66,
            width: "3.8%",
            height: "12%",
            borderRadius: "999px",
            background:
              "linear-gradient(180deg, rgba(146,64,14,0.95) 0%, rgba(120,53,15,0.98) 100%)",
            zOffset: 2,
          },
        ])}
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
      <style>{BACKDROP_MOTION_STYLES}</style>
      <div className="absolute inset-0" style={{ zIndex: LAYER.SKY }}>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 28%, ${skyHorizon} 66%, ${skyFloor} 100%)`,
          }}
        />
        <div
          className="absolute left-1/2 top-[-6%] h-[38%] w-[72%] -translate-x-1/2 rounded-[50%] blur-3xl"
          style={{
            background: `radial-gradient(ellipse at center, ${topLightCore} 0%, ${topLightMid} 36%, rgba(255,255,255,0) 72%)`,
            opacity: topLightOpacity,
          }}
        />
        <div
          className="absolute inset-x-[-12%] top-[18%] h-[24%] rounded-[50%] blur-3xl"
          style={{
            background: `radial-gradient(circle at center, ${hsla(
              mix(206, 186, liveSky.daylight),
              mix(44, 78, liveSky.daylight),
              mix(58, 82, liveSky.daylight),
              0.18 + liveSky.daylight * 0.12
            )} 0%, ${hsla(
              mix(194, 176, liveSky.daylight),
              mix(38, 70, liveSky.daylight),
              mix(42, 70, liveSky.daylight),
              0.08 + liveSky.daylight * 0.12
            )} 42%, transparent 78%)`,
            opacity: skyGlowOpacity,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-[34%] h-[14%]"
          style={{
            background: `linear-gradient(180deg, ${hsla(
              42 + liveSky.warmth * 8,
              92,
              72,
              0.08 + liveSky.warmth * 0.16
            )} 0%, ${hsla(
              138,
              66,
              74,
              0.08 + liveSky.daylight * 0.12
            )} 44%, rgba(20,83,45,0) 100%)`,
            opacity: horizonGlowOpacity,
          }}
        />
      </div>

      <div
        className="absolute inset-y-0 -left-[22%] w-[144%]"
        style={{
          zIndex: LAYER.FENCE,
          transform: `translate3d(${parallax.back}px, 0, 0)`,
          transition: reduceMotion ? "none" : "transform 220ms linear",
        }}
      >
        <div className="absolute inset-x-0 top-[7%] h-[26%] rounded-[50%] bg-cyan-100/10 blur-3xl" />
        <img
          src={YARD_OBJECT_SPRITES.fence}
          alt=""
          className="pointer-events-none absolute inset-x-[-4%] bottom-[27%] h-[23%] w-[108%] select-none object-fill opacity-[0.72]"
          draggable="false"
        />
        <div
          className="absolute inset-x-0 bottom-[28%] h-[28%]"
          style={{
            background:
              "radial-gradient(circle at 10% 100%, rgba(255,255,255,0.08) 0 12%, transparent 13%), radial-gradient(circle at 28% 100%, rgba(15,23,42,0.24) 0 16%, transparent 17%), radial-gradient(circle at 52% 100%, rgba(15,23,42,0.28) 0 18%, transparent 19%), radial-gradient(circle at 74% 100%, rgba(15,23,42,0.2) 0 13%, transparent 14%), radial-gradient(circle at 92% 100%, rgba(15,23,42,0.26) 0 16%, transparent 17%)",
            opacity: isNight ? 0.9 : 0.46,
            filter: "blur(1px)",
          }}
        />
      </div>

      <div
        className="absolute inset-y-0 -left-[24%] w-[148%]"
        style={{
          zIndex: LAYER.YARD,
          transform: `translate3d(${parallax.mid}px, 0, 0)`,
          transition: reduceMotion ? "none" : "transform 180ms linear",
        }}
      >
        <div
          className="absolute inset-x-[-10%] bottom-[30%] h-[28%]"
          style={{
            background: `linear-gradient(180deg, ${hsla(
              144,
              mix(22, 40, liveSky.daylight),
              mix(24, 42, liveSky.daylight),
              0.04
            )} 0%, ${hsla(
              134,
              mix(34, 58, liveSky.daylight),
              mix(16, 30, liveSky.daylight),
              0.22
            )} 44%, ${hsla(
              126,
              mix(40, 62, liveSky.daylight),
              mix(12, 20, liveSky.daylight),
              0.42
            )} 100%)`,
            opacity: groundPlaneOpacity,
          }}
        />
        <div
          className="absolute inset-x-[-8%] bottom-[31%] h-[7%]"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${hsla(
              46 + liveSky.warmth * 10,
              88,
              72,
              0.08 + liveSky.daylight * 0.16
            )} 54%, rgba(255,255,255,0) 100%)`,
            opacity: horizonLineOpacity,
            filter: "blur(2px)",
          }}
        />
        <div
          className="absolute inset-x-[-6%] bottom-[28%] h-[16%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 34%, rgba(15,23,42,0) 100%)",
            opacity: horizonLineOpacity,
            filter: "blur(18px)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-[30%] h-[10%]"
          style={{
            background: `linear-gradient(180deg, ${hsla(
              135,
              62,
              mix(14, 24, liveSky.daylight),
              0.06
            )} 0%, ${hsla(
              134,
              54,
              mix(18, 28, liveSky.daylight),
              0.2
            )} 55%, rgba(15,23,42,0.16) 100%)`,
          }}
        />
        <div
          className="absolute inset-x-[-6%] bottom-[24%] h-[14%]"
          style={{
            background: `linear-gradient(180deg, ${hsla(
              139,
              72,
              mix(26, 48, liveSky.daylight),
              0.12
            )} 0%, ${hsla(
              132,
              62,
              mix(18, 34, liveSky.daylight),
              0.1
            )} 36%, rgba(20,83,45,0) 100%)`,
            opacity: midGroundOpacity,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-[24%] h-[8%]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(120,53,15,0.0) 0 10px, rgba(120,53,15,0.72) 10px 14px, rgba(245,158,11,0.12) 14px 19px)",
            opacity: grassStripeOpacity,
          }}
        />
        <div
          className="absolute left-[18%] right-[18%] bottom-[17%] h-[10%] rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(250,250,249,0.08) 0%, rgba(34,197,94,0.1) 36%, rgba(20,83,45,0.08) 58%, transparent 100%)",
            filter: "blur(12px)",
            opacity: isNight ? 0.38 : 0.72,
          }}
        />
        <div
          className="absolute inset-x-[-4%] bottom-[-2%] h-[34%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(2,6,23,0) 0%, rgba(2,6,23,0.08) 34%, rgba(2,6,23,0.24) 72%, rgba(2,6,23,0.42) 100%)",
            opacity: groundVignetteOpacity,
            filter: "blur(18px)",
          }}
        />
      </div>

      <div
        className="absolute inset-y-0 -left-[28%] w-[156%]"
        style={{
          zIndex: LAYER.OBJECTS,
          transform: `translate3d(${parallax.front}px, 0, 0)`,
          transition: reduceMotion ? "none" : "transform 140ms linear",
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[30%]"
          style={{
            background: lawnBase,
          }}
        />
        <div
          className="absolute inset-x-[8%] bottom-[10%] h-[16%] rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(187,247,208,0.08) 0%, rgba(74,222,128,0.12) 22%, rgba(20,83,45,0.16) 52%, transparent 100%)",
            filter: "blur(8px)",
            opacity: isNight ? 0.4 : 0.9,
          }}
        />
        <div
          className="absolute inset-x-[-8%] bottom-[10%] h-[11%]"
          style={{
            background:
              "repeating-radial-gradient(circle at 8px 18px, rgba(134,239,172,0.18) 0 6px, transparent 7px 18px)",
            opacity: 0.55,
            animation: reduceMotion
              ? "none"
              : "dgGrassWindPulse 7.2s ease-in-out infinite, dgGrassWindBounce 9.6s ease-in-out infinite",
            transformOrigin: "50% 100%",
          }}
        />
        <div
          className="absolute inset-x-[16%] bottom-[8%] h-[10%] rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(15,23,42,0.16) 0%, rgba(15,23,42,0.1) 34%, transparent 72%)",
            filter: "blur(10px)",
            opacity: isNight ? 0.5 : 0.34,
            animation: reduceMotion
              ? "none"
              : "dgGrassWindBounce 8.4s ease-in-out infinite",
          }}
        />
        <img
          src={YARD_OBJECT_SPRITES.doghouse}
          alt=""
          className="pointer-events-none absolute left-[70%] bottom-[24%] h-[34%] w-[17%] select-none object-contain drop-shadow-[0_14px_24px_rgba(15,23,42,0.34)]"
          style={{ zIndex: doghouseBaseZIndex }}
          draggable="false"
        />
        <div
          className="absolute left-[78.5%] top-[72.2%] h-[14%] w-[7.4%] -translate-x-1/2 -translate-y-1/2"
          style={{
            zIndex: doghouseEntranceZIndex,
            borderRadius: "46% 46% 30% 30% / 40% 40% 18% 18%",
            background: dogSleepingInDoghouse
              ? "radial-gradient(circle at 50% 30%, rgba(15,23,42,0.22) 0%, rgba(15,23,42,0.7) 46%, rgba(2,6,23,0.92) 100%)"
              : "radial-gradient(circle at 50% 30%, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0.55) 42%, rgba(2,6,23,0.88) 100%)",
            boxShadow: dogSleepingInDoghouse
              ? "inset 0 8px 18px rgba(2,6,23,0.78), 0 6px 16px rgba(2,6,23,0.24)"
              : "inset 0 8px 18px rgba(2,6,23,0.62), 0 6px 16px rgba(2,6,23,0.18)",
            filter: "blur(0.4px)",
          }}
        />
        <div
          className="absolute left-[25.5%] top-[60.5%] h-[7%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
          style={{
            zIndex: getDepthZIndex(0.61, -5),
            background:
              "radial-gradient(ellipse at center, rgba(15,23,42,0.34) 0%, rgba(15,23,42,0.18) 42%, transparent 100%)",
            filter: "blur(8px)",
            opacity: isNight ? 0.72 : 0.54,
          }}
        />
        <div
          className="absolute left-[25.5%] top-[61.5%] h-[10%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
          style={{
            zIndex: getDepthZIndex(0.62, -6),
            background:
              "radial-gradient(ellipse at center, rgba(2,6,23,0.18) 0%, rgba(15,23,42,0.08) 48%, transparent 100%)",
            filter: "blur(16px)",
            opacity: isNight ? 0.68 : 0.42,
          }}
        />
        <img
          src={YARD_OBJECT_SPRITES.tree}
          alt=""
          className="pointer-events-none absolute left-[25.5%] top-[58%] h-[42%] w-[17%] -translate-x-1/2 -translate-y-full select-none object-contain drop-shadow-[0_20px_34px_rgba(15,23,42,0.3)]"
          style={{
            zIndex: treeBaseZIndex,
            animation: reduceMotion
              ? "none"
              : "dgTreeWindPulse 8.8s ease-in-out infinite, dgTreeWindBounce 10.8s ease-in-out infinite",
            transformOrigin: "50% 100%",
            filter: "drop-shadow(0 16px 26px rgba(15,23,42,0.22)) blur(0.15px)",
          }}
          draggable="false"
        />
      </div>

      <div
        className={`absolute inset-0 ${sunriseOpacity > 0 ? "is-sunrise" : ""}`}
        style={{ zIndex: LAYER.OVERLAY }}
      >
        <div
          id="bg-night"
          className="yard-background absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.42) 0%, rgba(30,41,59,0.18) 42%, rgba(2,6,23,0.52) 100%)",
            opacity: liveNightOpacity,
          }}
        />
        <div
          id="bg-sunrise"
          className="yard-background absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(251,191,36,0.18) 0%, rgba(251,146,60,0.16) 30%, rgba(254,240,138,0.08) 58%, rgba(255,255,255,0) 100%)",
            opacity: sunriseOpacity,
          }}
        />
      </div>

      {renderProps({ props, activePropId, onPropTap })}
      {renderEnvironmentTargets({
        targets: environmentTargets,
        activeTargetId: activeEnvironmentTargetId,
        environment,
      })}
      {renderFrontOccluders([
        {
          key: "yard-tree-trunk-front",
          xNorm: 0.245,
          yNorm: 0.64,
          width: "4.6%",
          height: "18%",
          borderRadius: "999px",
          background:
            "linear-gradient(180deg, rgba(101,67,33,0.96) 0%, rgba(69,39,18,0.98) 100%)",
          boxShadow: "0 -4px 12px rgba(15,23,42,0.18)",
          filter: "blur(0.3px)",
          zOffset: 10,
        },
      ])}
        <img
          src={YARD_OBJECT_SPRITES.doghouseFront}
          alt=""
          className="pointer-events-none absolute left-[70%] bottom-[24%] h-[34%] w-[17%] select-none object-contain"
          style={{ zIndex: doghouseFrontZIndex }}
        draggable="false"
      />
    </div>
  );
}
