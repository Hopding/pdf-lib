#!/usr/bin/env node
/**
 * Bundle a TypeScript entry with esbuild and run it (Node, CJS).
 * Usage: node scripts/run-ts.mjs <path-to.ts>
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as esbuild from 'esbuild';

const entry = process.argv[2];
if (!entry) {
  console.error('Usage: node scripts/run-ts.mjs <file.ts>');
  process.exit(1);
}

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const outDir = mkdtempSync(join(tmpdir(), 'pdf-lib-run-ts-'));
const outfile = join(outDir, 'run.cjs');

try {
  await esbuild.build({
    absWorkingDir: root,
    entryPoints: [resolve(root, entry)],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node18',
    outfile,
  });

  const result = spawnSync(process.execPath, [outfile], {
    cwd: root,
    stdio: 'inherit',
  });
  process.exit(result.status ?? 1);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
