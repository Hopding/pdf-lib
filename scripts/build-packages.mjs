import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const upngDir = path.join(root, 'src/packages/upng');
const fontsDir = path.join(root, 'src/packages/standard-fonts');

function cleanDist(dir) {
  const dist = path.join(dir, 'dist');
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });
}

function umdFooter(globalName, unwrapDefault) {
  const unwrap = unwrapDefault
    ? `${globalName} = ${globalName}.default ?? ${globalName};`
    : '';
  return [
    unwrap,
    'if (typeof module === "object" && module.exports) {',
    `  module.exports = ${globalName};`,
    '}',
    'if (typeof define === "function" && define.amd) {',
    `  define(function () { return ${globalName}; });`,
    '}',
  ]
    .filter(Boolean)
    .join('\n');
}

async function buildDual({ dir, entryPoints, platform = 'neutral' }) {
  const shared = {
    absWorkingDir: dir,
    entryPoints,
    bundle: true,
    platform,
    target: 'es2015',
    sourcemap: true,
    external: ['fflate'],
    logLevel: 'info',
    loader: { '.json': 'json' },
  };

  await Promise.all([
    esbuild.build({
      ...shared,
      format: 'esm',
      outdir: 'dist',
      outExtension: { '.js': '.mjs' },
    }),
    esbuild.build({
      ...shared,
      format: 'cjs',
      outdir: 'dist',
      outExtension: { '.js': '.cjs' },
      footer: {
        js: 'module.exports = module.exports.default ?? module.exports;',
      },
    }),
  ]);
}

async function buildUmd({
  dir,
  entry,
  outfile,
  globalName,
  unwrapDefault = false,
}) {
  await esbuild.build({
    absWorkingDir: dir,
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    globalName,
    platform: 'browser',
    target: 'es2015',
    outfile: path.join(dir, outfile),
    sourcemap: true,
    // Bundle fflate for a self-contained CDN build.
    external: [],
    logLevel: 'info',
    loader: { '.json': 'json' },
    footer: {
      js: umdFooter(globalName, unwrapDefault),
    },
  });
}

cleanDist(upngDir);
cleanDist(fontsDir);

await buildDual({
  dir: upngDir,
  entryPoints: ['index.ts'],
});

await buildDual({
  dir: fontsDir,
  entryPoints: ['index.ts'],
});

await buildUmd({
  dir: upngDir,
  entry: 'index.ts',
  outfile: 'dist/index.umd.js',
  globalName: 'UPNG',
  unwrapDefault: true,
});

await buildUmd({
  dir: fontsDir,
  entry: 'index.ts',
  outfile: 'dist/index.umd.js',
  globalName: 'StandardFonts',
});

// Emit .d.ts via each package's tsconfig (outDir: dist) so declarations
// never land next to sources and get picked up by the root include.
const { execFileSync } = await import('node:child_process');
function emitDeclarations(pkgDir) {
  execFileSync(
    process.execPath,
    [
      path.join(root, 'node_modules/typescript/bin/tsc'),
      '-p',
      path.join(pkgDir, 'tsconfig.json'),
      '--emitDeclarationOnly',
    ],
    { stdio: 'inherit' },
  );
}

emitDeclarations(upngDir);
emitDeclarations(fontsDir);

console.log('Built upng and standard-fonts (esm + cjs + umd + types)');
