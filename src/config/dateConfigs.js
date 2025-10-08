// Centralize Intl options so dates look the same everywhere.
export const DATE_FMT = Object.freeze({
  short: { year: "2-digit", month: "2-digit", day: "2-digit" },
  medium: { year: "numeric", month: "short", day: "numeric" },
  long: { year: "numeric", month: "long", day: "numeric", weekday: "long" },
});

export const TIME_FMT = Object.freeze({
  short: { hour: "2-digit", minute: "2-digit" },
  medium: { hour: "2-digit", minute: "2-digit", second: "2-digit" },
});

export function fmtDate(d, style = "medium", locale = undefined) {
  const dt = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat(locale, DATE_FMT[style] || DATE_FMT.medium).format(dt);
}

export function fmtTime(d, style = "short", locale = undefined) {
  const dt = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat(locale, TIME_FMT[style] || TIME_FMT.short).format(dt);
}

export function fmtDateTime(d, locale = undefined) {
  const dt = d instanceof Date ? d : new Date(d);
  return `${fmtDate(dt, "medium", locale)} ${fmtTime(dt, "short", locale)}`;
}
