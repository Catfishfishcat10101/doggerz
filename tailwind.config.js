/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:   "#0b0b12",
        mint:  "#2ee6a6",
        grape: "#5a0fc8",
        sky:   "#38bdf8",
        gold:  "#ffca28",
        rose:  "#fb7185",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,.22)",
      },
      keyframes: {
        pop: { "0%": { transform:"scale(.9)" }, "100%": { transform:"scale(1)" } },
        slideUp: { "0%":{ transform:"translateY(8px)", opacity:0 }, "100%":{ transform:"translateY(0)", opacity:1 } },
      },
      animation: {
        pop: "pop .12s ease-out",
        slideUp: "slideUp .25s ease-out",
      }
    }
  },
  plugins: [],
};