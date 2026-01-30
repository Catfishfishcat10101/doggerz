const fs = require("fs");
const path = require("path");
let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error(
    "sharp is required to run this script. Install with `npm install sharp --save-dev`"
  );
  process.exit(1);
}

const DEFAULT_FRAMES = {
  idle: 6,
  walk: 8,
  bark: 4,
  sit: 4,
  stay: 4,
  shake: 6,
  scratch: 6,
  sleep: 6,
};

const USAGE = `
Usage: node scripts/generate-sprites.js [options]

Options:
  --out <dir>            Output directory (default: public/assets/atlas)
  --stages <list>        Comma-separated stages (default: pup,adult,senior)
  --frames <json|list>   JSON map or "idle:6,walk:8" (default set)
  --condition <name>     Sprite condition (default: clean)
  --body <name>          Sprite body (default: normal)
  --mood <name>          Sprite mood (default: neutral)
  --tileW <px>           Tile width (default: 96)
  --tileH <px>           Tile height (default: 96)
  --cols <n>             Columns per sheet (default: 11)
  -h, --help             Show help
`;

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
    if (!a.startsWith("--")) {
      continue;
    }
    const eqIndex = a.indexOf("=");
    if (eqIndex !== -1) {
      const key = a.slice(2, eqIndex);
      const value = a.slice(eqIndex + 1);
      out[key] = value;
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (typeof next === "string" && !next.startsWith("--")) {
      out[key] = next;
      i += 1;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function getArg(args, name, def) {
  if (Object.prototype.hasOwnProperty.call(args, name)) return args[name];
  return def;
}

function toPositiveInt(name, value, fallback) {
  const raw = value == null ? fallback : value;
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error(`${name} must be a positive number (got "${raw}")`);
  }
  return Math.floor(num);
}

function parseFrameCounts(raw) {
  if (raw == null) return { ...DEFAULT_FRAMES };
  const text = String(raw).trim();
  if (!text) return { ...DEFAULT_FRAMES };

  let parsed = null;
  if (text.startsWith("{")) {
    parsed = JSON.parse(text);
  } else {
    parsed = {};
    const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const [name, count] = part.split(":").map((p) => p.trim());
      if (!name || !count) {
        throw new Error(`Invalid frames entry "${part}"`);
      }
      parsed[name] = count;
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("frames must be an object map");
  }

  const out = {};
  for (const [name, count] of Object.entries(parsed)) {
    const num = Number(count);
    if (!Number.isFinite(num) || num < 0) {
      throw new Error(`frames.${name} must be a non-negative number`);
    }
    out[name] = Math.floor(num);
  }
  return out;
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(USAGE.trim());
  process.exit(0);
}

function getConfig() {
  const outDir = path.resolve(
    getArg(args, "out", path.join(__dirname, "..", "public", "assets", "atlas"))
  );
  if (fs.existsSync(outDir) && !fs.statSync(outDir).isDirectory()) {
    throw new Error(`out must be a directory: ${outDir}`);
  }
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const stages = String(getArg(args, "stages", "pup,adult,senior"))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!stages.length) {
    throw new Error("stages must include at least one stage");
  }

  const frames = parseFrameCounts(
    getArg(args, "frames", JSON.stringify(DEFAULT_FRAMES))
  );
  const condition = getArg(args, "condition", "clean");
  const body = getArg(args, "body", "normal");
  const mood = getArg(args, "mood", "neutral");
  const tileW = toPositiveInt(
    "tileW",
    getArg(args, "tileW", getArg(args, "w", "96")),
    "96"
  );
  const tileH = toPositiveInt(
    "tileH",
    getArg(args, "tileH", getArg(args, "h", "96")),
    "96"
  );
  const cols = toPositiveInt("cols", getArg(args, "cols", "11"), "11");

  return {
    outDir,
    stages,
    frameCounts: frames,
    condition,
    body,
    mood,
    tileW,
    tileH,
    cols,
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

async function makeSheet(stage, config) {
  const {
    outDir,
    frameCounts,
    condition,
    body,
    mood,
    tileW,
    tileH,
    cols,
  } = config;
  const totalFrames = Object.values(frameCounts).reduce((a, b) => a + b, 0);
  if (!totalFrames) {
    throw new Error("frames must define at least one frame");
  }
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
        <text x="50%" y="50%" font-size="12" dominant-baseline="middle" text-anchor="middle" fill="#111" font-family="Arial">${escapeXml(
          name
        )}</text>
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
  const outPng = path.join(outDir, imageName);
  const outJson = path.join(outDir, `jr_${stage}.json`);

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
    const config = getConfig();
    for (const s of config.stages) {
      await makeSheet(s, config);
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
