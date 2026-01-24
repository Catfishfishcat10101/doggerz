// src/components/DogCosmeticsOverlay.jsx
//
// Minimal cosmetics overlay for the Store preview.
// The "real" rendering can evolve later (sprites, SVGs, etc). For now this keeps
// the app building even if cosmetic art assets aren't present.

function labelFor(id) {
  return String(id || "")
    .replace(/^(collar_|tag_|backdrop_)/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

export default function DogCosmeticsOverlay({ equipped, size = 360 }) {
  const collar = equipped?.collar ? labelFor(equipped.collar) : "";
  const tag = equipped?.tag ? labelFor(equipped.tag) : "";
  const backdrop = equipped?.backdrop ? labelFor(equipped.backdrop) : "";

  // No cosmetics equipped => render nothing (keeps layout clean).
  if (!collar && !tag && !backdrop) return null;

  // Simple, non-asset overlay that won't break if images are missing.
  return (
    <div
      className="absolute inset-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute left-2 top-2 flex flex-col gap-1">
        {collar ? (
          <span className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
            Collar: {collar}
          </span>
        ) : null}
        {tag ? (
          <span className="inline-flex rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100">
            Tag: {tag}
          </span>
        ) : null}
        {backdrop ? (
          <span className="inline-flex rounded-full border border-sky-400/25 bg-sky-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100">
            Backdrop: {backdrop}
          </span>
        ) : null}
      </div>
    </div>
  );
}
