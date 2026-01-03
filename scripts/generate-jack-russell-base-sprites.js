/**
 * eslint-disable no-console
 * @format
 */

// scripts/generate-jack-russell-base-sprites.js
// Generates NEW (stylized) base sprites for a Jack Russell across life stages.
// These are simple vector silhouettes (not photoreal) but fully functional as
// sources for the frame/strip pipeline.
//
// Output:
//  - public/sprites/jack_russell_puppy.webp
//  - public/sprites/jack_russell_adult.webp
//  - public/sprites/jack_russell_senior.webp
//
// Usage:
//   node scripts/generate-jack-russell-base-sprites.js

const path = require('node:path');
const fs = require('node:fs/promises');

let sharp;
try {
  // eslint-disable-next-line global-require
  sharp = require('sharp');
} catch {
  console.error('[Doggerz] Missing dependency: sharp');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');

const OUT_DIR = path.join(ROOT, 'public', 'sprites');

const SIZE = 1024;

function svgForStage(stage) {
  // Simple "Jack Russell-ish" silhouette using common coat colors.
  // We vary proportions to suggest puppy/adult/senior.
  const bg = 'transparent';
  // Mostly white coat with warm tan spots (classic JRT).
  const coat = '#fbfbf8';
  const patch = '#b7793b';
  const outline = 'rgba(0,0,0,0.18)';
  const gray = '#cbd5e1';

  const spec = {
    puppy: {
      scale: 0.92,
      bodyY: 650,
      headY: 520,
      headScale: 1.08,
      legLen: 150,
      tailWag: -12,
      muzzleFill: coat,
      eyeY: 505,
    },
    adult: {
      scale: 1.0,
      bodyY: 660,
      headY: 530,
      headScale: 1.0,
      legLen: 165,
      tailWag: -6,
      muzzleFill: coat,
      eyeY: 515,
    },
    senior: {
      scale: 0.98,
      bodyY: 675,
      headY: 545,
      headScale: 0.98,
      legLen: 155,
      tailWag: -2,
      muzzleFill: gray,
      eyeY: 530,
    },
  }[stage];

  if (!spec) throw new Error(`Unknown stage: ${stage}`);

  // Coordinate system: 0..1024
  // We'll draw a ground shadow + dog body/head/legs/tail.
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" result="shadow"/>
      <feMerge>
        <feMergeNode in="shadow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- subtle fur texture (very light, keeps file sizes reasonable) -->
    <filter id="furTexture" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="
        0 0 0 0 0
        0 0 0 0 0
        0 0 0 0 0
        0 0 0 0.06 0" result="alphaNoise"/>
      <feComposite in="alphaNoise" in2="SourceGraphic" operator="in" result="maskedNoise"/>
      <feBlend in="SourceGraphic" in2="maskedNoise" mode="multiply"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="${bg}"/>

  <!-- ground shadow -->
  <ellipse cx="520" cy="840" rx="290" ry="70" fill="rgba(0,0,0,0.25)" filter="url(#softShadow)"/>

  <g transform="translate(520,560) scale(${
    spec.scale
  }) translate(-520,-560)" filter="url(#furTexture)">

    <!-- tail -->
    <g transform="translate(760,610) rotate(${
      spec.tailWag
    }) translate(-760,-610)">
      <path d="M740 625 C 780 595, 845 575, 900 610" fill="none" stroke="${coat}" stroke-width="36" stroke-linecap="round"/>
      <path d="M740 625 C 780 595, 845 575, 900 610" fill="none" stroke="${outline}" stroke-width="38" stroke-linecap="round" opacity="0.35"/>
    </g>

    <!-- body -->
    <ellipse cx="560" cy="${spec.bodyY}" rx="285" ry="185" fill="${coat}"/>
    <!-- tan spots (keep it mostly white) -->
    <ellipse cx="670" cy="${
      spec.bodyY - 55
    }" rx="95" ry="78" fill="${patch}" opacity="0.92"/>
    <ellipse cx="600" cy="${
      spec.bodyY + 25
    }" rx="62" ry="48" fill="${patch}" opacity="0.88"/>
    <ellipse cx="750" cy="${
      spec.bodyY + 15
    }" rx="42" ry="32" fill="${patch}" opacity="0.86"/>
    <ellipse cx="500" cy="${
      spec.bodyY - 20
    }" rx="44" ry="34" fill="${patch}" opacity="0.74"/>
    <ellipse cx="560" cy="${
      spec.bodyY
    }" rx="288" ry="188" fill="none" stroke="${outline}" stroke-width="10"/>

    <!-- legs -->
    <g fill="${coat}" stroke="${outline}" stroke-width="8" opacity="0.98">
      <rect x="415" y="${spec.bodyY + 90}" width="78" height="${
    spec.legLen
  }" rx="26"/>
      <rect x="505" y="${spec.bodyY + 105}" width="78" height="${
    spec.legLen - 10
  }" rx="26"/>
      <rect x="600" y="${spec.bodyY + 105}" width="78" height="${
    spec.legLen - 10
  }" rx="26"/>
      <rect x="690" y="${spec.bodyY + 90}" width="78" height="${
    spec.legLen
  }" rx="26"/>
    </g>

    <!-- head -->
    <g transform="translate(380,${spec.headY}) scale(${
    spec.headScale
  }) translate(-380,-${spec.headY})">
      <ellipse cx="380" cy="${spec.headY}" rx="155" ry="135" fill="${coat}"/>
      <!-- face patch + small cheek spot (tan) -->
      <ellipse cx="322" cy="${
        spec.headY - 18
      }" rx="74" ry="62" fill="${patch}" opacity="0.90"/>
      <ellipse cx="360" cy="${
        spec.headY + 22
      }" rx="28" ry="22" fill="${patch}" opacity="0.68"/>
      <ellipse cx="380" cy="${
        spec.headY
      }" rx="158" ry="138" fill="none" stroke="${outline}" stroke-width="10"/>

      <!-- ears -->
      <!-- long, pointy ears (JRT vibe; stylized but distinct) -->
      <path d="M290 ${spec.headY - 70}
               C 250 ${spec.headY - 160}, 208 ${spec.headY - 125}, 230 ${
    spec.headY - 25
  }
               C 244 ${spec.headY + 25}, 286 ${spec.headY + 5}, 304 ${
    spec.headY - 20
  }
               Z" fill="${patch}" opacity="0.94"/>
      <path d="M470 ${spec.headY - 70}
               C 510 ${spec.headY - 160}, 552 ${spec.headY - 125}, 530 ${
    spec.headY - 25
  }
               C 516 ${spec.headY + 25}, 474 ${spec.headY + 5}, 456 ${
    spec.headY - 20
  }
               Z" fill="${patch}" opacity="0.94"/>

      <!-- muzzle -->
      <ellipse cx="440" cy="${spec.headY + 55}" rx="105" ry="78" fill="${
    spec.muzzleFill
  }"/>
      <ellipse cx="440" cy="${
        spec.headY + 55
      }" rx="108" ry="81" fill="none" stroke="${outline}" stroke-width="8" opacity="0.35"/>

      <!-- nose -->
      <ellipse cx="485" cy="${spec.headY + 55}" rx="26" ry="20" fill="#111827"/>

      <!-- eyes -->
      <circle cx="395" cy="${spec.eyeY}" r="12" fill="#0b1220"/>
      <circle cx="448" cy="${spec.eyeY + 2}" r="10" fill="#0b1220"/>
      <circle cx="400" cy="${
        spec.eyeY - 4
      }" r="4" fill="rgba(255,255,255,0.75)"/>
    </g>

  </g>
</svg>
  `.trim();
}

async function writeStage(stage) {
  const svg = svgForStage(stage);
  const out = path.join(OUT_DIR, `jack_russell_${stage}.webp`);

  await fs.mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg))
    .resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90, effort: 5 })
    .toFile(out);

  console.log(`[Doggerz] Wrote public/sprites/jack_russell_${stage}.webp`);
}

async function main() {
  console.log(
    '[Doggerz] Generating NEW Jack Russell base sprites (stylized)...'
  );
  await writeStage('puppy');
  await writeStage('adult');
  await writeStage('senior');
  console.log('[Doggerz] Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
