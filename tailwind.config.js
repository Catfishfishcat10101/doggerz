/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2196f3",
        primaryd: "#1976d2",
        accent: "#21cbf5",
      },
      keyframes: {
        "float-up": {
          "0%":   { transform: "translateY(0)",   opacity: "0" },
          "30%":  { opacity: "1" },
          "100%": { transform: "translateY(-40px)", opacity: "0" },
        },
      },
      animation: {
        "float-up": "float-up 1.8s ease-in-out",
      },
    },
  },
  plugins: [],
};