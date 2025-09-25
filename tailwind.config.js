/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindForms from "@tailwindcss/forms";
import tailwindTypography from "@tailwindcss/typography";

export default {
  darkMode: "class", // toggle with document.documentElement.classList.add('dark')
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "1.25rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "2.5rem",
      },
    },
    extend: {
      fontFamily: {
        // Ensure Inter is actually loaded (see note below)
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["ui-monospace", "SFMono-Regular", ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 1px 0 rgba(2,6,23,0.03), 0 2px 6px rgba(2,6,23,0.06), 0 8px 24px rgba(2,6,23,0.06)",
      },
      colors: {
        brand: {
          DEFAULT: "#0ea5e9", // sky-500
          strong: "#0284c7",  // sky-600
          alt: "#22d3ee",     // cyan-400
        },
      },
      keyframes: {
        pop: {
          "0%":   { transform: "translateY(6px) scale(0.85)", opacity: "0" },
          "50%":  { transform: "translateY(0) scale(1.05)",  opacity: "1" },
          "100%": { transform: "translateY(-3px) scale(1)",  opacity: "0" },
        },
        "float-soft": {
          "0%":   { transform: "translateY(0)" },
          "100%": { transform: "translateY(-4px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        clouds: {
          "0%":   { backgroundPosition: "0 8%, 0 8%" },
          "100%": { backgroundPosition: "300px 8%, 300px 8%" },
        },
        twinkle: {
          "0%":   { opacity: "0.75" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        // now you can use classnames like `animate-pop`
        pop: "pop 500ms ease",
        "float-soft": "float-soft 4s ease-in-out infinite alternate",
        shimmer: "shimmer 2s linear infinite",
        clouds: "clouds 30s linear infinite",
        twinkle: "twinkle 1.5s ease-in-out infinite alternate",
      },
      backgroundSize: {
        "shimmer-200": "200% 100%", // pair with shimmer
      },
    },
  },
  plugins: [tailwindForms, tailwindTypography],
};
