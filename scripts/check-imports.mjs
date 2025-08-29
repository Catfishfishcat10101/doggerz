import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const root = process.cwd();
const exts = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];

const importRegex = /import\s+(?:([\w$]+)|\*\s+as\s+([\w$]+)|\{([^}]+)\})(?:\s*,\s*([\w$]+))?\s+from\s+['"]([^'"]+)['"]/gim;

async function walk(dir){
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for(const e of entries){
    const full = path.join(dir, e.name);
    if(e.isDirectory()) await walk(full);
    else if(/\.(js|jsx|ts|tsx)$/i.test(e.name)) await checkFile(full);
  }
}

async function exists(p){
  try { await fs.access(p); return true; } catch { return false; }
}

function candidates(base, spec){
  if(spec.startsWith('.') || spec.startsWith('/')) {
    return exts.map(suf => path.resolve(path.dirname(base), spec + suf));
  }
  return [];
}

async function checkPackageExport(pkg, names){
  try {
    const mod = require(pkg);
    const keys = Object.keys(mod);
    const exportSet = new Set(keys);
    if('default' in mod) exportSet.add('default');
    const missing = [];
    for(const n of names){
      if(!exportSet.has(n)) missing.push(n);
    }
    return { found: true, missing };
  } catch (err) {
    return { found: false, error: String(err) };
  }
}

async function checkFile(file){
  const src = await fs.readFile(file, 'utf8');
  let m;
  importRegex.lastIndex = 0;
  while((m = importRegex.exec(src))){
    const defaultImport = m[1]?.trim();
    const namespaceImport = m[2]?.trim();
    const namedList = m[3]?.trim();
    const secondaryDefault = m[4]?.trim();
    const spec = m[5].trim();
    if(spec.startsWith('.') || spec.startsWith('/')){
      const cands = candidates(file, spec);
      const ok = await Promise.any(cands.map(async c => await exists(c)).concat([Promise.resolve(false)])).catch(()=>false);
      if(!ok){
        console.error(`[MISSING FILE] ${path.relative(root,file)} -> ${spec}`);
        for(const c of cands.slice(0,6)) console.error('  tried:', path.relative(root,c));
      }
    } else {
      let names = [];
      if(namedList) names = namedList.split(',').map(s=>s.split('as')[0].trim()).filter(Boolean);
      if(defaultImport) names.push('default');
      if(secondaryDefault) names.push('default');
      if(namespaceImport) continue;
      if(names.length){
        const res = await checkPackageExport(spec, names);
        if(!res.found){
          console.error(`[PKG ERROR] ${path.relative(root,file)} -> failed to load package '${spec}': ${res.error}`);
        } else if(res.missing.length){
          console.error(`[MISSING EXPORT] ${path.relative(root,file)} -> ${spec} does not export: ${res.missing.join(', ')}`);
        }
      }
    }
  }
}

(async ()=>{
  console.log('checking imports in', root);
  await walk(path.join(root,'src'));
  console.log('done. Paste output here if you want fixes for reported lines.');
})();