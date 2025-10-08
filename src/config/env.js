export const DEV = import.meta.env.DEV === true;
export const PROD = import.meta.env.PROD === true;
export function v(name, fallback = "") {
  const key = `VITE_${name}`;
  const raw = import.meta.env?.[key];
  return (raw === undefined || raw === null || raw === "") ? fallback : String(raw);
}
