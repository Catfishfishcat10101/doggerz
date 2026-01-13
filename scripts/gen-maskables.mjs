import fs from "node:fs";
import sharp from "sharp";

const outDir = "public/icons";
fs.mkdirSync(outDir, { recursive: true });

const base192 = `${outDir}/doggerz-192.png`;
const base512 = `${outDir}/doggerz-512.png`;

async function maskable(src, size, safeScale, out) {
  const inner = Math.round(size * safeScale);
  const innerBuf = await sharp(src)
    .resize(inner, inner, { fit: "contain" })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: "#020617" },
  })
    .composite([{ input: innerBuf, gravity: "center" }])
    .png()
    .toFile(out);
}

await maskable(base192, 192, 0.8, `${outDir}/doggerz-maskable-192.png`);
await maskable(base512, 512, 0.8, `${outDir}/doggerz-maskable-512.png`);
console.log("Maskable icons generated.");
