// tailwind.config.cjs
<<<<<<< HEAD
const _twColors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./public/**/*.{html,js,ts,jsx,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
=======
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
>>>>>>> master
      },
    },
    extend: {
      fontFamily: {
<<<<<<< HEAD
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto"],
      },

      // Merge brand palette with explicit color palettes to ensure utilities exist
      colors: Object.assign(
        {},
        {
          zinc: _twColors.zinc,
          emerald: _twColors.emerald,
        },
        {
          doggerz: {
            bark: "#000000",
            paw: "#111827",
            sky: "#38bdf8",
            leaf: "#22c55e",
            treat: "#fbbf24",
            mange: "#9ca3af",
            bone: "#f9fafb",
            // back-compat shorter keys used earlier
            bg: "#0b1020",
            neon: "#22c55e",
            neonSoft: "#4ade80",
          },
        },
      ),

      boxShadow: {
        card: "0 8px 24px rgba(0, 0, 0, 0.25)",
=======
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto'],
      },

      // Doggerz brand palette
      colors: {
        doggerz: {
          bark: '#000000', // primary background
          paw: '#111827', // surfaces / cards
          sky: '#38bdf8', // accent cyan
          leaf: '#22c55e', // primary action green
          treat: '#fbbf24', // reward / highlight
          mange: '#9ca3af', // muted / negative / low states
          bone: '#f9fafb', // light text / subtle surfaces
        },
      },

      // Reusable card shadow
      boxShadow: {
        card: '0 8px 24px rgba(0, 0, 0, 0.25)',
>>>>>>> master
      },

      // Typographic tweak for logo / brand text
      fontSize: {
<<<<<<< HEAD
        logo: ["2.25rem", { lineHeight: "2.5rem" }], // ~text-3xl but dedicated
=======
        logo: ['2.25rem', { lineHeight: '2.5rem' }], // ~text-3xl but dedicated
>>>>>>> master
      },

      // Sprite + float animations for the pup
      keyframes: {
<<<<<<< HEAD
        "sprite-walk": {
          "0%": { backgroundPosition: "0 0" },
          "100%": {
            backgroundPosition:
              "calc(var(--sprite-size) * -1 * (var(--sprite-frames) - 1)) 0",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
=======
        'sprite-walk': {
          '0%': { backgroundPosition: '0 0' },
          '100%': {
            backgroundPosition:
              'calc(var(--sprite-size) * -1 * (var(--sprite-frames) - 1)) 0',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
>>>>>>> master
        },
      },

      animation: {
<<<<<<< HEAD
        // Use the defined CSS token: --sprite-fps-normal
        "sprite-walk":
          "sprite-walk steps(var(--sprite-frames)) calc(1000ms / var(--sprite-fps-normal)) infinite",
        float: "float 3s ease-in-out infinite",
      },
      // Safelist dynamic classes that are applied at runtime by JS/Pixi
      // or referenced via template strings so Purge/Content doesn't remove them.
      // Examples: `animate-sprite-walk`, `animate-float`, palette utilities.
      // These are intentionally minimal — add more if your runtime uses other
      // dynamic class names.
    },
  },
  safelist: [
    "animate-sprite-walk",
    "animate-float",
    { pattern: /text-doggerz-.*?/ },
    { pattern: /bg-doggerz-.*?/ },
  ],
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
=======
        'sprite-walk':
          'sprite-walk steps(var(--sprite-frames)) calc(1000ms / var(--sprite-fps)) infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
>>>>>>> master
};
