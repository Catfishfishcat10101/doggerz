module.exports = {
  plugins: {
    /* 1) Unwrap nested selectors first */
    "postcss-nested": {},

    /* 2) Run Tailwind to generate utilities */
    tailwindcss: {},

    /* 3) Add vendor prefixes last */
    autoprefixer: {},
  },
};