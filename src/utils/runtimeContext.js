import { Capacitor } from "@capacitor/core";

export function getRuntimeContextLabel() {
  try {
    const platform =
      String(Capacitor?.getPlatform?.() || "web").trim() || "web";
    const nativeShell =
      typeof Capacitor?.isNativePlatform === "function"
        ? Capacitor.isNativePlatform()
        : platform !== "web";
    return nativeShell ? platform : "web";
  } catch {
    return "web";
  }
}

export default getRuntimeContextLabel;
