import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(root, 'dist');

/**
 * Copy a package's published dist into pdf-lib's dist/ for clean export paths.
 * @param {string} name
 * @param {string} srcDir
 */
function mirrorPackage(name, srcDir) {
  const from = path.join(srcDir, 'dist');
  const to = path.join(distRoot, name);
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });

  for (const entry of fs.readdirSync(from)) {
    const src = path.join(from, entry);
    const dest = path.join(to, entry);
    if (fs.statSync(src).isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  console.log(`Mirrored ${name} -> dist/${name}/`);
}

mirrorPackage('upng', path.join(root, 'src/packages/upng'));
mirrorPackage('standard-fonts', path.join(root, 'src/packages/standard-fonts'));
