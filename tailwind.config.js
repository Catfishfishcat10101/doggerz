/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      /* ---------- Colors ---------- */
      colors: {
        doggerzBlue:  "#5ac8fc",
        doggerzGreen: "#4cd964",
        doggerzBrown: "#a16207",
      },

      /* ---------- Fonts ----------- */
      fontFamily: {
        doggerz: ["Doggerz", "sans-serif"],
      },

      /* ---------- Keyframes & Animations ---------- */
      keyframes: {
        dogWalk: {
          "0%,100%": { transform: "translateX(0) scaleY(1)" },
          "25%":     { transform: "translateX(calc(var(--walk-distance)/2)) scaleY(1.05)" },
          "50%":     { transform: "translateX(var(--walk-distance)) scaleY(1)" },
          "75%":     { transform: "translateX(calc(var(--walk-distance)/2)) scaleY(0.95)" },
        },
      },
      animation: {
        "dog-walk":
          "dogWalk var(--walk-duration,1s) var(--walk-ease,linear) infinite",
      },
    },
  },

  plugins: [

  ],
};