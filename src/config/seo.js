// src/config/seo.js
export const APP_COPYRIGHT = `© ${new Date().getFullYear()} Doggerz Inc. All rights reserved.`;
export function metaForRoute(route) {
  switch (route) {
    case "/": return { title: "Doggerz — Raise, Train, Bond", description: "Raise, train, bond with your virtual pup. Pet dog simulator." };
    default:  return { title: "Doggerz", description: "Virtual pup sim." };
  }
}
