const fs = require("fs");

const path = "src/components/brand/HeroDog3D.jsx";
let source = fs.readFileSync(path, "utf8");

// Lock HeroDog3D default animation to the safest idle clip.
source = source.replace(
  /animationName\s*=\s*["'][^"']+["']/,
  'animationName = "Idle_1"'
);

// Remove debug logging prop from the rendered model.
source = source.replace(/\n\s*debugAnimations/g, "");

// Keep smooth idle speed.
if (source.indexOf("animationSpeed={0.85}") === -1) {
  source = source.replace(
    "animationName={animationName}",
    "animationName={animationName}\n          animationSpeed={0.85}"
  );
}

fs.writeFileSync(path, source);
console.log("HeroDog3D locked to Idle_1 with smooth idle speed.");
