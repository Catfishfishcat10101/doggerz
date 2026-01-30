/** @format */

// src/utils/resolveDogPoseFromTraining.js
import { getSkillNode } from "@/constants/trainingTree.js";
import { resolvePoseKey } from "@/utils/mapPoseToDogAction.js";

/**
 * Priority:
 *  1) previewPose (timed)
 *  2) equippedPose (manual)
 *  3) highest-level unlocked skill pose
 *  4) idle
 */
export function resolveDogPoseFromTraining(
  trainingTreeState,
  now = Date.now(),
  options = {}
) {
  if (!trainingTreeState) return "idle";
  const {
    fallbackPose = "idle",
    preferEquipped = true,
    normalizePose = true,
  } = options;

  const preview = trainingTreeState.previewPose;
  const until = Number(trainingTreeState.previewUntil || 0);
  if (preview && until > now)
    return normalizePose ? resolvePoseKey(preview) : String(preview);

  const equipped = trainingTreeState.equippedPose;
  if (equipped && preferEquipped)
    return normalizePose ? resolvePoseKey(equipped) : String(equipped);

  const skills = trainingTreeState.skills || {};
  let best = null;

  for (const [id, v] of Object.entries(skills)) {
    if (!v?.unlocked) continue;
    const node = getSkillNode(id);
    if (!node?.pose) continue;

    const level = Number(v.level || 0);
    if (!best || level > best.level) best = { pose: node.pose, level };
  }

  const pose = best?.pose || fallbackPose;
  return normalizePose ? resolvePoseKey(pose) : String(pose);
}
