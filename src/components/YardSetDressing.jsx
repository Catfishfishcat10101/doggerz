/** @format */

// src/components/YardSetDressing.jsx
// Lightweight "props" layer for the yard stage.
// - Covers the pool (we don't have background-painting tools in code)
// - Adds a dog house + back door + porch light so day/night feel like the same yard
// - Adds a food bowl prop so "eat" feels grounded

import {
  YARD_PROP_POSITIONS,
  YARD_PROP_SIZES,
} from "@/features/game/yardProps.js";

function RestPadSvg({ isNight }) {
  const base = isNight ? "#6b4f3a" : "#a16207";
  const cushion = isNight ? "#b45309" : "#f59e0b";

  return (
    <svg viewBox="0 0 240 120" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="120" cy="96" rx="90" ry="10" fill="rgba(0,0,0,0.28)" />
      <rect x="24" y="36" width="192" height="52" rx="26" fill={base} />
      <rect x="36" y="44" width="168" height="38" rx="20" fill={cushion} />
      <path
        d="M52 58c18-10 118-10 136 0"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FoodBowlSvg() {
  return (
    <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="60" cy="54" rx="46" ry="10" fill="rgba(0,0,0,0.25)" />
      <path
        d="M20 46c0-14 18-26 40-26s40 12 40 26c0 10-10 18-22 18H42C30 64 20 56 20 46z"
        fill="#d97706"
      />
      <path
        d="M30 44c0-10 14-18 30-18s30 8 30 18c0 7-7 12-16 12H46c-9 0-16-5-16-12z"
        fill="#f59e0b"
      />
      <path
        d="M32 40c8 2 18 2 26 0"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WaterBowlSvg() {
  return (
    <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="60" cy="54" rx="44" ry="9" fill="rgba(0,0,0,0.22)" />
      <path
        d="M22 46c0-12 17-23 38-23s38 11 38 23c0 9-9 16-21 16H43C31 62 22 55 22 46z"
        fill="#94a3b8"
      />
      <path
        d="M32 44c0-9 12-16 28-16s28 7 28 16c0 6-7 11-15 11H47c-8 0-15-5-15-11z"
        fill="#38bdf8"
      />
      <path
        d="M36 40c6 3 18 4 24 2 6-2 10-4 18-2"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BallSvg() {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%" aria-hidden="true">
      <circle cx="40" cy="44" r="22" fill="#f97316" />
      <path d="M22 40 C 30 32, 50 32, 58 40" stroke="rgba(255,255,255,0.55)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="36" r="4" fill="rgba(255,255,255,0.65)" />
    </svg>
  );
}

export default function YardSetDressing({ isNight, onBowl, onWaterBowl, onBall, onDogHouse }) {
  // Positions are percentages of the yard stage.
  // Keep these stable so the dog can interact near the bowl.
  const hasInteraction =
    typeof onBowl === 'function' ||
    typeof onWaterBowl === 'function' ||
    typeof onBall === 'function' ||
    typeof onDogHouse === 'function';
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={!hasInteraction}>
      {/* Rest pad */}
      {typeof onDogHouse === 'function' ? (
        <button
          type="button"
          aria-label="Rest pad"
          className="pointer-events-auto absolute"
          onClick={onDogHouse}
          style={{
            left: `${YARD_PROP_POSITIONS.house.x}%`,
            top: `${YARD_PROP_POSITIONS.house.y}%`,
            width: YARD_PROP_SIZES.house.width,
            height: YARD_PROP_SIZES.house.height,
            transform: 'translate(-50%, -50%)',
            filter: isNight
              ? 'drop-shadow(0 18px 36px rgba(0,0,0,0.45))'
              : 'drop-shadow(0 16px 30px rgba(0,0,0,0.25))',
            opacity: isNight ? 0.95 : 1,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <RestPadSvg isNight={isNight} />
        </button>
      ) : (
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${YARD_PROP_POSITIONS.house.x}%`,
              top: `${YARD_PROP_POSITIONS.house.y}%`,
              width: YARD_PROP_SIZES.house.width,
              height: YARD_PROP_SIZES.house.height,
              transform: 'translate(-50%, -50%)',
              filter: isNight
                ? 'drop-shadow(0 18px 36px rgba(0,0,0,0.45))'
                : 'drop-shadow(0 16px 30px rgba(0,0,0,0.25))',
              opacity: isNight ? 0.95 : 1,
            }}
          >
            <RestPadSvg isNight={isNight} />
          </div>
      )}

      {/* Food bowl (fixed spot) */}
      {typeof onBowl === 'function' ? (
        <button
          type="button"
          aria-label="Food bowl"
          className="pointer-events-auto absolute"
          onClick={onBowl}
          style={{
            left: `${YARD_PROP_POSITIONS.bowl.x}%`,
            top: `${YARD_PROP_POSITIONS.bowl.y}%`,
            width: YARD_PROP_SIZES.bowl.width,
            height: YARD_PROP_SIZES.bowl.height,
            transform: 'translate(-50%, -50%)',
            opacity: isNight ? 0.85 : 0.95,
            filter: isNight ? 'drop-shadow(0 12px 18px rgba(0,0,0,0.35))' : 'drop-shadow(0 10px 16px rgba(0,0,0,0.22))',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <FoodBowlSvg />
        </button>
      ) : (
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${YARD_PROP_POSITIONS.bowl.x}%`,
              top: `${YARD_PROP_POSITIONS.bowl.y}%`,
              width: YARD_PROP_SIZES.bowl.width,
              height: YARD_PROP_SIZES.bowl.height,
              transform: 'translate(-50%, -50%)',
              opacity: isNight ? 0.85 : 0.95,
              filter: isNight ? 'drop-shadow(0 12px 18px rgba(0,0,0,0.35))' : 'drop-shadow(0 10px 16px rgba(0,0,0,0.22))',
            }}
          >
            <FoodBowlSvg />
          </div>
      )}

      {/* Water bowl */}
      {typeof onWaterBowl === 'function' ? (
        <button
          type="button"
          aria-label="Water bowl"
          className="pointer-events-auto absolute"
          onClick={onWaterBowl}
          style={{
            left: `${YARD_PROP_POSITIONS.water.x}%`,
            top: `${YARD_PROP_POSITIONS.water.y}%`,
            width: YARD_PROP_SIZES.water.width,
            height: YARD_PROP_SIZES.water.height,
            transform: 'translate(-50%, -50%)',
            opacity: isNight ? 0.82 : 0.95,
            filter: isNight
              ? 'drop-shadow(0 10px 16px rgba(0,0,0,0.32))'
              : 'drop-shadow(0 10px 16px rgba(0,0,0,0.2))',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <WaterBowlSvg />
        </button>
      ) : (
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${YARD_PROP_POSITIONS.water.x}%`,
            top: `${YARD_PROP_POSITIONS.water.y}%`,
            width: YARD_PROP_SIZES.water.width,
            height: YARD_PROP_SIZES.water.height,
            transform: 'translate(-50%, -50%)',
            opacity: isNight ? 0.82 : 0.95,
            filter: isNight
              ? 'drop-shadow(0 10px 16px rgba(0,0,0,0.32))'
              : 'drop-shadow(0 10px 16px rgba(0,0,0,0.2))',
          }}
        >
          <WaterBowlSvg />
        </div>
      )}

      {/* Toy ball */}
      {typeof onBall === 'function' ? (
        <button
          type="button"
          aria-label="Toy ball"
          className="pointer-events-auto absolute"
          onClick={onBall}
          style={{
            left: `${YARD_PROP_POSITIONS.ball.x}%`,
            top: `${YARD_PROP_POSITIONS.ball.y}%`,
            width: YARD_PROP_SIZES.ball.width,
            height: YARD_PROP_SIZES.ball.height,
            transform: 'translate(-50%, -50%)',
            opacity: isNight ? 0.8 : 0.95,
            filter: isNight ? 'drop-shadow(0 10px 16px rgba(0,0,0,0.35))' : 'drop-shadow(0 10px 16px rgba(0,0,0,0.22))',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <BallSvg />
        </button>
      ) : null}

    </div>
  );
}
