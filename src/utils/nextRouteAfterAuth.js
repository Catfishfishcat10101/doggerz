// src/utils/nextRouteAfterAuth.js
export function nextRouteAfterAuth() {
  const hasName = !!(typeof localStorage !== "undefined" && localStorage.getItem("dogName"));
  return hasName ? "/play" : "/setup/new";
}
