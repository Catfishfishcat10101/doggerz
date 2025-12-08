/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // matches <html class="dark">
  // Ensure classes used via `@apply` are preserved by the JIT/purge step
  safelist: [
    {
      pattern:
        /^(bg|text|border|ring-offset|ring|shadow|hover:bg|hover:text)-(zinc|emerald)(-.+)?$/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "ui-sans-serif", "sans-serif"],
        mono: ["Roboto Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        pixel: ['"Press Start 2P"', "system-ui", "sans-serif"],
      },
      colors: {
        doggerz: {
          bg: "#0b1020",
          neon: "#22c55e",
          neonSoft: "#4ade80",
        },
      },
      boxShadow: {
        "neon-green": "0 0 25px rgba(34,197,94,0.45)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
