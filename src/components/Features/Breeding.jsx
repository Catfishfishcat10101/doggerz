// src/components/Features/Breeding.jsx
import React, { useMemo, useState } from "react";

/**
 * Breeding (Prototype)
 * - Mendelian-ish inheritance for a few demo traits
 * - Dominant/recessive & weighted cosmetic blending
 * - Deterministic RNG with seed for reproducible previews
 *
 * No external state; wire to Redux/Firestore later as needed.
 */

// Cosmetic palettes (hex strings) — tweak to match your sprites
const COAT_COLORS = [
  { id: "golden",  label: "Golden",  hex: "#E0A64B" },
  { id: "black",   label: "Black",   hex: "#2B2B2B" },
  { id: "white",   label: "White",   hex: "#EDEDED" },
  { id: "brown",   label: "Brown",   hex: "#6B4423" },
  { id: "merle",   label: "Merle",   hex: "#7E8B9D" },
];

const EARS = [
  { id: "floppy", label: "Floppy" },
  { id: "prick",  label: "Prick"  },
];

const SIZE = [
  { id: "small",  label: "Small"  },
  { id: "medium", label: "Medium" },
  { id: "large",  label: "Large"  },
];

// Simple deterministic RNG (Mulberry32)
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Blend two hex colors by weight [0..1]
function blendHex(a, b, w = 0.5) {
  const pa = parseInt(a.replace("#", ""), 16);
  const pb = parseInt(b.replace("#", ""), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const rr = Math.round(ar * (1 - w) + br * w);
  const rg = Math.round(ag * (1 - w) + bg * w);
  const rb = Math.round(ab * (1 - w) + bb * w);
  return "#" + [rr, rg, rb].map(x => x.toString(16).padStart(2, "0")).join("");
}

// Inheritance helpers
function pickDominant(a, b, rnd) {
  // Dominant wins 70% if mixed; tie = either
  if (a === b) return a;
  return rnd() < 0.7 ? a : b;
}
function pickWeighted(a, b, rnd) {
  // 50/50 baseline; add tiny jitter
  return rnd() + 0.02 < 0.5 ? a : b;
}
function sizeCross(a, b, rnd) {
  // Map to numeric for blending, then bucket back
  const map = { small: 1, medium: 2, large: 3 };
  const inv = { 1: "small", 2: "medium", 3: "large" };
  const v = (map[a] + map[b]) / 2 + (rnd() - 0.5); // +/- 0.5 jitter
  const clamped = Math.max(1, Math.min(3, Math.round(v)));
  return inv[clamped];
}

// Deterministic puppy from two parents and a seed
function makePuppy(mom, dad, seed) {
  const rand = rng(seed);

  // Coat: blend color hex; with 20% chance bias toward a parent
  const momColor = COAT_COLORS.find(c => c.id === mom.coat) || COAT_COLORS[0];
  const dadColor = COAT_COLORS.find(c => c.id === dad.coat) || COAT_COLORS[1];
  const bias = rand() < 0.2 ? (rand() < 0.5 ? 0.25 : 0.75) : 0.5;
  const coatBlend = blendHex(momColor.hex, dadColor.hex, bias);
  const coatId = rand() < 0.15 ? (rand() < 0.5 ? mom.coat : dad.coat) : "custom";

  // Ears: treat prick as dominant
  const ears = pickDominant(mom.ears, dad.ears, rand);

  // Size: blend
  const size = sizeCross(mom.size, dad.size, rand);

  // Patterns: 10% chance to inherit "merle" explicitly if any parent has it
  const merleBoost = (mom.coat === "merle" || dad.coat === "merle") && (rand() < 0.1);

  // Temperament seed (preview only)
  const temperament = ["Chill", "Playful", "Curious", "Bold", "Cautious"];
  const tempo = temperament[Math.floor(rand() * temperament.length)];

  return {
    coatId,
    coatHex: merleBoost ? blendHex(coatBlend, "#7E8B9D", 0.35) : coatBlend,
    ears,
    size,
    temperament: tempo,
  };
}

const defaultParent = {
  coat: "golden",
  ears: "floppy",
  size: "medium",
};

export default function Breeding() {
  const [mom, setMom] = useState(defaultParent);
  const [dad, setDad] = useState({ coat: "black", ears: "prick", size: "large" });
  const [seed, setSeed] = useState(1337);

  const pup = useMemo(() => makePuppy(mom, dad, seed), [mom, dad, seed]);

  const colorFor = (id) => COAT_COLORS.find(c => c.id === id)?.hex ?? "#ccc";

  return (
    <div className="p-6 container">
      <h1 className="text-xl font-semibold">Breeding Planner</h1>
      <p className="opacity-80">
        Prototype genetics. Combine parent traits to preview a pup. Deterministic via seed for reproducible demos.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Mom */}
        <div className="card p-4">
          <h2 className="font-medium mb-3">Parent A (Mom)</h2>
          <TraitForm value={mom} onChange={setMom} />
        </div>

        {/* Dad */}
        <div className="card p-4">
          <h2 className="font-medium mb-3">Parent B (Dad)</h2>
          <TraitForm value={dad} onChange={setDad} />
        </div>

        {/* Puppy Preview */}
        <div className="card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-medium">Offspring Preview</h2>
            <SeedControl seed={seed} setSeed={setSeed} />
          </div>

          <div className="mt-4 grid grid-cols-[96px,1fr] gap-3 items-center">
            <div className="h-24 w-24 rounded-xl shadow sprite-shadow grid place-items-center"
                 style={{ background: pup.coatHex }}>
              <span className="text-xs bg-white/80 dark:bg-black/40 px-1.5 py-0.5 rounded">
                {pup.coatId === "custom" ? "blend" : pup.coatId}
              </span>
            </div>

            <div className="text-sm leading-6">
              <div>Coat: <b style={{ color: pup.coatHex }}>{pup.coatId}</b> <span className="opacity-70">({pup.coatHex})</span></div>
              <div>Ears: <b>{pup.ears}</b></div>
              <div>Size: <b>{pup.size}</b></div>
              <div>Temperament: <b>{pup.temperament}</b></div>
            </div>
          </div>

          <div className="mt-4 text-xs opacity-70">
            Inheritance model: prick ears treated dominant; coat color blends; merle can influence tone (10% if present).
          </div>
        </div>
      </div>

      {/* Quick comparison swatches */}
      <div className="mt-6 card p-4">
        <h3 className="font-medium mb-3">Palette Check</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {COAT_COLORS.map(c => (
            <div key={c.id} className="p-3 rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
              <div className="h-10 rounded-lg shadow" style={{ background: c.hex }} />
              <div className="mt-2 text-xs">
                <div className="font-medium">{c.label}</div>
                <div className="opacity-70">{c.hex}</div>
              </div>
            </div>
          ))}
          {/* Mixed swatch of current parents */}
          <div className="p-3 rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
            <div className="h-10 rounded-lg shadow"
                 style={{ background: blendHex(colorFor(mom.coat), colorFor(dad.coat), 0.5) }} />
            <div className="mt-2 text-xs">
              <div className="font-medium">Mom × Dad</div>
              <div className="opacity-70">50/50 blend</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- UI bits -------------------------------- */

function TraitForm({ value, onChange }) {
  return (
    <div className="grid gap-3">
      <LabeledSelect
        label="Coat"
        value={value.coat}
        onChange={(v) => onChange({ ...value, coat: v })}
        options={COAT_COLORS.map(c => ({ id: c.id, label: c.label }))}
      />
      <LabeledSelect
        label="Ears"
        value={value.ears}
        onChange={(v) => onChange({ ...value, ears: v })}
        options={EARS}
      />
      <LabeledSelect
        label="Size"
        value={value.size}
        onChange={(v) => onChange({ ...value, size: v })}
        options={SIZE}
      />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, options }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="opacity-80">{label}</span>
      <select
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}

function SeedControl({ seed, setSeed }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="input w-28"
        value={seed}
        onChange={(e) => setSeed(parseInt(e.target.value || "0", 10))}
      />
      <button
        className="btn"
        onClick={() => setSeed(Math.floor(Math.random() * 1e9))}
        title="Randomize seed"
      >
        Randomize
      </button>
    </div>
  );
}
