export const EVENTS = Object.freeze({ VIEW_HOME: "view_home", CLICK_CTA: "click_cta" });
export function track(event, payload = {}) {
  if (import.meta.env.DEV) console.info("[analytics]", event, payload);
}
