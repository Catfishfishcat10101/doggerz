/** @format */

// src/utils/mapPoseToDogAction.js
const POSE_TO_ACTION = {
  idle: "idle",
  alert: "idle",

  sit: "sit",
  stay: "stay",
  heel: "walk", // if you don't have heel animation yet, walk is a decent proxy

  paw: "paw",
  roll: "roll",
  bow: "bow",
  sit_pretty: "sit_pretty",

  calm_idle: "idle",
  gentle_idle: "idle",
  confident_idle: "idle",
  quiet_idle: "idle",
};

export function mapPoseToDogAction(pose) {
  const p = String(pose || "idle");
  return POSE_TO_ACTION[p] || "idle";
}
