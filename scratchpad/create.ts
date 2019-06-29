import { last, PDFDocument, StandardFonts } from 'src/index';

// import { default as opentype } from 'opentype.js';

// import fs from 'fs';
// import { cmyk, degrees, PDFDocument, rgb, StandardFonts } from 'src/index';

// const main = async () => {
//   console.time('Scratchpad');

//   const ubuntuFontBytes = fs.readFileSync('assets/fonts/ubuntu/Ubuntu-R.ttf');

//   const catRidingUnicornBytes = fs.readFileSync(
//     'assets/images/cat_riding_unicorn.jpg',
//   );
//   const greyscaleBirdBytes = fs.readFileSync(
//     'assets/images/greyscale_bird.png',
//   );
//   const minionsBananaAlphaBytes = fs.readFileSync(
//     'assets/images/minions_banana_alpha.png',
//   );
//   const minionsBananaNoAlphaBytes = fs.readFileSync(
//     'assets/images/minions_banana_no_alpha.png',
//   );

//   const pdfDoc = PDFDocument.create();

//   const page = pdfDoc.insertPage(0);

//   const timesRomanItalicFont = pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
//   const helveticaFont = pdfDoc.embedFont(StandardFonts.Helvetica);
//   const ubuntuFont = pdfDoc.embedFont(ubuntuFontBytes);

//   const catRidingUnicornJpg = pdfDoc.embedJpg(catRidingUnicornBytes);
//   const greyscaleBirdPng = pdfDoc.embedPng(greyscaleBirdBytes);
//   const minionsBananaAlphaPng = pdfDoc.embedPng(minionsBananaAlphaBytes);
//   const minionsBananaNoAlphaPng = pdfDoc.embedPng(minionsBananaNoAlphaBytes);

//   page.moveTo(25, 25);
//   page.drawImage(greyscaleBirdPng, greyscaleBirdPng.scale(0.75));
//   page.moveTo(25, 25);
//   page.drawImage(minionsBananaAlphaPng, minionsBananaAlphaPng.scale(0.25));
//   page.moveTo(25, 325);
//   page.drawImage(minionsBananaNoAlphaPng, minionsBananaNoAlphaPng.scale(0.25));
//   page.drawImage(catRidingUnicornJpg, {
//     ...catRidingUnicornJpg.scale(0.25),
//     x: 25,
//     y: 450,
//     rotate: degrees(5),
//     xSkew: degrees(15),
//     ySkew: degrees(15),
//   });

//   page.setFontSize(24);
//   page.setFont(helveticaFont);
//   page.moveTo(100, 100);
//   page.drawText('Hello World and stuff!');
//   page.setFont(ubuntuFont);
//   page.moveTo(100, 300);
//   page.drawText('Ubuntu - Hello World and stuff!');

//   page.setFontSize(50);
//   page.moveTo(100, 100);
//   page.drawText('Qux Baz!!!\nFoo\tBar\b\v!!!', {
//     color: rgb(1, 0, 0),
//     font: timesRomanItalicFont,
//     size: 100,
//     x: 150,
//     y: 150,
//     rotate: degrees(45),
//     xSkew: degrees(-30),
//     ySkew: degrees(-30),
//     lineHeight: 100,
//   });

//   const page2 = pdfDoc.addPage();
//   page2.moveTo(50, 50);
//   page2.drawRectangle();
//   page2.drawRectangle({
//     x: 50,
//     y: 200,
//     borderColor: cmyk(0, 1, 0, 0),
//     borderWidth: 5,
//   });
//   page2.drawRectangle({
//     x: 100,
//     y: 400,
//     color: cmyk(1, 0, 0, 0),
//     borderColor: cmyk(0, 1, 0, 0),
//     borderWidth: 5,
//     width: 300,
//     height: 200,
//     rotate: degrees(15),
//     xSkew: degrees(15),
//     ySkew: degrees(15),
//   });

//   const page3 = pdfDoc.addPage();
//   page3.moveTo(100, 100);
//   page3.drawEllipse();
//   page3.drawEllipse({
//     x: 250,
//     y: 300,
//     color: cmyk(1, 0, 0, 0),
//     borderColor: cmyk(0, 1, 0, 0),
//     borderWidth: 5,
//     xScale: 200,
//     yScale: 50,
//   });

//   /*******************/

//   const pdfBytes2 = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');

//   const donorPdfDoc = PDFDocument.load(pdfBytes2);
//   const donorPage = donorPdfDoc.getPages()[0];
//   pdfDoc.addPage(donorPage);

//   const buffer = await pdfDoc.save();
//   console.timeEnd('Scratchpad');

//   fs.writeFileSync('./out.pdf', buffer);
//   console.log('File written to ./out.pdf');
// };

// main();

import fs from 'fs';
import PDFFont from './api/PDFFont';

const readFont = (font: string) => fs.readFileSync(`assets/fonts/${font}`);

const readImage = (image: string) => fs.readFileSync(`assets/images/${image}`);

const readPdf = (pdf: string) => fs.readFileSync(`assets/pdfs/${pdf}`);

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
      source_hans_jp: readFont('source_hans_jp/SourceHanSerifJP-Regular.otf'),
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
    normal: readPdf('normal.pdf'),
    with_update_sections: readPdf('with_update_sections.pdf'),
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

// JavaScript's String.charAt() method doesn work on strings containing UTF-16
// characters (with high and low surrogate pairs), such as 💩 (poo emoji). This
// `glyphAtIndex()` function does.
//
// Credit: https://github.com/mathiasbynens/String.prototype.at/blob/master/at.js#L14-L48
const glyphAtIndex = (text: string, index: number) => {
  // Get the first code unit and code unit value
  const cuFirst = text.charCodeAt(index);
  let cuSecond;
  const nextIndex = index + 1;
  let len = 1;
  if (
    // Check if it’s the start of a surrogate pair.
    cuFirst >= 0xd800 &&
    cuFirst <= 0xdbff && // high surrogate
    text.length > nextIndex // there is a next code unit
  ) {
    cuSecond = text.charCodeAt(nextIndex);
    if (cuSecond >= 0xdc00 && cuSecond <= 0xdfff) {
      // low surrogate
      len = 2;
    }
  }
  return text.slice(index, index + len);
};

const breakTextIntoLines = (
  text: string,
  size: number,
  font: PDFFont,
  maxWidth: number,
) => {
  const lines: string[] = [];
  let textIdx = 0;
  while (textIdx < text.length) {
    let line = '';
    while (textIdx < text.length) {
      if (text.charAt(textIdx) === '\n') {
        lines.push(line);
        textIdx += 1;
        line = '';
        continue;
      }
      const glyph = glyphAtIndex(text, textIdx);
      const newLine = line + glyph;
      if (font.widthOfTextAtSize(newLine, size) > maxWidth) break;
      line = newLine;
      textIdx += glyph.length;
    }
    lines.push(line);
  }
  return lines;
};

const breakLinesIntoGroups = (
  lines: string[],
  lineHeight: number,
  maxHeight: number,
) => {
  const linesPerGroup = Math.floor(maxHeight / lineHeight);
  const groups: string[][] = [[]];
  for (let idx = 0, len = lines.length; idx < len; idx++) {
    const line = lines[idx];
    if (last(groups).length === linesPerGroup) {
      groups.push([]);
    }
    last(groups).push(line);
  }
  return groups;
};

(async () => {
  const { fonts } = assets;

  const pdfDoc = PDFDocument.create();

  const helveticaFont = pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const title = 'Embedded UTF-16 Font Demo';
  const description = `
    In addition to the standard 14 fonts provided by PDF readers, the PDF
    specification allows PDF documents to embed their own fonts. The standard
    14 fonts only support a very limited latin and symbolic character set, but
    embedded fonts can support arbitrary character sets and glyphs.
    
    This document is a demonstration of an embedded font. Specifically, the
    Source Han Serif Japanese Regular font. The following pages render all
    characters supported by this font.

    The characters are rendered from greatest to least (ordered by their
    code points). Take special note of the first 1.25 pages of glyphs, as these
    glyphs represent UTF-16 code points (the rest of the glyphs in this document
    are UTF-8).`;

  const descriptionLines = breakTextIntoLines(
    description,
    16,
    helveticaFont,
    600,
  );

  const titlePage = pdfDoc.addPage([650, 700]);
  titlePage.drawText(title, {
    font: helveticaBoldFont,
    size: 35,
    y: 700 - 100,
    x: 650 / 2 - helveticaBoldFont.widthOfTextAtSize(title, 35) / 2,
  });
  titlePage.drawText(descriptionLines.join('\n'), {
    font: helveticaFont,
    size: 16,
    y: 525,
    x: 25,
  });

  const sourceHanFont = pdfDoc.embedFont(fonts.otf.source_hans_jp);

  const sourceHanFontSize = 20;
  const sourceHanString = String.fromCodePoint(
    ...sourceHanFont.getCharacterSet().reverse(),
  );
  const sourceHanLines = breakTextIntoLines(
    sourceHanString,
    sourceHanFontSize,
    sourceHanFont,
    600,
  );
  const sourceHanLineGroups = breakLinesIntoGroups(
    sourceHanLines,
    sourceHanFont.heightAtSize(sourceHanFontSize) + 10,
    675,
  );

  sourceHanLineGroups.forEach((lines) => {
    const page = pdfDoc.addPage([650, 700]);
    page.drawText(lines.join('\n'), {
      font: sourceHanFont,
      size: sourceHanFontSize,
      x: 25,
      y: 700 - 25 - sourceHanFontSize,
      lineHeight: sourceHanFont.heightAtSize(sourceHanFontSize) + 10,
    });
  });

  const buffer = await pdfDoc.save();

  fs.writeFileSync('./out.pdf', buffer);
  console.log('File written to ./out.pdf');
})();
