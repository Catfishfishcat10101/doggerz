// Centralized color palette for Doggerz
// Export values for JS and a helper to inject CSS variables for global use.

export const PALETTE = {
  // Brand
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },

  // Neutrals (dark UI)
  neutral: {
    900: "#0b0b0c",
    800: "#111214",
    700: "#161718",
    600: "#1f1f23",
    500: "#27272a",
    400: "#3f3f46",
    300: "#52525b",
    200: "#737373",
    100: "#a3a3a3",
  },

  // Accents
  accent: {
    sky: "#38bdf8",
    amber: "#f59e0b",
    rose: "#fb7185",
  },
};

// Helper: return a CSS variables string to inject into a style tag or document root
export function cssVars() {
  const lines = [];
  lines.push(`--dg-emerald-500: ${PALETTE.emerald[500]};`);
  lines.push(`--dg-emerald-300: ${PALETTE.emerald[300]};`);
  lines.push(`--dg-bg: ${PALETTE.neutral[900]};`);
  lines.push(`--dg-surface: ${PALETTE.neutral[800]};`);
  lines.push(`--dg-muted: ${PALETTE.neutral[400]};`);
  lines.push(`--dg-accent-sky: ${PALETTE.accent.sky};`);
  return lines.join("\n");
}

export default PALETTE;
