// src/components/DogCosmeticsOverlay.jsx
//
// Minimal cosmetics overlay for the Store preview.
// The "real" rendering can evolve later (sprites, SVGs, etc). For now this keeps
// the app building even if cosmetic art assets aren't present.

import { useDispatch, useSelector } from "react-redux";

import {
  selectSettings,
  setCosmeticsOverlayPosition,
  setCosmeticsOverlayShowLabels,
  setCosmeticsOverlayShowPreviewTags,
} from "@/redux/settingsSlice.js";

function labelFor(id) {
  return String(id || "")
    .replace(/^(collar_|tag_|backdrop_)/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

export default function DogCosmeticsOverlay({ equipped, size = 360 }) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);

  const showLabels = settings?.cosmeticsOverlayShowLabels !== false;
  const showPreviewTags = settings?.cosmeticsOverlayShowPreviewTags !== false;
  const position = settings?.cosmeticsOverlayPosition || "top-left";

  const collar = equipped?.collar ? labelFor(equipped.collar) : "";
  const tag = equipped?.tag ? labelFor(equipped.tag) : "";
  const backdrop = equipped?.backdrop ? labelFor(equipped.backdrop) : "";
  const items = [
    {
      key: "collar",
      label: collar ? `Collar: ${collar}` : "",
      tone: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
    },
    {
      key: "tag",
      label: tag ? `Tag: ${tag}` : "",
      tone: "border-amber-400/25 bg-amber-500/10 text-amber-100",
    },
    {
      key: "backdrop",
      label: backdrop ? `Backdrop: ${backdrop}` : "",
      tone: "border-sky-400/25 bg-sky-500/10 text-sky-100",
    },
  ].filter((item) => item.label);

  // No cosmetics equipped => render nothing (keeps layout clean).
  if (!collar && !tag && !backdrop) return null;

  const posClass =
    position === "top-right"
      ? "right-2 top-2 items-end"
      : position === "bottom-left"
        ? "left-2 bottom-2"
        : position === "bottom-right"
          ? "right-2 bottom-2 items-end"
          : "left-2 top-2";

  // Simple, non-asset overlay that won't break if images are missing.
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className={`absolute flex flex-col gap-1 ${posClass}`}>
        {showLabels
          ? items.map((item) => (
              <span
                key={item.key}
                className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${item.tone}`}
              >
                {item.label}
              </span>
            ))
          : null}

        {showPreviewTags ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {items.map((item) => (
              <span
                key={`${item.key}-dot`}
                className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-200"
              >
                {item.key}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="absolute right-2 top-2 pointer-events-auto">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-200">
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-200 hover:bg-white/10"
            onClick={() => dispatch(setCosmeticsOverlayShowLabels(!showLabels))}
          >
            {showLabels ? "Labels on" : "Labels off"}
          </button>
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-200 hover:bg-white/10"
            onClick={() =>
              dispatch(setCosmeticsOverlayShowPreviewTags(!showPreviewTags))
            }
          >
            {showPreviewTags ? "Tags on" : "Tags off"}
          </button>
          <select
            value={position}
            onChange={(e) =>
              dispatch(setCosmeticsOverlayPosition(e.target.value))
            }
            className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-zinc-200"
          >
            <option value="top-left">Top left</option>
            <option value="top-right">Top right</option>
            <option value="bottom-left">Bottom left</option>
            <option value="bottom-right">Bottom right</option>
          </select>
        </div>
      </div>
    </div>
  );
}
