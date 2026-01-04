/** @format */

// src/utils/resolveDogPoseFromTraining.js
import { getSkillNode } from "@/constants/trainingTree.js";

/**
 * Priority:
 *  1) previewPose (timed)
 *  2) equippedPose (manual)
 *  3) highest-level unlocked skill pose
 *  4) idle
 */
export function resolveDogPoseFromTraining(
  trainingTreeState,
  now = Date.now()
) {
  if (!trainingTreeState) return "idle";

  const preview = trainingTreeState.previewPose;
  const until = Number(trainingTreeState.previewUntil || 0);
  if (preview && until > now) return String(preview);

  const equipped = trainingTreeState.equippedPose;
  if (equipped) return String(equipped);

  const skills = trainingTreeState.skills || {};
  let best = null;

  for (const [id, v] of Object.entries(skills)) {
    if (!v?.unlocked) continue;
    const node = getSkillNode(id);
    if (!node?.pose) continue;

    const level = Number(v.level || 0);
    if (!best || level > best.level) best = { pose: node.pose, level };
  }

  return best?.pose || "idle";
}
