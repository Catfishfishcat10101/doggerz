// src/features/game/StageProps.jsx
import { toPercent } from "./rendering/sceneTokens.js";

function getWeatherState(weather) {
  const key = String(weather || "clear").toLowerCase();
  return {
    rainy:
      key.includes("rain") || key.includes("storm") || key.includes("drizzle"),
    snowy: key.includes("snow") || key.includes("sleet"),
  };
}

function getSceneFilter({ isNight, rainy, snowy }) {
  const filters = [];
  if (isNight) filters.push("brightness(0.58) saturate(0.76)");
  if (rainy) filters.push("brightness(0.86) saturate(0.72) contrast(1.04)");
  if (snowy) filters.push("brightness(1.06) saturate(0.58)");
  return filters.join(" ") || "none";
}

export function StageProps({ layout, isNight, weather, reduceMotion }) {
  const tree = layout?.props?.tree;
  const doghouse = layout?.props?.doghouse;
  const dogX = layout?.dog?.xNorm || 0.5;
  const dogY = layout?.dog?.groundYNorm || 0.74;
  const mobile = Boolean(layout?.mobile);
  const { rainy, snowy } = getWeatherState(weather);
  const filter = getSceneFilter({ isNight, rainy, snowy });
  const showTree = !mobile;
  const shadowColor = isNight
    ? "rgba(0,0,0,0.56)"
    : rainy
      ? "rgba(8,18,14,0.34)"
      : "rgba(20,44,18,0.28)";

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 select-none"
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-[-2%] top-[46%] h-[11%] opacity-80"
        style={{
          filter,
          background:
            "linear-gradient(180deg,rgba(214,176,126,0.92) 0 14%,transparent 14% 44%,rgba(134,88,50,0.96) 44% 56%,transparent 56%),repeating-linear-gradient(90deg,rgba(128,84,49,0.88) 0 10px,rgba(91,57,33,0.9) 10px 13px,transparent 13px 68px)",
          boxShadow: "0 10px 28px rgba(2,6,23,0.08)",
        }}
      />

      {showTree ? (
        <div
          className="absolute"
          style={{
            left: toPercent(tree?.xNorm || 0.12),
            top: toPercent(tree?.yNorm || 0.62),
            width: `${(tree?.widthRatio || 0.18) * 100}%`,
            height: `${(tree?.heightRatio || 0.46) * 100}%`,
            transform: "translate(-50%, -100%)",
            filter,
            animation: reduceMotion
              ? "none"
              : "dgPremiumTreeSway 10s ease-in-out infinite",
            transformOrigin: "50% 100%",
          }}
        >
          <div className="absolute bottom-0 left-1/2 h-[48%] w-[13%] -translate-x-1/2 rounded-[18px] bg-[linear-gradient(180deg,#8b6243,#4c3121)] shadow-[10px_14px_22px_rgba(2,6,23,0.16)]" />
          <div className="absolute left-[16%] top-[13%] h-[40%] w-[56%] rounded-full bg-[radial-gradient(circle_at_38%_34%,#8fcf7d_0%,#477747_62%,#25472d_100%)] opacity-95" />
          <div className="absolute right-[10%] top-[18%] h-[34%] w-[50%] rounded-full bg-[radial-gradient(circle_at_36%_34%,#83bd75_0%,#3e6b42_62%,#223f2a_100%)] opacity-95" />
          <div className="absolute left-[28%] top-[3%] h-[32%] w-[42%] rounded-full bg-[radial-gradient(circle_at_38%_34%,#9edb8c_0%,#4b7f49_62%,#24472d_100%)] opacity-95" />
        </div>
      ) : null}

      <div
        className="absolute"
        style={{
          left: toPercent(doghouse?.xNorm || 0.84),
          top: toPercent(doghouse?.yNorm || 0.72),
          width: `${(doghouse?.widthRatio || 0.22) * 100}%`,
          height: `${(doghouse?.heightRatio || 0.24) * 100}%`,
          transform: "translate(-50%, -100%)",
          filter,
        }}
      >
        <div className="absolute inset-x-[13%] bottom-0 h-[61%] rounded-[18px] bg-[linear-gradient(180deg,#9d6747,#6b442d)] shadow-[0_18px_24px_rgba(2,6,23,0.2)]" />
        <div className="absolute inset-x-[2%] top-[10%] h-[34%] rounded-sm bg-[linear-gradient(180deg,#6e4533,#3f2920)] [clip-path:polygon(0_100%,50%_2%,100%_100%)] shadow-[0_10px_20px_rgba(2,6,23,0.18)]" />
        <div className="absolute left-1/2 bottom-0 h-[42%] w-[30%] -translate-x-1/2 rounded-t-[36px] bg-[#172029]" />
        <div className="absolute inset-x-[17%] bottom-[56%] h-[8%] rounded-full bg-white/8" />
      </div>

      {rainy ? (
        <>
          <div
            className="absolute inset-x-[8%] bottom-[13%] h-[11%] rounded-[50%] opacity-28 blur-[2px]"
            style={{
              background:
                "radial-gradient(ellipse at center,rgba(218,238,248,0.34),rgba(218,238,248,0.08) 48%,rgba(218,238,248,0) 72%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[42%] opacity-20"
            style={{
              background:
                "linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04) 46%,rgba(255,255,255,0))",
              mixBlendMode: "overlay",
              animation: reduceMotion
                ? "none"
                : "dgWetSheen 6s ease-in-out infinite",
            }}
          />
        </>
      ) : null}

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-[5px]"
        style={{
          left: toPercent(dogX),
          top: toPercent(dogY),
          width: mobile ? "28%" : "15%",
          height: mobile ? "5.2%" : "4%",
          background: shadowColor,
          animation: reduceMotion
            ? "none"
            : "dgShadowPulse 4.8s ease-in-out infinite",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 z-50 h-[14%] opacity-88"
        style={{
          filter,
          background:
            "linear-gradient(180deg,rgba(46,103,48,0),rgba(46,103,48,0.5) 34%,rgba(21,64,35,0.94) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-50 h-[18%] opacity-48"
        style={{
          backgroundImage:
            "linear-gradient(86deg,rgba(255,255,255,0.16) 0 1px,transparent 1px),linear-gradient(96deg,rgba(0,0,0,0.18) 0 1px,transparent 1px)",
          backgroundSize: "16px 100%,21px 100%",
          animation: reduceMotion
            ? "none"
            : "dgGrassBreathe 7s ease-in-out infinite",
        }}
      />
    </div>
  );
}
