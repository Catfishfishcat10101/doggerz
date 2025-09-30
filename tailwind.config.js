/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto"] },
      colors: {
        bgd: {
          900: "#0b1020",
          800: "#0f1730",
        },
      },
      boxShadow: {
        card: "0 8px 30px rgb(0 0 0 / 0.25)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
