const fs = require("fs");
const path = require("path");
let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error(
    "sharp is required to run this script. Install with `npm install sharp --save-dev`",
  );
  process.exit(1);
}

// Simple CLI parsing so callers can override defaults.
const argv = process.argv.slice(2);
function arg(name, def) {
  const prefix = `--${name}=`;
  const m = argv.find((a) => a.startsWith(prefix));
  if (!m) return def;
  return m.slice(prefix.length);
}

const OUT_DIR = path.resolve(
  arg("out", path.join(__dirname, "..", "public", "assets", "atlas")),
);
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const STAGES = arg("stages", "pup,adult,senior")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const frameCounts = JSON.parse(
  arg(
    "frames",
    JSON.stringify({
      idle: 6,
      walk: 8,
      bark: 4,
      sit: 4,
      stay: 4,
      shake: 6,
      scratch: 6,
      sleep: 6,
    }),
  ),
);
const condition = arg("condition", "clean");
const body = arg("body", "normal");
const mood = arg("mood", "neutral");
const tileW = Number(arg("tileW", "96"));
const tileH = Number(arg("tileH", "96"));
const cols = Number(arg("cols", "11"));

function pad(n) {
  return String(n).padStart(2, "0");
}

async function makeSheet(stage) {
  const totalFrames = Object.values(frameCounts).reduce((a, b) => a + b, 0);
  const rows = Math.max(1, Math.ceil(totalFrames / cols));
  const width = cols * tileW;
  const height = rows * tileH;

  const composites = [];
  const framesJson = {};
  const animations = {};
  let idxGlobal = 0;

  for (const anim of Object.keys(frameCounts)) {
    const count = frameCounts[anim];
    animations[anim] = [];
    for (let i = 0; i < count; i++) {
      const name = `jr_${stage}_${condition}_${body}_${mood}_${anim}_${pad(i)}`;
      const col = idxGlobal % cols;
      const row = Math.floor(idxGlobal / cols);
      const x = col * tileW;
      const y = row * tileH;

      // simple SVG tile with colored background and label
      const colorHue = Math.floor((idxGlobal / Math.max(1, totalFrames)) * 360);
      const svg = `<svg width="${tileW}" height="${tileH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="hsl(${colorHue} 70% 60%)"/>
        <text x="50%" y="50%" font-size="12" dominant-baseline="middle" text-anchor="middle" fill="#111" font-family="Arial">${name}</text>
      </svg>`;

      composites.push({ input: Buffer.from(svg), left: x, top: y });

      framesJson[name] = {
        frame: { x, y, w: tileW, h: tileH },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: tileW, h: tileH },
        sourceSize: { w: tileW, h: tileH },
      };

      animations[anim].push(name);
      idxGlobal++;
    }
  }

  const imageName = `jr_${stage}.png`;
  const outPng = path.join(OUT_DIR, imageName);
  const outJson = path.join(OUT_DIR, `jr_${stage}.json`);

  // create base transparent image then composite tiles
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(outPng);

  const json = {
    frames: framesJson,
    animations,
    meta: {
      app: "doggerz-spritegen",
      version: "1.1",
      image: imageName,
      format: "RGBA8888",
      size: { w: width, h: height },
      scale: "1",
    },
  };

  fs.writeFileSync(outJson, JSON.stringify(json, null, 2));
  console.log("Wrote", outPng, outJson);
}

async function main() {
  try {
    for (const s of STAGES) {
      await makeSheet(s);
    }
    console.log("Done generating sprite sheets.");
  } catch (err) {
    console.error("Sprite generation failed:", err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
