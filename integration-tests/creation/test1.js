import fs from 'fs';
import _ from 'lodash';

import PDFDocumentFactory from 'core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from 'core/pdf-document/PDFDocumentWriter';
import PDFPage from 'core/pdf-structures/PDFPage';
import PDFOperators from 'core/pdf-operators/index';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { PDFName, PDFDictionary } from 'core/pdf-objects';

import {
  createSpecGraphic,
  createTextGraphic,
  createImageGraphic,
} from '../content-streams';

const fontsDir = '/Users/user/Desktop/fonts';
const fontsBytes = _.mapValues(
  {
    ubuntu: `${fontsDir}/ubuntu/Ubuntu-R.ttf`,
    cursivey: `${fontsDir}/cursivey-font.otf`,
    elegant: `${fontsDir}/elegant-font.otf`,
    candles_: `${fontsDir}/candles/Candles_.TTF`,
    candles_chrome: `${fontsDir}/candles/Candles Chrome.ttf`,
    fantasque: `${fontsDir}/fantasque/FantasqueSansMono-Regular.ttf`,
  },
  filePath => fs.readFileSync(filePath),
);

const imagesDir = '/Users/user/Pictures';
const pngImages = _.mapValues(
  {
    minions: `${imagesDir}/minions.png`,
    minionsNoAlpha: `${imagesDir}/minions-no-alpha.png`,
    greyscaleBird: `${imagesDir}/greyscale-bird.png`,
    smallMario: `${imagesDir}/small-mario.png`,
  },
  filePath => fs.readFileSync(filePath),
);
const jpgImages = _.mapValues(
  {
    catUnicorn: `${imagesDir}/cat-riding-unicorn.jpg`,
    minions: `${imagesDir}/mini.jpg`,
  },
  filePath => fs.readFileSync(filePath),
);

const pdfDoc = PDFDocumentFactory.create();

const FontTimesRoman = pdfDoc.register(
  PDFDictionary.from({
    Type: PDFName.from('Font'),
    Subtype: PDFName.from('Type1'),
    BaseFont: PDFName.from('Times-Roman'),
  }),
);
const FontOne = pdfDoc.embedFont('FontOne', fontsBytes.ubuntu, {
  Nonsymbolic: true,
});
const FontTwo = pdfDoc.embedFont('FontTwo', fontsBytes.cursivey, {
  Nonsymbolic: true,
});
const FontThree = pdfDoc.embedFont('FontThree', fontsBytes.elegant, {
  Nonsymbolic: true,
});

const minionsPNG = pdfDoc.addPNG(pngImages.minions);
const minionsNoAlphaPNG = pdfDoc.addPNG(pngImages.minionsNoAlpha);
const greyscaleBirdPNG = pdfDoc.addPNG(pngImages.greyscaleBird);
const smallMarioPNG = pdfDoc.addPNG(pngImages.smallMario);

const catUnicornJPG = pdfDoc.addJPG(jpgImages.catUnicorn);
const minionsJPG = pdfDoc.addJPG(jpgImages.minions);

const specGraphic = pdfDoc.register(createSpecGraphic(50, 50, 0.75));
const textGraphic = pdfDoc.register(
  createTextGraphic('/FontOne', '/FontTwo', '/FontThree'),
);
const imageGraphic = pdfDoc.register(
  createImageGraphic(
    '/SmallMarioPNG',
    '/CatUnicornJPG',
    '/MinionsPNG',
    '/GreyscaleBirdPNG',
  ),
);

const page1 = PDFPage.create([500, 500])
  .addFontDictionary(pdfDoc.lookup, 'FontTimesRoman', FontTimesRoman)
  .addFontDictionary(pdfDoc.lookup, 'FontOne', FontOne)
  .addFontDictionary(pdfDoc.lookup, 'FontTwo', FontTwo)
  .addFontDictionary(pdfDoc.lookup, 'FontThree', FontThree)
  .addContentStreams(pdfDoc.lookup, specGraphic, textGraphic);
const page2 = PDFPage.create([500, 500])
  .addXObject(pdfDoc.lookup, 'SmallMarioPNG', smallMarioPNG)
  .addXObject(pdfDoc.lookup, 'MinionsPNG', minionsPNG)
  .addXObject(pdfDoc.lookup, 'GreyscaleBirdPNG', greyscaleBirdPNG)
  .addXObject(pdfDoc.lookup, 'CatUnicornJPG', catUnicornJPG)
  .addContentStreams(pdfDoc.lookup, imageGraphic);

pdfDoc.addPage(page1);
pdfDoc.addPage(page2);
pdfDoc.removePage(0);
pdfDoc.insertPage(1, page1);

console.time('saveToBytes');
const savedBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
console.timeEnd('saveToBytes');

const outFile = '/Users/user/Desktop/modified.pdf';
fs.writeFileSync(outFile, savedBytes);
