// inspect-glb.cjs
const fs = require("fs");

const file = "public/assets/models/dog/jackrussell-doggerz.glb";
const buffer = fs.readFileSync(file);

console.log("bytes:", buffer.length);
console.log("magic:", buffer.toString("utf8", 0, 4));
console.log("version:", buffer.readUInt32LE(4));
console.log("declared length:", buffer.readUInt32LE(8));

let offset = 12;
let json = null;

while (offset + 8 <= buffer.length) {
  const chunkLength = buffer.readUInt32LE(offset);
  const chunkType = buffer.toString("utf8", offset + 4, offset + 8);
  console.log("chunk:", chunkType, "length:", chunkLength);

  if (chunkType === "JSON") {
    json = JSON.parse(
      buffer.toString("utf8", offset + 8, offset + 8 + chunkLength).trim()
    );
  }

  offset += 8 + chunkLength;
}

if (!json) {
  console.log("NO JSON chunk found.");
  process.exit(0);
}

console.log("scenes:", json.scenes?.length || 0);
console.log("nodes:", json.nodes?.length || 0);
console.log("meshes:", json.meshes?.length || 0);
console.log("materials:", json.materials?.length || 0);
console.log("skins:", json.skins?.length || 0);
console.log("animations:", json.animations?.length || 0);

if (json.animations?.length) {
  console.log("animation names:");
  for (const anim of json.animations) {
    console.log("-", anim.name || "(unnamed)");
  }
} else {
  console.log("No animations found in GLB.");
}
