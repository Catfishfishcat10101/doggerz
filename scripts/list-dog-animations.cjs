const fs = require("fs");

const filePath = "public/assets/models/dog/jackrussell-doggerz.glb";

if (!fs.existsSync(filePath)) {
  console.error(`Missing file: ${filePath}`);
  process.exit(1);
}

const buffer = fs.readFileSync(filePath);

const magic = buffer.toString("utf8", 0, 4);
if (magic !== "glTF") {
  console.error("Not a valid GLB file.");
  process.exit(1);
}

const jsonLength = buffer.readUInt32LE(12);
const jsonType = buffer.toString("utf8", 16, 20);

if (jsonType.trim() !== "JSON") {
  console.error("Could not find JSON chunk in GLB.");
  process.exit(1);
}

const jsonText = buffer.toString("utf8", 20, 20 + jsonLength);
const gltf = JSON.parse(jsonText);

const animations = gltf.animations || [];
const accessors = gltf.accessors || [];

function inferCategory(name = "") {
  const key = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  if (key.startsWith("idle")) return "idle";
  if (key.startsWith("walk")) return "locomotion";
  if (key.startsWith("run") || key.startsWith("runfast")) return "locomotion";
  if (key.startsWith("trot")) return "locomotion";
  if (key.startsWith("turn")) return "turn";
  if (key.startsWith("jump")) return "jump";
  if (key.startsWith("sitting") || key.startsWith("cmdsit")) return "sit";
  if (key.startsWith("lie")) return "rest";
  if (key.startsWith("crouch")) return "crouch";
  if (key.startsWith("digging")) return "dig";
  if (key.startsWith("scratch")) return "dig";
  if (key.startsWith("eat") || key.startsWith("drink")) return "care";
  if (key === "bark" || key === "cmdspeak") return "voice";
  if (key === "defecate" || key === "pissing") return "potty";
  if (key.startsWith("swim")) return "swim";
  if (key.startsWith("attack") || key.startsWith("hit")) return "reaction";
  if (key.startsWith("death") || key === "fall") return "reaction";
  if (key.startsWith("pickup") || key.startsWith("putdown")) return "handler";
  if (key.startsWith("cmd")) return "command";

  return "utility";
}

function getAnimationDuration(animation) {
  const samplerDurations = (animation.samplers || [])
    .map((sampler) => accessors[sampler.input])
    .map((accessor) => accessor?.max?.[0])
    .filter((duration) => Number.isFinite(duration));

  if (!samplerDurations.length) return null;

  return Math.max(...samplerDurations);
}

console.log("");
console.log("Doggerz GLB animation clips:");
console.log("--------------------------------");
console.log(`Total animations: ${animations.length}`);
console.log("--------------------------------");

if (!animations.length) {
  console.log("No animations found in this GLB.");
} else {
  animations.forEach((animation, index) => {
    const name = animation.name || "(unnamed animation)";
    const duration = getAnimationDuration(animation);
    const durationLabel =
      duration === null ? "unknown" : `${duration.toFixed(3)}s`;

    console.log(
      `${String(index + 1).padStart(3, " ")}. ${name} | ${durationLabel} | ${inferCategory(name)}`
    );
  });
}

console.log("--------------------------------");
console.log(`Total animations: ${animations.length}`);
