import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { compressJson } from '../compressJson';
import { parseWin1252 } from './parseWin1252';
import { parseZapfDingbatsOrSymbol } from './parseZapfDingbatsOrSymbol';

/** Run from the pdf-lib repo root. */
const packageRoot = join(process.cwd(), 'src/packages/standard-fonts');

const main = async () => {
  const encodingsDir = join(packageRoot, 'encoding_metrics');
  const allEncodings: Record<string, unknown> = {};

  for (const fontName of ['symbol', 'zapfdingbats', 'win1252'] as const) {
    const file = join(encodingsDir, `${fontName}.txt`);
    console.log('Parsing:', file);
    const data = await readFile(file, 'utf8');

    const parser =
      fontName === 'win1252' ? parseWin1252 : parseZapfDingbatsOrSymbol;
    const jsonMetrics = parser(data);
    allEncodings[fontName] = jsonMetrics;

    await writeFile(
      join(encodingsDir, `${fontName}-encoding.json`),
      JSON.stringify(jsonMetrics),
    );
  }

  const allJson = JSON.stringify(allEncodings);
  const allCompressedJson = compressJson(allJson);

  await writeFile(join(encodingsDir, 'all-encodings.json'), allJson);
  const allCompressedJsonFile = join(
    encodingsDir,
    'all-encodings.compressed.json',
  );
  await writeFile(allCompressedJsonFile, allCompressedJson);
  await copyFile(
    allCompressedJsonFile,
    join(packageRoot, basename(allCompressedJsonFile)),
  );
};

main();
