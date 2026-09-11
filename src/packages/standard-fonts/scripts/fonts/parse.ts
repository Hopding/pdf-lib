import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { compressJson } from '../compressJson';
import { ICharMetrics, parseCharMetricsSection } from './parseCharacterMetrics';
import { IFontMetrics, parseFontMetricsSection } from './parseFontMetrics';
import { IKernPair, parseKernPairsSection } from './parseKernPairs';

interface IMetrics extends IFontMetrics {
  CharMetrics: ICharMetrics[];
  KernPairs: IKernPair[];
}

export type { IMetrics };

export const parseFontMetrics = (data: string): IMetrics => ({
  ...parseFontMetricsSection(data),
  CharMetrics: parseCharMetricsSection(data),
  KernPairs: parseKernPairsSection(data),
});

/** Run from the pdf-lib repo root. */
const packageRoot = join(process.cwd(), 'src/packages/standard-fonts');

const getAfmFilePaths = async () => {
  const metricsDir = join(packageRoot, 'font_metrics');
  const files = await readdir(metricsDir);
  return files
    .filter((name) => name.endsWith('.afm'))
    .map((name) => join(metricsDir, name));
};

const main = async () => {
  const afmFiles = await getAfmFilePaths();

  for (const afmFile of afmFiles) {
    console.log('Parsing:', afmFile);
    const data = await readFile(afmFile, 'utf8');

    const metrics = parseFontMetrics(data);
    const jsonMetrics = JSON.stringify(metrics);

    const jsonFile = afmFile.replace(/\.afm$/, '.json');
    const compressedJsonFile = afmFile.replace(/\.afm$/, '.compressed.json');

    await writeFile(jsonFile, jsonMetrics);
    await writeFile(compressedJsonFile, compressJson(jsonMetrics));
    await copyFile(
      compressedJsonFile,
      join(packageRoot, basename(compressedJsonFile)),
    );
  }
};

main();
