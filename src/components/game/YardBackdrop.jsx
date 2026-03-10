// src/components/game/YardBackdrop.jsx

import { useMemo } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Number(Number(value || 0).toFixed(2));
}

function getDepthZIndex(yNorm, offset = 0) {
  return Math.max(
    4,
    Math.round(15 + clamp(Number(yNorm || 0.5), 0, 1) * 20) + offset
  );
}

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
  environmentTargets = [],
  activeEnvironmentTargetId = "",
  props = [],
  activePropId = "",
  onPropTap = null,
}) {
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

  if (environmentKey === "apartment") {
    const windowGlow = isNight
      ? "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.84) 100%)"
      : "linear-gradient(180deg, rgba(186,230,253,0.95) 0%, rgba(125,211,252,0.88) 100%)";

    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
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
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,41,59,0.12) 0%, rgba(8,47,73,0.1) 34%, rgba(12,74,110,0.08) 100%)",
        }}
      />

      <div
        className="absolute inset-y-0 -left-[22%] w-[144%]"
        style={{
          transform: `translate3d(${parallax.back}px, 0, 0)`,
          transition: reduceMotion ? "none" : "transform 220ms linear",
        }}
      >
        <div className="absolute inset-x-0 top-[7%] h-[26%] rounded-[50%] bg-cyan-100/10 blur-3xl" />
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
          transform: `translate3d(${parallax.mid}px, 0, 0)`,
          transition: reduceMotion ? "none" : "transform 180ms linear",
        }}
      >
        <div className="absolute inset-x-0 bottom-[26%] h-[18%] bg-[linear-gradient(180deg,rgba(20,83,45,0.08),rgba(20,83,45,0.24))]" />
        <div
          className="absolute inset-x-0 bottom-[30%] h-[10%]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(120,53,15,0.0) 0 10px, rgba(120,53,15,0.72) 10px 14px, rgba(245,158,11,0.12) 14px 19px)",
            opacity: isNight ? 0.5 : 0.66,
          }}
        />
      </div>

      <div
        className="absolute inset-y-0 -left-[28%] w-[156%]"
        style={{
          transform: `translate3d(${parallax.front}px, 0, 0)`,
          transition: reduceMotion ? "none" : "transform 140ms linear",
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[24%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(34,197,94,0.08) 0%, rgba(22,101,52,0.24) 45%, rgba(20,83,45,0.4) 100%)",
          }}
        />
        <div
          className="absolute inset-x-[-8%] bottom-[10%] h-[11%]"
          style={{
            background:
              "repeating-radial-gradient(circle at 8px 18px, rgba(134,239,172,0.18) 0 6px, transparent 7px 18px)",
            opacity: 0.55,
          }}
        />
        <div className="absolute left-[70%] bottom-[25%] h-[32%] w-[16%]">
          <div className="absolute left-[18%] top-[18%] h-[34%] w-[64%] rounded-[18px_18px_10px_10px] border border-amber-100/15 bg-[linear-gradient(180deg,#854d0e_0%,#713f12_100%)] shadow-[0_14px_24px_rgba(15,23,42,0.28)]" />
          <div className="absolute left-[10%] top-[8%] h-[20%] w-[80%] rounded-[16px_16px_10px_10px] bg-[linear-gradient(180deg,#b45309_0%,#92400e_100%)]" />
          <div className="absolute left-[38%] top-[38%] h-[12%] w-[14%] rounded-full bg-slate-950/35" />
        </div>
        <div className="absolute left-[18%] bottom-[25%] h-[40%] w-[16%]">
          <div className="absolute left-[28%] top-[28%] h-[54%] w-[16%] rounded-full bg-[linear-gradient(180deg,#5b3b1a_0%,#3f2a16_100%)] shadow-[0_10px_14px_rgba(15,23,42,0.22)]" />
          <div className="absolute left-[2%] top-[0%] h-[44%] w-[90%] rounded-full bg-[radial-gradient(circle_at_center,#4ade80_0%,rgba(34,197,94,0.92)_36%,rgba(22,101,52,0.95)_70%,rgba(20,83,45,0.82)_100%)] shadow-[0_18px_26px_rgba(15,23,42,0.24)]" />
        </div>
      </div>

      <div
        className={`absolute inset-0 ${sunriseOpacity > 0 ? "is-sunrise" : ""}`}
      >
        <div
          id="bg-night"
          className="yard-background absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.42) 0%, rgba(30,41,59,0.18) 42%, rgba(2,6,23,0.52) 100%)",
            opacity: nightOpacity,
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
          yNorm: 0.73,
          width: "4.6%",
          height: "22%",
          borderRadius: "999px",
          background:
            "linear-gradient(180deg, rgba(101,67,33,0.96) 0%, rgba(69,39,18,0.98) 100%)",
          boxShadow: "0 -4px 12px rgba(15,23,42,0.18)",
          zOffset: 2,
        },
        {
          key: "yard-doghouse-front",
          xNorm: 0.78,
          yNorm: 0.76,
          width: "18%",
          height: "16%",
          borderRadius: "24px 24px 16px 16px",
          background:
            "linear-gradient(180deg, rgba(180,83,9,0.97) 0%, rgba(146,64,14,0.99) 100%)",
          border: "1px solid rgba(254,215,170,0.16)",
          boxShadow: "0 -6px 18px rgba(15,23,42,0.24)",
          zOffset: 2,
        },
        {
          key: "yard-doghouse-door-shadow",
          xNorm: 0.78,
          yNorm: 0.79,
          width: "7%",
          height: "11%",
          borderRadius: "999px 999px 18px 18px",
          background:
            "radial-gradient(circle at center top, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.72) 78%, rgba(15,23,42,0.92) 100%)",
          opacity: 0.82,
          zOffset: 3,
        },
      ])}
    </div>
  );
}
