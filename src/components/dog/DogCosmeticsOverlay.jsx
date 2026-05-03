// src/components/dog/DogCosmeticsOverlay.jsx
// src/components/DogCosmeticsOverlay.jsx
//
// Layered cosmetic renderer for collar/tag overlays.
// Asset-backed sprite layers can plug into the same interface later.

import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";

import {
  selectSettings,
  setCosmeticsOverlayPosition,
  setCosmeticsOverlayShowLabels,
  setCosmeticsOverlayShowPreviewTags,
} from "@/store/settingsSlice.js";
import { getDogCosmeticLayerSpecs } from "@/utils/dogCosmeticLayers.js";

function labelFor(id) {
  return String(id || "")
    .replace(/^(collar_|tag_|backdrop_)/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

export default function DogCosmeticsOverlay({
  equipped,
  size = 360,
  stage = "PUPPY",
  facing = 1,
  layerMode = "all",
  showLabels,
  showPreviewTags,
  showEditorUi = false,
}) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const displayLabels =
    typeof showLabels === "boolean"
      ? showLabels
      : settings?.cosmeticsOverlayShowLabels === true;
  const displayPreviewTags =
    typeof showPreviewTags === "boolean"
      ? showPreviewTags
      : settings?.cosmeticsOverlayShowPreviewTags === true;
  const position = settings?.cosmeticsOverlayPosition || "top-left";

  const collar = equipped?.collar ? labelFor(equipped.collar) : "";
  const tag = equipped?.tag ? labelFor(equipped.tag) : "";
  const backdrop = equipped?.backdrop ? labelFor(equipped.backdrop) : "";
  const renderLayers = useMemo(
    () => getDogCosmeticLayerSpecs({ equipped, stage, facing }),
    [equipped, facing, stage]
  );
  const filteredRenderLayers = useMemo(() => {
    if (layerMode === "behind") {
      return renderLayers.filter((layer) => layer.behindDog);
    }
    if (layerMode === "front") {
      return renderLayers.filter((layer) => !layer.behindDog);
    }
    return renderLayers;
  }, [layerMode, renderLayers]);
  const items = [
    {
      key: "collar",
      label: collar ? `Collar: ${collar}` : "",
      tone: "dz-dog-chip dz-dog-chip--emerald",
    },
    {
      key: "tag",
      label: tag ? `Tag: ${tag}` : "",
      tone: "dz-dog-chip dz-dog-chip--amber",
    },
    {
      key: "backdrop",
      label: backdrop ? `Backdrop: ${backdrop}` : "",
      tone: "dz-dog-chip dz-dog-chip--sky",
    },
  ].filter((item) => item.label);

  // No renderable layers and no requested preview UI => render nothing.
  if (
    !filteredRenderLayers.length &&
    !(displayLabels || displayPreviewTags || showEditorUi)
  ) {
    return null;
  }

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
      className={`dog-cosmetics-overlay dog-cosmetics-overlay--${layerMode} absolute inset-0 pointer-events-none`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {filteredRenderLayers.map((layer) => (
        <img
          key={layer.key}
          src={layer.src}
          alt=""
          className="absolute select-none"
          style={layer.style}
          draggable="false"
        />
      ))}

      <div className={`absolute flex flex-col gap-1 ${posClass}`}>
        {displayLabels
          ? items.map((item) => (
              <span key={item.key} className={item.tone}>
                {item.label}
              </span>
            ))
          : null}

        {displayPreviewTags ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {items.map((item) => (
              <span key={`${item.key}-dot`} className="dz-dog-tag">
                {item.key}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {showEditorUi ? (
        <div className="absolute right-2 top-2 pointer-events-auto">
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/25 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-200 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
            <button
              type="button"
              className="dz-dog-editor-pill"
              onClick={() =>
                dispatch(setCosmeticsOverlayShowLabels(!displayLabels))
              }
            >
              {displayLabels ? "Labels on" : "Labels off"}
            </button>
            <button
              type="button"
              className="dz-dog-editor-pill"
              onClick={() =>
                dispatch(
                  setCosmeticsOverlayShowPreviewTags(!displayPreviewTags)
                )
              }
            >
              {displayPreviewTags ? "Tags on" : "Tags off"}
            </button>
            <select
              value={position}
              onChange={(e) =>
                dispatch(setCosmeticsOverlayPosition(e.target.value))
              }
              className="rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[10px] text-zinc-200"
            >
              <option value="top-left">Top left</option>
              <option value="top-right">Top right</option>
              <option value="bottom-left">Bottom left</option>
              <option value="bottom-right">Bottom right</option>
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
}
