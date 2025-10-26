// src/components/Features/Breeding.jsx
import React, { useMemo, useState, useCallback, useId } from "react";

/**
 * Breeding (Prototype)
 * - Deterministic RNG by seed (Mulberry32)
 * - Simple dominance/weighted blending for demo traits
 * - Self-contained for now; easy to wire to Redux/Firestore later
 */

// Cosmetic palettes (hex strings)
const COAT_COLORS = [
  { id: "golden", label: "Golden", hex: "#E0A64B" },
  { id: "black", label: "Black", hex: "#2B2B2B" },
  { id: "white", label: "White", hex: "#EDEDED" },
  { id: "brown", label: "Brown", hex: "#6B4423" },
  { id: "merle", label: "Merle", hex: "#7E8B9D" },
];

const EARS = [
  { id: "floppy", label: "Floppy" },
  { id: "prick", label: "Prick" },
];

const SIZE = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

// Simple deterministic RNG (Mulberry32)
function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Blend two hex colors by weight [0..1]
function blendHex(a, b, w = 0.5) {
  const pa = parseInt(String(a).replace("#", ""), 16);
  const pb = parseInt(String(b).replace("#", ""), 16);
  const ar = (pa >> 16) & 255,
    ag = (pa >> 8) & 255,
    ab = pa & 255;
  const br = (pb >> 16) & 255,
    bg = (pb >> 8) & 255,
    bb = pb & 255;
  const rr = Math.round(ar * (1 - w) + br * w);
  const rg = Math.round(ag * (1 - w) + bg * w);
  const rb = Math.round(ab * (1 - w) + bb * w);
  return (
    "#" + [rr, rg, rb].map((x) => x.toString(16).padStart(2, "0")).join("")
  );
}

// Inheritance helpers
function pickDominant(a, b, rnd) {
  if (a === b) return a;
  return rnd() < 0.7 ? a : b; // 70% dominant tilt
}
function sizeCross(a, b, rnd) {
  const map = { small: 1, medium: 2, large: 3 };
  const inv = { 1: "small", 2: "medium", 3: "large" };
  const va = map[a] ?? 2,
    vb = map[b] ?? 2;
  const v = (va + vb) / 2 + (rnd() - 0.5); // +/- 0.5 jitter
  const clamped = Math.max(1, Math.min(3, Math.round(v)));
  return inv[clamped];
}

function colorHexFor(id) {
  return COAT_COLORS.find((c) => c.id === id)?.hex ?? "#cccccc";
}

// Deterministic puppy from two parents and a seed
export function makePuppy(mom, dad, seed) {
  const rand = rng(seed);

  // Coat: blend hex with occasional bias toward a parent
  const momHex = colorHexFor(mom.coat);
  const dadHex = colorHexFor(dad.coat);
  const bias = rand() < 0.2 ? (rand() < 0.5 ? 0.25 : 0.75) : 0.5;
  const coatBlend = blendHex(momHex, dadHex, bias);
  const coatId =
    rand() < 0.15 ? (rand() < 0.5 ? mom.coat : dad.coat) : "custom";

  // Ears: treat prick as dominant
  const ears = pickDominant(mom.ears, dad.ears, rand);

  // Size: blended bucket
  const size = sizeCross(mom.size, dad.size, rand);

  // Pattern influence: “merle tone” influence (10% if present on a parent)
  const merleInfluence =
    (mom.coat === "merle" || dad.coat === "merle") && rand() < 0.1;

  // Temperament (preview only)
  const temperament = ["Chill", "Playful", "Curious", "Bold", "Cautious"];
  const tempo = temperament[Math.floor(rand() * temperament.length)];

  return {
    coatId,
    coatHex: merleInfluence ? blendHex(coatBlend, "#7E8B9D", 0.35) : coatBlend,
    ears,
    size,
    temperament: tempo,
  };
}

const defaultParent = { coat: "golden", ears: "floppy", size: "medium" };

export default function Breeding() {
  const [mom, setMom] = useState(defaultParent);
  const [dad, setDad] = useState({
    coat: "black",
    ears: "prick",
    size: "large",
  });
  const [seed, setSeed] = useState(1337);

  const pup = useMemo(() => makePuppy(mom, dad, seed), [mom, dad, seed]);

  const handleRandomize = useCallback(() => {
    // Better randomness when available
    if (crypto?.getRandomValues) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      setSeed(arr[0] >>> 0);
    } else {
      setSeed(Math.floor(Math.random() * 0xffffffff) >>> 0);
    }
  }, []);

  const handleSeedChange = (val) => {
    const n = Number(val);
    if (Number.isFinite(n)) {
      // clamp to 32-bit unsigned for Mulberry32
      setSeed((n >>> 0) % 0x100000000);
    } else {
      setSeed(0);
    }
  };

  const swapParents = useCallback(() => {
    setMom(dad);
    setDad(mom);
  }, [mom, dad]);

  const seedId = useId();

  return (
    <div className="p-6 container">
      <h1 className="text-xl font-semibold">Breeding Planner</h1>
      <p className="opacity-80">
        Prototype genetics. Combine parent traits to preview a pup.
        Deterministic via seed for reproducible demos.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <SeedControl
          seed={seed}
          onChange={handleSeedChange}
          onRandomize={handleRandomize}
          inputId={seedId}
        />
        <button className="btn" onClick={swapParents} title="Swap parents">
          Swap Parents
        </button>
      </div>

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
          <h2 className="font-medium mb-3">Offspring Preview</h2>

          <div className="mt-2 grid grid-cols-[96px,1fr] gap-3 items-center">
            <div
              className="h-24 w-24 rounded-xl shadow sprite-shadow grid place-items-center border"
              style={{
                background: pup.coatHex,
                borderColor: "rgba(0,0,0,.08)",
              }}
            >
              <span className="text-xs bg-white/80 dark:bg-black/40 px-1.5 py-0.5 rounded">
                {pup.coatId === "custom" ? "blend" : pup.coatId}
              </span>
            </div>

            <div className="text-sm leading-6">
              <div>
                Coat: <b style={{ color: pup.coatHex }}>{pup.coatId}</b>{" "}
                <span className="opacity-70">({pup.coatHex})</span>
              </div>
              <div>
                Ears: <b>{pup.ears}</b>
              </div>
              <div>
                Size: <b>{pup.size}</b>
              </div>
              <div>
                Temperament: <b>{pup.temperament}</b>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs opacity-70">
            Inheritance model: prick ears treated dominant; coat color blends;
            merle can influence tone (10% if present).
          </div>
        </div>
      </div>

      {/* Palette swatches */}
      <div className="mt-6 card p-4">
        <h3 className="font-medium mb-3">Palette Check</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {COAT_COLORS.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl border"
              style={{ borderColor: "var(--card-border)" }}
            >
              <div
                className="h-10 rounded-lg shadow"
                style={{ background: c.hex }}
              />
              <div className="mt-2 text-xs">
                <div className="font-medium">{c.label}</div>
                <div className="opacity-70">{c.hex}</div>
              </div>
            </div>
          ))}
          {/* Mixed swatch of current parents */}
          <div
            className="p-3 rounded-xl border"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div
              className="h-10 rounded-lg shadow"
              style={{
                background: blendHex(
                  colorHexFor(mom.coat),
                  colorHexFor(dad.coat),
                  0.5,
                ),
              }}
            />
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
        options={COAT_COLORS.map((c) => ({ id: c.id, label: c.label }))}
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
  const id = useId();
  return (
    <label className="grid gap-1 text-sm" htmlFor={id}>
      <span className="opacity-80">{label}</span>
      <select
        id={id}
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SeedControl({ seed, onChange, onRandomize, inputId }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={inputId} className="text-sm opacity-80">
        Seed
      </label>
      <input
        id={inputId}
        type="number"
        className="input w-36"
        value={seed}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="btn" onClick={onRandomize} title="Randomize seed">
        Randomize
      </button>
    </div>
  );
}
