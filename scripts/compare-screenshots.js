#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

function usage() {
  console.log(
    'Usage: node scripts/compare-screenshots.js <baselineDir> <currentDir> [--maxDiffPixels=INT]'
  );
}

async function readPng(file) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(new PNG())
      .on('parsed', function () {
        resolve(this);
      })
      .on('error', reject);
  });
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    usage();
    process.exit(2);
  }
  const baselineDir = argv[0];
  const currentDir = argv[1];
  const maxDiffPixels = (() => {
    const m = argv.find((a) => a.startsWith('--maxDiffPixels='));
    return m ? parseInt(m.split('=')[1], 10) : 0;
  })();

  if (!fs.existsSync(baselineDir)) {
    console.error('Baseline directory not found:', baselineDir);
    process.exit(3);
  }
  if (!fs.existsSync(currentDir)) {
    console.error('Current screenshots not found:', currentDir);
    process.exit(4);
  }

  const baselineFiles = fs.readdirSync(baselineDir).filter((f) => f.endsWith('.png'));
  if (baselineFiles.length === 0) {
    console.error('No baseline PNGs found in', baselineDir);
    process.exit(5);
  }

  let hadDiff = false;
  for (const file of baselineFiles) {
    const basePath = path.join(baselineDir, file);
    const curPath = path.join(currentDir, file);
    if (!fs.existsSync(curPath)) {
      console.error('Missing current screenshot for', file);
      hadDiff = true;
      continue;
    }
    const [baseImg, curImg] = await Promise.all([readPng(basePath), readPng(curPath)]);
    if (baseImg.width !== curImg.width || baseImg.height !== curImg.height) {
      console.error(
        'Dimension mismatch for',
        file,
        baseImg.width,
        'x',
        baseImg.height,
        '!=',
        curImg.width,
        'x',
        curImg.height
      );
      hadDiff = true;
      continue;
    }

    const diff = new PNG({ width: baseImg.width, height: baseImg.height });
    const diffPixels = pixelmatch(
      baseImg.data,
      curImg.data,
      diff.data,
      baseImg.width,
      baseImg.height,
      { threshold: 0.1 }
    );

    if (diffPixels > maxDiffPixels) {
      const outDir = path.join(currentDir, 'diffs');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const diffPath = path.join(outDir, file);
      diff.pack().pipe(fs.createWriteStream(diffPath));
      console.error(`Diff for ${file}: ${diffPixels} pixels (saved ${diffPath})`);
      hadDiff = true;
    } else {
      console.log(`OK ${file}: ${diffPixels} differing pixels`);
    }
  }

  if (hadDiff) {
    console.error(
      '\nPixel-diff check failed. If these changes are expected, update baseline images in tests/visual/baseline.'
    );
    process.exit(6);
  }

  console.log('All screenshots match the baseline.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(99);
});
