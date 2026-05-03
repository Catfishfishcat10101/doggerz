/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      colors: {
        doggerz: {
          bg: "#020617",
          panel: "#0f172a",
          card: "#111827",
          green: "#22c55e",
          emerald: "#10b981",
          cyan: "#38bdf8",
          gold: "#fbbf24",
          danger: "#ef4444",
        },
      },

      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        glow: "0 0 32px rgba(16, 185, 129, 0.3)",
        soft: "0 24px 80px rgba(0, 0, 0, 0.4)",
        stage: "0 28px 90px rgba(2, 6, 23, 0.48)",
      },

      borderRadius: {
        doggerz: "1.75rem",
      },

      backgroundImage: {
        "doggerz-radial":
          "radial-gradient(circle at top, rgba(16, 185, 129, 0.18), transparent 34rem)",
        "doggerz-night":
          "linear-gradient(180deg, #07111f 0%, #020617 55%, #000000 100%)",
      },
    },
  },

  plugins: [],
};
