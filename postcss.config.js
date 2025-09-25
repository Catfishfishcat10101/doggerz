// postcss.config.js
export default {
  plugins: {
    // Stage-3+ CSS features, autoprefixing, and sensible polyfills
    "postcss-preset-env": {
      stage: 3,
      features: {
        "nesting-rules": true, // native-like CSS nesting
      },
      autoprefixer: { grid: true },
    },

    // Tailwind (order matters: preset-env first so Tailwind sees expanded rules)
    tailwindcss: {},

    // Minify in production only; Tailwind already purges dead classes.
    ...(process.env.NODE_ENV === "production" ? { cssnano: { preset: "default" } } : {}),
  },
};
