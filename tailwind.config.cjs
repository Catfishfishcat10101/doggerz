/** @type {import('tailwindcss').Config} */
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto"],
      },
      colors: {
        bgd: {
          900: "#0b1020",
          800: "#0f1730",
        },
      },
      boxShadow: {
        card: "0 8px 30px rgb(0 0 0 / 0.25)",
      },
      keyframes: {
        "sprite-walk": {
          from: { backgroundPosition: "0 0" },
          to: {
            backgroundPosition:
              "calc(var(--sprite-size) * var(--sprite-frames) * -1) 0",
          },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
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
  safelist: [
    // Add any dynamic classes here to prevent purge
    // "bg-emerald-700/20", "border-emerald-400/30", "text-emerald-200/80",
  ],
  plugins: [
    forms,
    typography,
    // compact, high-contrast form fields by default
    ({ addBase }) => {
      addBase({
        ":root": { colorScheme: "dark" },
        "input, select, textarea": {
          backgroundColor: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,255,255,0.15)",
        },
      });
    },
  ],
};
