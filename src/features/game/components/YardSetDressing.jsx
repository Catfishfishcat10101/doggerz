/** @format */

// src/features/game/components/YardSetDressing.jsx
// Lightweight "props" layer for the yard stage.
// - Covers the pool (we don't have background-painting tools in code)
// - Adds a dog house + back door + porch light so day/night feel like the same yard
// - Adds a food bowl prop so "eat" feels grounded

import {
  YARD_PROP_POSITIONS,
  YARD_PROP_SIZES,
} from "@/features/game/yardProps.js";

function DogHouseSvg({ isNight }) {
  const wood = isNight ? '#7b4a25' : '#8b5a2b';
  const roof = isNight ? '#4b2a16' : '#5a331a';
  const trim = isNight ? '#d6d3d1' : '#f5f5f4';

  return (
    <svg viewBox="0 0 220 170" width="100%" height="100%" aria-hidden="true">
      {/* shadow */}
      <ellipse cx="112" cy="154" rx="86" ry="12" fill="rgba(0,0,0,0.30)" />

      {/* base */}
      <rect x="36" y="64" width="152" height="88" rx="14" fill={wood} />
      <rect x="44" y="72" width="136" height="72" rx="12" fill="rgba(255,255,255,0.06)" />

      {/* roof */}
      <path d="M22 72 L110 18 L198 72" fill={roof} />
      <path d="M22 72 L110 18 L198 72" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />

      {/* door arch */}
      <path
        d="M110 148c-24 0-44-20-44-44v-6c0-20 16-36 36-36h16c20 0 36 16 36 36v6c0 24-20 44-44 44z"
        fill="rgba(0,0,0,0.45)"
      />
      <path
        d="M110 142c-20 0-36-16-36-36v-6c0-16 13-29 29-29h14c16 0 29 13 29 29v6c0 20-16 36-36 36z"
        fill="rgba(0,0,0,0.55)"
      />

      {/* trim */}
      <rect x="32" y="60" width="160" height="96" rx="16" fill="none" stroke={trim} strokeOpacity="0.25" strokeWidth="6" />

      {/* little name plate */}
      <rect x="86" y="86" width="48" height="14" rx="6" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

function FoodBowlSvg() {
  return (
    <svg viewBox="0 0 120 70" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="60" cy="54" rx="46" ry="10" fill="rgba(0,0,0,0.25)" />
      <path
        d="M20 46c0-14 18-26 40-26s40 12 40 26c0 10-10 18-22 18H42C30 64 20 56 20 46z"
        fill="#60a5fa"
      />
      <path
        d="M30 44c0-10 14-18 30-18s30 8 30 18c0 7-7 12-16 12H46c-9 0-16-5-16-12z"
        fill="#93c5fd"
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
        fill="#22d3ee"
      />
      <path
        d="M32 44c0-9 12-16 28-16s28 7 28 16c0 6-7 11-15 11H47c-8 0-15-5-15-11z"
        fill="#7dd3fc"
      />
      <path
        d="M36 40c6 3 18 4 24 2 6-2 10-4 18-2"
        stroke="rgba(255,255,255,0.6)"
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
      {/* Cover the pool area with a grass patch (until we replace the painted background). */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: '4%',
          top: '52%',
          width: '34%',
          height: '42%',
          borderRadius: 28,
          background:
            'radial-gradient(circle at 40% 45%, rgba(34,197,94,0.65), rgba(22,101,52,0.72) 55%, rgba(10,30,20,0.55) 100%)',
          filter: 'blur(0.2px)',
          opacity: isNight ? 0.82 : 0.92,
        }}
      />

      {/* Back door (always present so day/night match) */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: '78%',
          top: '14%',
          width: 64,
          height: 88,
          transform: 'translate(-50%, 0)',
          borderRadius: 10,
          background: isNight ? 'rgba(15,23,42,0.70)' : 'rgba(2,6,23,0.35)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: isNight ? '0 10px 26px rgba(0,0,0,0.35)' : '0 10px 22px rgba(0,0,0,0.20)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            right: 10,
            height: 22,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.10)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: 44,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.55)',
          }}
        />
      </div>

      {/* Porch light fixture + glow at night */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: '83%',
          top: '18%',
          width: 12,
          height: 12,
          borderRadius: 999,
          background: isNight ? 'rgba(253,230,138,0.85)' : 'rgba(255,255,255,0.35)',
          transform: 'translate(-50%, -50%)',
          boxShadow: isNight
            ? '0 0 26px rgba(253,230,138,0.75), 0 0 60px rgba(253,230,138,0.35)'
            : '0 2px 0 rgba(0,0,0,0.15)',
          opacity: 1,
        }}
      />

      {/* Dog house */}
      {typeof onDogHouse === 'function' ? (
        <button
          type="button"
          aria-label="Dog house"
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
          <DogHouseSvg isNight={isNight} />
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
            <DogHouseSvg isNight={isNight} />
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
