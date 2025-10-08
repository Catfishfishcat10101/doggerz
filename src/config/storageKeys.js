// All local/session storage keys in one place so they never collide.
export const LS = Object.freeze({
  theme: "doggerz:theme",
  a11y: "doggerz:a11y",
  scrollPrefix: "scroll:", // used by ScrollRestorer
});

export const SS = Object.freeze({
  returnTo: "doggerz:returnTo",
});

export const keyForScroll = (routeKey) => `${LS.scrollPrefix}${routeKey}`;
// Usage: keyForScroll('someRouteKey') => 'scroll:someRouteKey'