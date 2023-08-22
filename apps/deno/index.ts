import { readLines } from 'https://deno.land/std@0.67.0/io/bufio.ts';
import { SEP, dirname } from 'https://deno.land/std@0.67.0/path/mod.ts';

import { default as test1 } from './tests/test1.ts';
import { default as test2 } from './tests/test2.ts';
import { default as test3 } from './tests/test3.ts';
import { default as test4 } from './tests/test4.ts';
import { default as test5 } from './tests/test5.ts';
import { default as test6 } from './tests/test6.ts';
import { default as test7 } from './tests/test7.ts';
import { default as test8 } from './tests/test8.ts';
import { default as test9 } from './tests/test9.ts';
import { default as test10 } from './tests/test10.ts';
import { default as test11 } from './tests/test11.ts';
import { default as test12 } from './tests/test12.ts';
import { default as test13 } from './tests/test13.ts';
import { default as test14 } from './tests/test14.ts';
import { default as test15 } from './tests/test15.ts';
import { default as test16 } from './tests/test16.ts';
import { default as test17 } from './tests/test17.ts';
import { default as test18 } from './tests/test18.ts';

const promptToContinue = () => {
  const prompt = 'Press <enter> to run the next test...';
  Deno.stdout.write(new TextEncoder().encode(prompt));
  return readLines(Deno.stdin).next();
};

// This needs to be more sophisticated to work on Linux as well.
const openPdf = (path: string, reader: string = '') => {
  if (Deno.build.os === 'darwin') {
    Deno.run({ cmd: ['open', '-a', reader || 'Preview', path] });
    // Deno.run({ cmd: ['open', '-a', 'Preview', path] });
    // Deno.run({ cmd: ['open', '-a', 'Adobe Acrobat', path] });
    // Deno.run({ cmd: ['open', '-a', 'Foxit Reader', path] });
    // Deno.run({ cmd: ['open', '-a', 'Google Chrome', path] });
    // Deno.run({ cmd: ['open', '-a', 'Firefox', path] });
  } else if (Deno.build.os === 'windows') {
    // Opens with the default PDF Reader, has room for improvment
    Deno.run({ cmd: ['cmd', '/c', 'start', path] });
  } else {
    const msg1 = `Note: Automatically opening PDFs currently only works on Macs and Windows. If you're using a Linux machine, please consider contributing to expand support for this feature`;
    const msg2 = `(https://github.com/Hopding/pdf-lib/blob/master/apps/node/index.ts#L8-L17)\n`;
    console.warn(msg1);
    console.warn(msg2);
  }
};

const tempDir = () => dirname(Deno.makeTempDirSync());

const writePdfToTmp = (pdf: Uint8Array) => {
  const path = `${tempDir()}${SEP}${Date.now()}.pdf`;
  Deno.writeFileSync(path, pdf);
  return path;
};

const readFont = (font: string) => Deno.readFileSync(`assets/fonts/${font}`);

const readImage = (image: string) =>
  Deno.readFileSync(`assets/images/${image}`);

const readPdf = (pdf: string) => Deno.readFileSync(`assets/pdfs/${pdf}`);

const decoder = new TextDecoder('utf-8');
const readBase64Font = (font: string) => decoder.decode(readFont(font));
const readBase64Image = (image: string) => decoder.decode(readImage(image));
const readBase64Pdf = (pdf: string) => decoder.decode(readPdf(pdf));

const assets = {
  fonts: {
    ttf: {
      ubuntu_r: readFont('ubuntu/Ubuntu-R.ttf'),
      ubuntu_r_base64: readBase64Font('ubuntu/Ubuntu-R.ttf.base64'),
      bio_rhyme_r: readFont('bio_rhyme/BioRhymeExpanded-Regular.ttf'),
      press_start_2p_r: readFont('press_start_2p/PressStart2P-Regular.ttf'),
      indie_flower_r: readFont('indie_flower/IndieFlower.ttf'),
      great_vibes_r: readFont('great_vibes/GreatVibes-Regular.ttf'),
      nunito: readFont('nunito/Nunito-Regular.ttf'),
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
      cat_riding_unicorn_base64: readBase64Image(
        'cat_riding_unicorn.jpg.base64',
      ),
      minions_laughing: readImage('minions_laughing.jpg'),
      cmyk_colorspace: readImage('cmyk_colorspace.jpg'),
    },
    png: {
      greyscale_bird: readImage('greyscale_bird.png'),
      greyscale_bird_base64_uri: readBase64Image(
        'greyscale_bird.png.base64.uri',
      ),
      minions_banana_alpha: readImage('minions_banana_alpha.png'),
      minions_banana_no_alpha: readImage('minions_banana_no_alpha.png'),
      small_mario: readImage('small_mario.png'),
      etwe: readImage('etwe.png'),
      self_drive: readImage('self_drive.png'),
      mario_emblem: readImage('mario_emblem.png'),
    },
  },
  pdfs: {
    normal: readPdf('normal.pdf'),
    normal_base64: readBase64Pdf('normal.pdf.base64'),
    with_update_sections: readPdf('with_update_sections.pdf'),
    with_update_sections_base64_uri: readBase64Pdf(
      'with_update_sections.pdf.base64.uri',
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
    with_cropbox: readPdf('with_cropbox.pdf'),
    us_constitution: readPdf('us_constitution.pdf'),
    simple_pdf_2_example: readPdf('pdf20examples/Simple PDF 2.0 file.pdf'),
    with_combed_fields: readPdf('with_combed_fields.pdf'),
    dod_character: readPdf('dod_character.pdf'),
    with_xfa_fields: readPdf('with_xfa_fields.pdf'),
    fancy_fields: readPdf('fancy_fields.pdf'),
    form_to_flatten: readPdf('form_to_flatten.pdf'),
    with_annots: readPdf('with_annots.pdf'),
  },
};

export type Assets = typeof assets;
// export type Assets = any;

// This script can be executed with 0, 1, or 2 CLI arguments:
//   $ deno index.ts
//   $ deno index.ts 3
//   $ deno index.ts 'Adobe Acrobat'
//   $ deno index.ts 3 'Adobe Acrobat'
const loadCliArgs = (): { testIdx?: number; reader?: string } => {
  const { args } = Deno;

  if (args.length === 0) return {};

  if (args.length === 1) {
    if (isFinite(Number(args[0]))) return { testIdx: Number(args[0]) };
    else return { reader: args[0] };
  }

  return { testIdx: Number(args[0]), reader: args[1] };
};

const main = async () => {
  const { testIdx, reader } = loadCliArgs();

  // prettier-ignore
  const allTests = [
      test1, test2, test3, test4, test5, test6, test7, test8, test9, test10,
      test11, test12, test13, test14, test15, test16, test17, test18
    ];

  const tests = testIdx ? [allTests[testIdx - 1]] : allTests;

  let idx = testIdx || 1;
  for (const test of tests) {
    console.log(`Running test #${idx}`);
    const pdfBytes = await test(assets);
    const path = writePdfToTmp(pdfBytes);
    console.log(`> PDF file written to: ${path}`);
    openPdf(path, reader);
    idx += 1;
    await promptToContinue();
    console.log();
  }

  console.log('Done!');
};

main();
