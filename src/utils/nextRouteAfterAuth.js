// src/utils/nextRouteAfterAuth.js
export function nextRouteAfterAuth() {
  try {
    if (typeof localStorage === "undefined") return "/setup/new";
    const name = (localStorage.getItem("dogName") || "").trim();
    return name ? "/play" : "/setup/new";
  } catch {
    // If storage is blocked, fall back to setup
    return "/setup/new";
  }
}
