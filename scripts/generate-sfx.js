/** @format */

// scripts/generate-sfx.js
// Deterministic (no external downloads) tiny WAV SFX generator for Doggerz.

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "audio");

const SAMPLE_RATE = 22050;

function clamp01(v) {
  return Math.max(0, Math.min(1, Number(v) || 0));
}

function clamp11(v) {
  return Math.max(-1, Math.min(1, Number(v) || 0));
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function writeWavMono16(filePath, samples, sampleRate = SAMPLE_RATE) {
  const numSamples = samples.length;
  const bytesPerSample = 2; // int16
  const blockAlign = bytesPerSample; // mono
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;

  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);

  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // PCM fmt chunk size
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(16, 34); // bits

  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i += 1) {
    const s = clamp11(samples[i]);
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buf);
}

function envAD(t, attack, decay) {
  if (t < 0) return 0;
  if (t < attack) return t / Math.max(1e-6, attack);
  const d = (t - attack) / Math.max(1e-6, decay);
  return Math.max(0, 1 - d);
}

function genWhine({ seconds = 0.7, f0 = 420, f1 = 920, seed = 1337 } = {}) {
  const n = Math.max(1, Math.floor(seconds * SAMPLE_RATE));
  const rand = mulberry32(seed);
  let phase = 0;
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const k = t / Math.max(1e-6, seconds);
    const freq = f0 + (f1 - f0) * k;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;

    // Subtle vibrato + breathiness.
    const vibrato = Math.sin(2 * Math.PI * 6 * t) * 0.015;
    const tone = Math.sin(phase * (1 + vibrato));
    const breath = (rand() * 2 - 1) * 0.06;

    const amp = envAD(t, 0.03, seconds - 0.03);
    out[i] = (tone * 0.55 + breath) * clamp01(amp);
  }
  return out;
}

function genBark({ seconds = 0.26, seed = 4242 } = {}) {
  const n = Math.max(1, Math.floor(seconds * SAMPLE_RATE));
  const rand = mulberry32(seed);
  let phase = 0;
  const out = new Array(n);

  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const burst1 = envAD(t, 0.01, 0.11);
    const burst2 = envAD(t - 0.12, 0.01, 0.12);
    const env = Math.max(burst1 * 0.9, burst2);

    const baseFreq = 170 + 35 * Math.sin(2 * Math.PI * 2.4 * t);
    phase += (2 * Math.PI * baseFreq) / SAMPLE_RATE;
    const tone = Math.sin(phase) * 0.25 + Math.sin(phase * 2.1) * 0.08;
    const noise = (rand() * 2 - 1) * 0.85;

    out[i] = clamp11((noise * 0.55 + tone) * env);
  }
  return out;
}

function genScratch({ seconds = 0.38, seed = 9001 } = {}) {
  const n = Math.max(1, Math.floor(seconds * SAMPLE_RATE));
  const rand = mulberry32(seed);
  const out = new Array(n);

  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const env = envAD(t, 0.01, seconds - 0.01);
    const chatter =
      0.5 + 0.5 * Math.sin(2 * Math.PI * (34 + 6 * Math.sin(t)) * t);
    const noise = (rand() * 2 - 1) * 0.9;
    out[i] = clamp11(noise * env * chatter * 0.75);
  }
  return out;
}

function main() {
  const bark = genBark();
  const whine = genWhine();
  const scratch = genScratch();

  writeWavMono16(path.join(OUT_DIR, "bark.wav"), bark);
  writeWavMono16(path.join(OUT_DIR, "whine.wav"), whine);
  writeWavMono16(path.join(OUT_DIR, "scratch.wav"), scratch);

  // eslint-disable-next-line no-console
  console.log("[Doggerz] Generated SFX:", path.relative(ROOT, OUT_DIR));
}

main();
