import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const src = process.argv[2] || "public/backgrounds/yard_day.png";
const outDir = "public/backgrounds";

const dayOut = path.join(outDir, "backyard-day-wide.webp");
const nightOut = path.join(outDir, "backyard-night-wide.webp");

// Target "wide" frame. This will upscale your current 390x280 source (soft but workable).
const W = 1920;
const H = 1080;

await fs.mkdir(outDir, { recursive: true });

function cover(p) {
  return p.resize(W, H, {
    fit: "cover",
    position: "centre",
    kernel: "lanczos3",
  });
}

// DAY
await cover(sharp(src)).webp({ quality: 85 }).toFile(dayOut);

// NIGHT: darker + slightly desaturated + cool overlay
const overlay = await sharp({
  create: {
    width: W,
    height: H,
    channels: 4,
    background: { r: 10, g: 20, b: 45, alpha: 0.35 },
  },
})
  .png()
  .toBuffer();

await cover(sharp(src))
  .modulate({ brightness: 0.45, saturation: 0.75 })
  .composite([{ input: overlay, blend: "overlay" }])
  .gamma(1.15)
  .webp({ quality: 85 })
  .toFile(nightOut);

console.log("Wrote:");
console.log(" -", dayOut);
console.log(" -", nightOut);
