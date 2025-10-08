export const LINKS = Object.freeze({
  twitter: "https://x.com/doggerz_app",
  github: "https://github.com/<your-username>/doggerz",
  discord: "https://discord.gg/coming-soon",
  website: "https://doggerz.app",
});

export function shareText(dogName = "my pup") {
  return `I'm raising ${dogName} in Doggerz — a pixel pup sim you can play offline. Adopt yours!`;
}

export function shareURL(path = "/") {
  const origin = import.meta.env.VITE_SITE_ORIGIN || "http://localhost:5173";
  return new URL(path, origin).toString();
}
