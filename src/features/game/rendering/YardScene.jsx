import { clamp, toPercent } from "./sceneTokens.js";

function getHotspotKind(id = "") {
  const value = String(id || "")
    .trim()
    .toLowerCase();
  if (value.includes("tree")) return "tree";
  if (value.includes("doghouse")) return "doghouse";
  if (
    value.includes("bowl") ||
    value.includes("food") ||
    value.includes("water")
  )
    return "bowl";
  if (value.includes("hole")) return "hole";
  if (value.includes("bone")) return "bone";
  if (value.includes("flower")) return "flower";
  return "spark";
}

function HotspotButton({ item, active = false, onTap }) {
  const kind = getHotspotKind(item?.id || item?.label);
  const xNorm = clamp(Number(item?.xNorm || 0.5), 0.04, 0.96);
  const yNorm = clamp(Number(item?.yNorm || 0.72), 0.08, 0.94);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onTap?.(item?.id);
      }}
      className="absolute z-[26] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border transition"
      style={{
        left: toPercent(xNorm),
        top: toPercent(yNorm),
        borderColor: active
          ? "rgba(251, 191, 36, 0.65)"
          : "rgba(255,255,255,0.18)",
        background: active
          ? "radial-gradient(circle at center, rgba(251,191,36,0.28), rgba(251,191,36,0.08) 62%, rgba(255,255,255,0) 100%)"
          : "radial-gradient(circle at center, rgba(255,255,255,0.14), rgba(255,255,255,0.04) 60%, rgba(255,255,255,0) 100%)",
        boxShadow: active
          ? "0 0 26px rgba(251,191,36,0.28)"
          : "0 8px 18px rgba(2,6,23,0.18)",
      }}
      aria-label={item?.label || kind}
    >
      <span className="pointer-events-none text-sm text-white/90">
        {kind === "tree"
          ? "🌳"
          : kind === "doghouse"
            ? "🏠"
            : kind === "bowl"
              ? "🥣"
              : kind === "hole"
                ? "🕳️"
                : kind === "bone"
                  ? "🦴"
                  : kind === "flower"
                    ? "✿"
                    : "•"}
      </span>
    </button>
  );
}

<<<<<<< HEAD
function PawPrintLayer({ pawPrints = [] }) {
  if (!Array.isArray(pawPrints) || !pawPrints.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[21] overflow-hidden">
=======
export function InteractionOverlay({
  investigationProps,
  activePropId,
  onPropTap,
  pawPrints,
  showBowlHint,
}) {
  return (
    <div className="absolute inset-0 z-[60]">
      {Array.isArray(investigationProps) &&
        investigationProps.map((item) => (
          <HotspotButton
            key={item.id}
            item={item}
            active={item.id === activePropId}
            onTap={onPropTap}
          />
        ))}
      {showBowlHint && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[28] -translate-x-1/2 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/78 backdrop-blur-sm">
          Tap the grass to place the bowl
        </div>
      )}
      <PawPrintLayer pawPrints={pawPrints} />
    </div>
  );
}

export function ForegroundOverlay({ isNight, weather }) {
  const weatherKey = String(weather || "clear").toLowerCase();
  const isRainy = weatherKey.includes("rain") || weatherKey.includes("storm");
  const isSnowy = weatherKey.includes("snow") || weatherKey.includes("sleet");

  const filters = [];
  if (isNight) {
    // Deep night tint: darker and colder (blue/purple shift)
    filters.push(
      "brightness(0.55) saturate(0.7) sepia(0.2) hue-rotate(190deg)"
    );
  }
  if (isRainy) {
    // Overcast/Rainy: greyish and muted
    filters.push("brightness(0.8) saturate(0.6) contrast(1.05)");
  } else if (isSnowy) {
    // Snowy: bright reflection and very cold/desaturated
    filters.push("brightness(1.1) saturate(0.4)");
  }

  const filterStyle = filters.length > 0 ? filters.join(" ") : "none";

  return (
    <div
      className="absolute inset-x-0 bottom-0 h-[12%] pointer-events-none z-50 opacity-90 transition-[filter] duration-1000"
      style={{
        background:
          "linear-gradient(180deg, rgba(88,170,78,0), rgba(45,112,50,0.82) 38%, rgba(27,77,36,0.96) 100%)",
        filter: filterStyle,
      }}
    />
  );
}

export function PawPrintLayer({ pawPrints = [] }) {
  if (!Array.isArray(pawPrints) || !pawPrints.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[21] overflow-hidden opacity-60">
>>>>>>> 10f88903 (chore: remove committed backup folders)
      {pawPrints.slice(-12).map((print) => (
        <span
          key={print.id}
          className="absolute block rounded-full"
          style={{
            left: `${Number(print.x || 0)}px`,
            top: `${Number(print.y || 0)}px`,
            width: `${Math.max(8, Number(print.size || 16))}px`,
            height: `${Math.max(8, Number(print.size || 16))}px`,
            transform: `translate(-50%, -50%) rotate(${Number(print.rot || 0)}deg)`,
            background: `radial-gradient(circle at center, ${print.fill || "rgba(70,46,30,0.45)"} 0%, rgba(0,0,0,0) 72%)`,
            opacity: 0.65,
            filter: "blur(0.4px)",
          }}
        />
      ))}
    </div>
  );
}

export default function YardScene({
  layout,
  environment = "yard",
  isNight = false,
  weather = "clear",
  reduceMotion = false,
  investigationProps = [],
  activePropId = "",
  onPropTap,
  pawPrints = [],
  fireflySeeds = [],
  showFireflies = false,
  showBowlHint = false,
}) {
  const weatherKey = String(weather || "clear")
    .trim()
    .toLowerCase();
  const indoor =
    String(environment || "yard")
      .trim()
      .toLowerCase() === "apartment";
  const dogXNorm = clamp(Number(layout?.dog?.xNorm || 0.5), 0.08, 0.92);
  const dogGroundYNorm = clamp(
    Number(layout?.dog?.groundYNorm || 0.8),
    0.56,
    0.93
  );
  const dogFocusX = toPercent(dogXNorm);
  const dogFocusY = toPercent(clamp(dogGroundYNorm - 0.12, 0.2, 0.82));
  const dogFocusXPercent = `${Math.round(dogXNorm * 100)}%`;
  const showRain =
    !indoor && (weatherKey.includes("rain") || weatherKey.includes("storm"));
  const showSnow =
    !indoor && (weatherKey.includes("snow") || weatherKey.includes("sleet"));
  const skyBackground = indoor
    ? "linear-gradient(180deg, #3c4b57 0%, #29343d 52%, #141c22 100%)"
    : isNight
      ? "linear-gradient(180deg, #0f1833 0%, #1d325a 44%, #163126 100%)"
      : "linear-gradient(180deg, #8fd2ff 0%, #d8f1ff 48%, #74b86d 100%)";
  const atmosphereOverlay = indoor
    ? "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 46%, rgba(0,0,0,0.08) 100%)"
    : isNight
      ? "linear-gradient(180deg, rgba(10,18,40,0.1) 0%, rgba(13,24,52,0.22) 44%, rgba(4,10,22,0.28) 100%)"
      : "linear-gradient(180deg, rgba(255,250,225,0.16) 0%, rgba(255,255,255,0.06) 42%, rgba(16,80,44,0.07) 100%)";
  const horizonGlow = indoor
    ? "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0))"
    : isNight
      ? "linear-gradient(180deg, rgba(176,208,255,0.16), rgba(176,208,255,0))"
      : "linear-gradient(180deg, rgba(255,243,195,0.34), rgba(255,243,195,0))";

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="absolute inset-0" style={{ background: skyBackground }} />
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{ background: atmosphereOverlay }}
      />
      {!indoor && isNight ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-[26%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(214,228,255,0.16) 0%, rgba(214,228,255,0.06) 42%, rgba(214,228,255,0) 74%)",
          }}
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-x-0 top-[30%] z-[5] h-[18%]"
        style={{
          background: horizonGlow,
        }}
      />
      <div
        className="pointer-events-none absolute z-[11] rounded-full"
        style={{
          left: dogFocusX,
          top: dogFocusY,
          width: indoor ? "34%" : "40%",
          height: indoor ? "26%" : "30%",
          transform: "translate(-50%, -50%)",
          background: indoor
            ? "radial-gradient(ellipse at center, rgba(255,230,190,0.13) 0%, rgba(255,230,190,0.05) 46%, rgba(255,230,190,0) 100%)"
            : isNight
              ? "radial-gradient(ellipse at center, rgba(187,247,208,0.16) 0%, rgba(187,247,208,0.07) 48%, rgba(187,247,208,0) 100%)"
              : "radial-gradient(ellipse at center, rgba(255,245,200,0.26) 0%, rgba(255,245,200,0.11) 48%, rgba(255,245,200,0) 100%)",
          filter: "blur(8px)",
        }}
      />

      {!indoor ? (
        <>
          <div
            className="pointer-events-none absolute left-1/2 top-[15%] h-[34%] w-[44%] -translate-x-1/2 rounded-full"
            style={{
              background: isNight
                ? "radial-gradient(circle at center, rgba(250,245,220,0.26) 0%, rgba(180,214,255,0.1) 48%, rgba(255,255,255,0) 100%)"
                : "radial-gradient(circle at center, rgba(255,248,210,0.68) 0%, rgba(255,248,210,0.18) 52%, rgba(255,255,255,0) 100%)",
              filter: "blur(10px)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-[36%] z-[4] h-[18%]"
            style={{
              background: isNight
                ? "linear-gradient(180deg, rgba(35,70,52,0.95), rgba(18,42,28,0.98))"
                : "linear-gradient(180deg, rgba(94,150,98,0.95), rgba(49,92,54,0.98))",
              clipPath:
                "polygon(0 60%, 7% 54%, 15% 58%, 24% 46%, 35% 61%, 47% 48%, 58% 58%, 70% 42%, 81% 58%, 91% 45%, 100% 60%, 100% 100%, 0 100%)",
            }}
          />
          <div className="absolute inset-x-0 top-[48%] z-[7] h-[16%]">
            <div className="absolute inset-x-0 top-[18%] h-[9%] bg-[#e1b072]/92" />
            <div className="absolute inset-x-0 top-[56%] h-[8%] bg-[#905728]/95" />
            <div
              className="absolute inset-x-0 top-[8%] h-[62%]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0 2.6%, rgba(157,100,47,0.98) 2.6% 3.9%, transparent 3.9% 6.9%)",
                opacity: 0.92,
              }}
            />
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-x-0 top-[34%] z-[5] h-[16%] bg-[linear-gradient(180deg,rgba(210,220,228,0.16),rgba(210,220,228,0.05))]" />
          <div className="absolute inset-x-0 bottom-[38%] z-[8] h-[4%] bg-white/6" />
        </>
      )}

      <div
        className="absolute inset-x-0 bottom-0 z-[10] h-[42%]"
        style={{
          background: indoor
            ? "linear-gradient(180deg, #5b472f 0%, #3a291a 100%)"
            : isNight
              ? "linear-gradient(180deg, #3b7b49 0%, #1d4629 55%, #14311d 100%)"
              : "linear-gradient(180deg, #6ec46f 0%, #3c8b45 58%, #2a5d31 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute z-[16] rounded-full"
        style={{
          left: dogFocusX,
          top: toPercent(dogGroundYNorm),
          width: indoor ? "32%" : "38%",
          height: "8%",
          transform: "translate(-50%, -50%)",
          background: indoor
            ? "radial-gradient(ellipse at center, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 100%)"
            : "radial-gradient(ellipse at center, rgba(20,40,24,0.34) 0%, rgba(20,40,24,0) 100%)",
          filter: "blur(3px)",
        }}
      />
      <div
        className="absolute left-1/2 bottom-[13%] z-[12] h-[24%] w-[34%] -translate-x-1/2 rounded-[999px]"
        style={{
          background: indoor
            ? "radial-gradient(ellipse at center, rgba(192,155,104,0.6) 0%, rgba(192,155,104,0.16) 55%, rgba(0,0,0,0) 100%)"
            : "radial-gradient(ellipse at center, rgba(199,167,112,0.85) 0%, rgba(199,167,112,0.26) 58%, rgba(0,0,0,0) 100%)",
          filter: "blur(2px)",
        }}
      />

      {!indoor ? (
        <>
          <div
            className="absolute z-[13]"
            style={{
              left: toPercent(layout?.props?.tree?.xNorm || 0.14),
              top: toPercent(layout?.props?.tree?.yNorm || 0.61),
              width: `${(layout?.props?.tree?.widthRatio || 0.18) * 100}%`,
              height: `${(layout?.props?.tree?.heightRatio || 0.46) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="absolute bottom-0 left-1/2 h-[46%] w-[16%] -translate-x-1/2 rounded-[18px] bg-[linear-gradient(180deg,#8a5a34,#533016)]" />
            <div className="absolute left-[12%] top-[5%] h-[44%] w-[58%] rounded-full bg-[radial-gradient(circle_at_40%_38%,#a4ef9b_0%,#4b9956_58%,#285933_100%)]" />
            <div className="absolute right-[8%] top-[12%] h-[36%] w-[52%] rounded-full bg-[radial-gradient(circle_at_40%_38%,#9de38d_0%,#428b4d_58%,#234f2d_100%)]" />
            <div className="absolute left-[26%] top-0 h-[34%] w-[42%] rounded-full bg-[radial-gradient(circle_at_40%_36%,#b4f1a5_0%,#539a58_58%,#2a5a34_100%)]" />
          </div>
          <div
            className="absolute z-[14]"
            style={{
              left: toPercent(layout?.props?.doghouse?.xNorm || 0.82),
              top: toPercent(layout?.props?.doghouse?.yNorm || 0.71),
              width: `${(layout?.props?.doghouse?.widthRatio || 0.22) * 100}%`,
              height: `${(layout?.props?.doghouse?.heightRatio || 0.24) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="absolute inset-x-[10%] bottom-0 h-[64%] rounded-[26px] bg-[linear-gradient(180deg,#b67a44,#7a4c29)] shadow-[0_18px_24px_rgba(15,23,42,0.18)]" />
            <div className="absolute inset-x-0 top-[10%] h-[34%] bg-[linear-gradient(180deg,#cf6838,#8f4121)] [clip-path:polygon(0_100%,50%_8%,100%_100%)]" />
            <div className="absolute left-1/2 bottom-0 h-[46%] w-[34%] -translate-x-1/2 rounded-t-[40px] bg-[#1a2230]" />
          </div>
        </>
      ) : (
        <>
          <div className="absolute left-[14%] top-[26%] z-[13] h-[30%] w-[18%] rounded-[28px] bg-[linear-gradient(180deg,#d6c4a1,#9d7b55)] shadow-[0_20px_28px_rgba(2,6,23,0.18)]" />
          <div className="absolute right-[10%] top-[32%] z-[13] h-[22%] w-[28%] rounded-[28px] bg-[linear-gradient(180deg,#58697a,#34404b)] shadow-[0_20px_28px_rgba(2,6,23,0.18)]" />
        </>
      )}

      <div
        className="absolute z-[15]"
        style={{
          left: toPercent(layout?.props?.bowl?.xNorm || 0.28),
          top: toPercent(layout?.props?.bowl?.yNorm || 0.83),
          width: `${(layout?.props?.bowl?.widthRatio || 0.09) * 100}%`,
          height: `${(layout?.props?.bowl?.heightRatio || 0.05) * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="absolute inset-x-[18%] bottom-0 h-[58%] rounded-b-[999px] border border-white/18 bg-[linear-gradient(180deg,#7c8fa4,#3e4a5a)]" />
        <div className="absolute inset-x-[12%] top-0 h-[38%] rounded-full border border-sky-100/60 bg-[linear-gradient(180deg,#c5e7ff,#6aafe0)]" />
      </div>

      {showRain ? (
        <div className="pointer-events-none absolute inset-0 z-[18] overflow-hidden opacity-70">
          <div
            className="absolute -inset-[18%]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(106deg, rgba(191,219,254,0) 0px, rgba(191,219,254,0) 10px, rgba(191,219,254,0.76) 11px, rgba(191,219,254,0.76) 12px)",
              animation: reduceMotion
                ? "none"
                : "dgViewportRain 0.68s linear infinite",
            }}
          />
        </div>
      ) : null}
      {showSnow ? (
        <div className="pointer-events-none absolute inset-0 z-[18] overflow-hidden opacity-80">
          <div
            className="absolute -inset-[15%]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.92) 0 1.2px, transparent 1.4px)",
              backgroundSize: "18px 18px",
              animation: reduceMotion
                ? "none"
                : "dgSnowFall 1.9s linear infinite",
            }}
          />
        </div>
      ) : null}

      {showFireflies && Array.isArray(fireflySeeds) && fireflySeeds.length ? (
        <div className="pointer-events-none absolute inset-0 z-[19]">
          {fireflySeeds.slice(0, 7).map((seed) => (
            <span
              key={`scene-firefly-${seed.id}`}
              className="absolute block h-2 w-2 rounded-full"
              style={{
                left: `${seed.x}%`,
                top: `${seed.y}%`,
                background:
                  "radial-gradient(circle at center, rgba(252,211,77,0.95) 0%, rgba(250,204,21,0.16) 70%, transparent 100%)",
                boxShadow: "0 0 10px rgba(250,204,21,0.52)",
                animation: reduceMotion
                  ? "none"
                  : `dgFireflyPulse ${seed.duration}s ease-in-out ${seed.delay}s infinite, dgFireflyDrift ${Math.max(3, seed.duration + 0.8)}s ease-in-out ${seed.delay}s infinite`,
              }}
            />
          ))}
        </div>
      ) : null}

      {Array.isArray(investigationProps)
        ? investigationProps.map((item) => (
            <HotspotButton
              key={item.id}
              item={item}
              active={item.id === activePropId}
              onTap={onPropTap}
            />
          ))
        : null}

      {showBowlHint ? (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[28] -translate-x-1/2 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/78 backdrop-blur-sm">
          Tap the grass to place the bowl
        </div>
      ) : null}

      <PawPrintLayer pawPrints={pawPrints} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[30] h-[24%] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(9,14,19,0.14)_48%,rgba(9,14,19,0.36)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 z-[31] rounded-[inherit]"
        style={{
          background: isNight
            ? `radial-gradient(ellipse at ${dogFocusXPercent} 72%, rgba(228,240,255,0.09) 0%, rgba(228,240,255,0) 44%), linear-gradient(180deg, rgba(6,10,22,0) 64%, rgba(6,10,22,0.2) 100%)`
            : `radial-gradient(ellipse at ${dogFocusXPercent} 72%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 44%), linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(0,0,0,0.1) 100%)`,
          boxShadow: isNight
            ? "inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 -88px 120px rgba(0,0,0,0.22)"
            : "inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 -72px 110px rgba(0,0,0,0.13)",
        }}
      />
    </div>
  );
}
