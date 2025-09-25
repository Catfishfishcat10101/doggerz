// postcss.config.js
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import postcssPresetEnv from "postcss-preset-env";

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    postcssPresetEnv({
      stage: 3,
      features: {
        "nesting-rules": true,
      },
    }),
  ],
};
