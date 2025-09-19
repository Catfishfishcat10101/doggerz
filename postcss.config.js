// postcss.config.js
const isProd = process.env.NODE_ENV === "production";

/**
 * Order matters:
 *  - import first so @import files are inlined before Tailwind scans
 *  - nesting before Tailwind so nested selectors expand into utilities cleanly
 *  - tailwind then generates utilities
 *  - preset-env adds prefixes & polyfills
 *  - cssnano only in production for minification
 */
export default {
  plugins: [
    // Let you write `@import "..."` in CSS; resolves relative to the file
    require("postcss-import"),

    // Standards-based nesting (no Sass needed)
    require("postcss-nesting"),

    // Tailwind (reads tailwind.config.js and your content globs)
    require("tailwindcss"),

    // Modern CSS → widely compatible CSS (prefixes, features)
    require("postcss-preset-env")({
      stage: 3,
      features: {
        "nesting-rules": true,          // ensure nesting even if plugin above is removed
        "custom-media-queries": true,   // use @custom-media
        "media-query-ranges": true,     // range syntax: @media (width >= 640px)
        "logical-properties-and-values": false, // opt out if using Tailwind utilities instead
      },
      autoprefixer: { grid: false },    // grid prefixes often not worth it for apps
      // respects your browserslist in package.json
    }),

    // Prod-only minification (safe defaults)
    ...(isProd ? [require("cssnano")({ preset: "default" })] : []),
  ],
};
