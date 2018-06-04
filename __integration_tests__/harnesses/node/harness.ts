import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';
import _ from 'lodash';

import * as tests from '../../tests';

const { log } = console;

// This needs to be more sophisticated to work on Linux and Windows as well.
const openPdf = (path: string) => execSync(`open ${path}`);

const writePdfToTmp = (pdf: Uint8Array) => {
  const path = `/tmp/${Date.now()}.pdf`;
  fs.writeFileSync(path, pdf);
  return path;
};

const readFont = (font: string) =>
  fs.readFileSync(`__integration_tests__/assets/fonts/${font}`);

const assets = {
  fonts: {
    ttf: {
      ubuntu_r: readFont('ubuntu/Ubuntu-R.ttf'),
      bio_rhyme_r: readFont('bio_rhyme/BioRhymeExpanded-Regular.ttf'),
      press_start_2p_r: readFont('press_start_2p/PressStart2P-Regular.ttf'),
      indie_flower_r: readFont('indie_flower/IndieFlower.ttf'),
      great_vibes_r: readFont('great_vibes/GreatVibes-Regular.ttf'),
    },
    otf: {
      fantasque_sans_mono_bi: readFont(
        'fantasque/OTF/FantasqueSansMono-BoldItalic.otf',
      ),
      gfs_baskerville_r: readFont('gfs_baskerville/GFSBaskerville.otf'),
    },
  },
  images: {},
};

const renderTitle = (title: string) => {
  const borderLine = '='.repeat(title.length + 4);
  log(borderLine);
  log(`= ${chalk.bold(title)} =`);
  log(borderLine);
};

const renderChecklist = async (checklist: string[]) => {
  const failed = [] as string[];
  for (const item of checklist) {
    await inquirer
      .prompt([
        { type: 'confirm', name: 'confirmed', message: `Confirm that ${item}` },
      ])
      .then(({ confirmed }) => {
        if (!confirmed) failed.push(item);
      });
  }

  log();
  if (failed.length === 0) {
    log('✅   Test Passed');
  } else {
    log('❌   Test Failed');
  }
};

const main = async () => {
  for (const { kernel, title, description, checklist } of _.values(tests)) {
    renderTitle(title);
    log(description);
    const resultPdf = kernel(assets);
    const path = writePdfToTmp(resultPdf);

    log();
    log(`${chalk.bold('>')} PDF file written to: ${chalk.underline(path)}`);
    log();

    openPdf(path);
    await renderChecklist(checklist);
    log();
  }
};

main();
