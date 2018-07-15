import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';

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

const readImage = (image: string) =>
  fs.readFileSync(`__integration_tests__/assets/images/${image}`);

const readPdf = (pdf: string) => fs.readFileSync(`test-pdfs/pdf/${pdf}`);

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
      apple_storm_r: readFont('apple_storm/AppleStormCBo.otf'),
      hussar_3d_r: readFont('hussar_3d/Hussar3DFour.otf'),
    },
  },
  images: {
    jpg: {
      cat_riding_unicorn: readImage('cat_riding_unicorn.jpg'),
      minions_laughing: readImage('minions_laughing.jpg'),
    },
    png: {
      greyscale_bird: readImage('greyscale_bird.png'),
      minions_banana_alpha: readImage('minions_banana_alpha.png'),
      minions_banana_no_alpha: readImage('minions_banana_no_alpha.png'),
      small_mario: readImage('small_mario.png'),
    },
  },
  pdfs: {
    normal: readPdf('dc/inst/dc_ins_2210.pdf'),
    with_update_sections: readPdf('fd/form/F1040V.pdf'),
    linearized_with_object_streams: readPdf('ef/inst/ef_ins_1040.pdf'),
    with_large_page_count: fs.readFileSync('pdf_specification.pdf'),
    with_missing_endstream_eol_and_polluted_ctm: fs.readFileSync(
      'test-pdfs/receipt.pdf',
    ),
  },
};

const renderTitle = (title: string) => {
  const borderLine = '='.repeat(title.length + 4);
  log(borderLine);
  log(`= ${chalk.bold(title)} =`);
  log(borderLine);
};

const renderChecklist = async (checklist: string[]) => {
  const failed = [] as string[];
  for (let i = 0; i < checklist.length; i++) {
    const item = checklist[i];
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
  const testValues = Object.values(tests);
  for (let i = 0; i < testValues.length; i++) {
    const { kernel, title, description, checklist } = testValues[i];
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
