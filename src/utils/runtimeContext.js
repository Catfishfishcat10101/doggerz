// src/utils/runtimeContext.js
import { Capacitor } from "@capacitor/core";

export function getRuntimeContextLabel() {
  try {
    return String(Capacitor?.getPlatform?.() || "web").trim() || "web";
  } catch {
    return "web";
  }
}
