import { useMemo } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Number(Number(value || 0).toFixed(2));
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

export default function YardBackdrop({
  environment = "yard",
  dogXNorm = 0.5,
  isNight = false,
  sunriseProgress = 0,
  reduceMotion = false,
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
    </div>
  );
}
