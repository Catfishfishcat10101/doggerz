import fs from "node:fs";
import path from "node:path";

const planPath = process.argv[2] || "scripts/frame-plan.jrt-real-v1.json";
const outRoot = process.argv[3] || "art/frames/jrt_real_v1";

const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const { fps, frameSize, stages, actions } = plan;

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

for (const stage of stages) {
  for (const [action, cfg] of Object.entries(actions)) {
    const dir = path.join(outRoot, stage, action);
    ensureDir(dir);

    const meta = {
      action,
      stage,
      fps,
      frameSize,
      frames: cfg.frames,
      loop: !!cfg.loop,
      startFrame: 1,
      ext: "webp",
      pattern: "frame_%04d.webp",
      source: "jrt-real-v1"
    };

    fs.writeFileSync(
      path.join(dir, "_meta.json"),
      `${JSON.stringify(meta, null, 2)}\n`,
      "utf8"
    );
  }
}

console.log(`Wrote _meta.json files to: ${outRoot}`);
