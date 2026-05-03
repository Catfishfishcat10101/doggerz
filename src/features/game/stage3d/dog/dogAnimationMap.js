import { withBaseUrl } from "@/utils/assetUtils.js";

export const DOG_MODEL_GLTF_PATH = withBaseUrl(
  "/assets/models/dog/jackrussell-doggerz.glb"
);
export const DOG_MODEL_CLIPS = Object.freeze([
  "Idle",
  "Sit",
  "Bark",
  "Sleep",
  "Walk",
  "Wag",
]);

export function resolveClipName(requestedClip = "Idle", actions = {}) {
  const actionNames = Object.keys(actions || {});
  if (!actionNames.length) return null;

  const normalizedRequest = String(requestedClip || "Idle").trim();
  if (actionNames.includes(normalizedRequest)) return normalizedRequest;
  return actionNames.includes("Idle") ? "Idle" : actionNames[0];
}
