import { normalizeDogStageShort } from "@/utils/dogSpritePaths.js";

function toDataUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function resolveStageScale(stageLike) {
  const stage = normalizeDogStageShort(stageLike);
  if (stage === "adult") return 1.03;
  if (stage === "senior") return 1.01;
  return 0.94;
}

function buildCollarSvg({
  strap = "#ef4444",
  buckle = "#f8fafc",
  glow = "none",
  tag = "#f8fafc",
}) {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <defs>
        <filter id="g" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g ${glow !== "none" ? 'filter="url(#g)"' : ""}>
        <path d="M72 138c19 10 44 15 60 15 19 0 40-5 56-14" fill="none" stroke="${strap}" stroke-width="18" stroke-linecap="round"/>
        <rect x="160" y="126" width="20" height="18" rx="5" fill="${buckle}" opacity="0.92"/>
        <circle cx="184" cy="140" r="5" fill="${tag}" opacity="0.9"/>
      </g>
      ${
        glow !== "none"
          ? `<path d="M72 138c19 10 44 15 60 15 19 0 40-5 56-14" fill="none" stroke="${glow}" stroke-width="26" stroke-linecap="round" opacity="0.35"/>`
          : ""
      }
    </svg>
  `);
}

function buildTagSvg({ fill = "#fbbf24", stroke = "#f8fafc" }) {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <g opacity="0.96">
        <circle cx="128" cy="152" r="11" fill="${stroke}" opacity="0.9"/>
        <path d="M128 162l8 15 17 2-12 12 3 17-16-8-16 8 3-17-12-12 17-2z" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      </g>
    </svg>
  `);
}

function buildHeartTagSvg({ fill = "#fb7185", stroke = "#ffe4e6" }) {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <g opacity="0.97">
        <circle cx="128" cy="150" r="10" fill="${stroke}" opacity="0.9"/>
        <path d="M128 205l-15-14c-30-27-49-44-49-68 0-18 14-31 31-31 10 0 19 5 25 13 6-8 15-13 25-13 17 0 31 13 31 31 0 24-19 41-49 68z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      </g>
    </svg>
  `);
}

function buildBoltTagSvg({ fill = "#facc15", stroke = "#fef9c3" }) {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <g opacity="0.97">
        <circle cx="128" cy="150" r="10" fill="${stroke}" opacity="0.9"/>
        <path d="M136 86l-34 52h24l-6 34 34-52h-24z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      </g>
    </svg>
  `);
}

function getCollarLayer(id) {
  const key = String(id || "")
    .trim()
    .toLowerCase();
  if (!key) return null;

  if (key === "collar_leaf") {
    return {
      slot: "collar",
      src: buildCollarSvg({
        strap: "#22c55e",
        buckle: "#dcfce7",
        tag: "#86efac",
      }),
    };
  }

  if (key === "collar_neon") {
    return {
      slot: "collar",
      src: buildCollarSvg({
        strap: "#67e8f9",
        buckle: "#ecfeff",
        tag: "#22d3ee",
        glow: "#22d3ee",
      }),
    };
  }

  if (key === "beta_collar_2026") {
    return {
      slot: "collar",
      src: buildCollarSvg({
        strap: "#38bdf8",
        buckle: "#eff6ff",
        tag: "#bfdbfe",
        glow: "#60a5fa",
      }),
    };
  }

  if (key === "collar_midnight") {
    return {
      slot: "collar",
      src: buildCollarSvg({
        strap: "#1e293b",
        buckle: "#e2e8f0",
        tag: "#93c5fd",
        glow: "#60a5fa",
      }),
    };
  }

  if (key === "collar_sunflare") {
    return {
      slot: "collar",
      src: buildCollarSvg({
        strap: "#f97316",
        buckle: "#fff7ed",
        tag: "#fdba74",
        glow: "#fb923c",
      }),
    };
  }

  if (key === "collar_mosswood") {
    return {
      slot: "collar",
      src: buildCollarSvg({
        strap: "#15803d",
        buckle: "#dcfce7",
        tag: "#86efac",
        glow: "#4ade80",
      }),
    };
  }

  if (key === "collar_winter_frost") {
    return {
      slot: "collar",
      src: buildCollarSvg({
        strap: "#60a5fa",
        buckle: "#eff6ff",
        tag: "#dbeafe",
        glow: "#93c5fd",
      }),
    };
  }

  return {
    slot: "collar",
    src: buildCollarSvg({
      strap: "#ef4444",
      buckle: "#fee2e2",
      tag: "#fda4af",
    }),
  };
}

function getTagLayer(id) {
  const key = String(id || "")
    .trim()
    .toLowerCase();
  if (!key) return null;
  if (key === "tag_star") {
    return {
      slot: "tag",
      src: buildTagSvg({
        fill: "#fbbf24",
        stroke: "#fef3c7",
      }),
    };
  }
  if (key === "tag_heart") {
    return {
      slot: "tag",
      src: buildHeartTagSvg({
        fill: "#fb7185",
        stroke: "#ffe4e6",
      }),
    };
  }
  if (key === "tag_bolt") {
    return {
      slot: "tag",
      src: buildBoltTagSvg({
        fill: "#facc15",
        stroke: "#fef9c3",
      }),
    };
  }
  if (key === "tag_harvest_leaf") {
    return {
      slot: "tag",
      src: buildTagSvg({
        fill: "#f59e0b",
        stroke: "#fffbeb",
      }),
    };
  }
  return null;
}

export function getDogCosmeticLayerSpecs({
  equipped = {},
  stage = "PUPPY",
  facing = 1,
} = {}) {
  const stageScale = resolveStageScale(stage);
  const facingScale = Number(facing) < 0 ? -1 : 1;
  const baseStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transform: `scale(${stageScale}) scaleX(${facingScale})`,
    transformOrigin: "50% 50%",
    pointerEvents: "none",
    userSelect: "none",
  };

  const layers = [getCollarLayer(equipped?.collar), getTagLayer(equipped?.tag)]
    .filter(Boolean)
    .map((layer, index) => ({
      ...layer,
      key: `${layer.slot}-${index}`,
      behindDog: layer.slot === "collar",
      style: {
        ...baseStyle,
        zIndex: layer.slot === "tag" ? 16 : 4,
      },
    }));

  return layers;
}
