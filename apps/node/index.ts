import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import readline from 'readline';

import test1 from './tests/test1';
import test10 from './tests/test10';
import test11 from './tests/test11';
import test2 from './tests/test2';
import test3 from './tests/test3';
import test4 from './tests/test4';
import test5 from './tests/test5';
import test6 from './tests/test6';
import test7 from './tests/test7';
import test8 from './tests/test8';
import test9 from './tests/test9';

const cli = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = `Press <enter> to run the next test...`;
const promptToContinue = () =>
  new Promise((resolve) => cli.question(prompt, (_answer) => resolve()));

// This needs to be more sophisticated to work on Linux and Windows as well.
const openPdf = (path: string) => {
  if (process.platform === 'darwin') {
    // TODO: Make this a CLI argument
    execSync(`open -a "Preview" ${path}`);
    // execSync(`open -a "Adobe Acrobat" ${path}`);
    // execSync(`open -a "Foxit Reader" ${path}`);
    // execSync(`open -a "Google Chrome" ${path}`);
    // execSync(`open -a "Firefox" ${path}`);
  } else {
    const msg1 = `Note: Automatically opening PDFs currently only works on Macs. If you're using a Windows or Linux machine, please consider contributing to expand support for this feature`;
    const msg2 = `(https://github.com/Hopding/pdf-lib/blob/master/apps/node/index.ts#L8-L17)\n`;
    console.warn(msg1);
    console.warn(msg2);
  }
};

const writePdfToTmp = (pdf: Uint8Array) => {
  const path = `${os.tmpdir()}/${Date.now()}.pdf`;
  fs.writeFileSync(path, pdf);
  return path;
};

const readFont = (font: string) => fs.readFileSync(`assets/fonts/${font}`);

const readImage = (image: string) => fs.readFileSync(`assets/images/${image}`);

const readPdf = (pdf: string) => fs.readFileSync(`assets/pdfs/${pdf}`);

const assets = {
  fonts: {
    ttf: {
      ubuntu_r: readFont('ubuntu/Ubuntu-R.ttf'),
      ubuntu_r_base64: String(readFont('ubuntu/Ubuntu-R.ttf.base64')),
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
      source_hans_jp: readFont('source_hans_jp/SourceHanSerifJP-Regular.otf'),
    },
  },
  images: {
    jpg: {
      cat_riding_unicorn: readImage('cat_riding_unicorn.jpg'),
      cat_riding_unicorn_base64: String(
        readImage('cat_riding_unicorn.jpg.base64'),
      ),
      minions_laughing: readImage('minions_laughing.jpg'),
    },
    png: {
      greyscale_bird: readImage('greyscale_bird.png'),
      greyscale_bird_base64_uri: String(
        readImage('greyscale_bird.png.base64.uri'),
      ),
      minions_banana_alpha: readImage('minions_banana_alpha.png'),
      minions_banana_no_alpha: readImage('minions_banana_no_alpha.png'),
      small_mario: readImage('small_mario.png'),
    },
  },
  pdfs: {
    normal: readPdf('normal.pdf'),
    normal_base64: String(readPdf('normal.pdf.base64')),
    with_update_sections: readPdf('with_update_sections.pdf'),
    with_update_sections_base64_uri: String(
      readPdf('with_update_sections.pdf.base64.uri'),
    ),
    linearized_with_object_streams: readPdf(
      'linearized_with_object_streams.pdf',
    ),
    with_large_page_count: readPdf('with_large_page_count.pdf'),
    with_missing_endstream_eol_and_polluted_ctm: readPdf(
      'with_missing_endstream_eol_and_polluted_ctm.pdf',
    ),
    with_newline_whitespace_in_indirect_object_numbers: readPdf(
      'with_newline_whitespace_in_indirect_object_numbers.pdf',
    ),
    with_comments: readPdf('with_comments.pdf'),
  },
};

export type Assets = typeof assets;

const main = async () => {
  try {
    const testIdx = process.argv[2] ? Number(process.argv[2]) : undefined;

    // prettier-ignore
    const allTests = [
    test1, test2, test3, test4, test5, test6, test7, test8, test9, test10,
    test11
  ];

    const tests = testIdx ? [allTests[testIdx - 1]] : allTests;

    let idx = testIdx || 1;
    for (const test of tests) {
      console.log(`Running test #${idx}`);
      const pdfBytes = await test(assets);
      const path = writePdfToTmp(pdfBytes);
      console.log(`> PDF file written to: ${path}`);
      openPdf(path);
      idx += 1;
      await promptToContinue();
      console.log();
    }

    console.log('Done!');
  } finally {
    cli.close();
  }
};

main();
