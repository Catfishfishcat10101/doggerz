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

console.log("");
console.log("Doggerz GLB animation clips:");
console.log("--------------------------------");

if (!animations.length) {
  console.log("No animations found in this GLB.");
} else {
  animations.forEach((animation, index) => {
    console.log(`${index + 1}. ${animation.name || "(unnamed animation)"}`);
  });
}

console.log("--------------------------------");
console.log(`Total animations: ${animations.length}`);
