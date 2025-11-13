
// tailwind.config.cjs
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
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto"],
      },
      // tweak these to your Doggerz palette / styles
      colors: {
        doggerz: {
          bark: "#0b1120",
          sky: "#38bdf8",
        },
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.25)",
      },

      // Sprite + float animations for the pup
      keyframes: {
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
        },
      },
      animation: {
        "sprite-walk":
          "sprite-walk steps(var(--sprite-frames)) calc(1000ms / var(--sprite-fps)) infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};