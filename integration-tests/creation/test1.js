/* eslint-disable no-unused-vars */
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
import fonts from '../fonts';
import { pngImages, jpgImages } from '../images';

const pdfDoc = PDFDocumentFactory.create();

const FontTimesRoman = pdfDoc.register(
  PDFDictionary.from(
    {
      Type: PDFName.from('Font'),
      Subtype: PDFName.from('Type1'),
      BaseFont: PDFName.from('Times-Roman'),
    },
    pdfDoc.index,
  ),
);
const FontOne = pdfDoc.embedFont('FontOne', fonts.ubuntu, {
  Nonsymbolic: true,
});
const FontTwo = pdfDoc.embedFont('FontTwo', fonts.cursivey, {
  Nonsymbolic: true,
});
const FontThree = pdfDoc.embedFont('FontThree', fonts.elegant, {
  Nonsymbolic: true,
});

const minionsPNG = pdfDoc.addPNG(pngImages.minions);
const minionsNoAlphaPNG = pdfDoc.addPNG(pngImages.minionsNoAlpha);
const greyscaleBirdPNG = pdfDoc.addPNG(pngImages.greyscaleBird);
const smallMarioPNG = pdfDoc.addPNG(pngImages.smallMario);

const catUnicornJPG = pdfDoc.addJPG(jpgImages.catUnicorn);
const minionsJPG = pdfDoc.addJPG(jpgImages.minions);

const specGraphic = pdfDoc.register(
  createSpecGraphic(pdfDoc.index, 50, 50, 0.75),
);
const textGraphic = pdfDoc.register(
  createTextGraphic(pdfDoc.index, '/FontOne', '/FontTwo', '/FontThree'),
);
const imageGraphic = pdfDoc.register(
  createImageGraphic(
    pdfDoc.index,
    '/SmallMarioPNG',
    '/CatUnicornJPG',
    '/MinionsPNG',
    '/GreyscaleBirdPNG',
  ),
);

const page1 = pdfDoc
  .createPage([500, 500])
  .addFontDictionary('FontTimesRoman', FontTimesRoman)
  .addFontDictionary('FontOne', FontOne)
  .addFontDictionary('FontTwo', FontTwo)
  .addFontDictionary('FontThree', FontThree)
  .addContentStreams(specGraphic, textGraphic);
const page2 = pdfDoc
  .createPage([500, 500])
  .addXObject('SmallMarioPNG', smallMarioPNG)
  .addXObject('MinionsPNG', minionsPNG)
  .addXObject('GreyscaleBirdPNG', greyscaleBirdPNG)
  .addXObject('CatUnicornJPG', catUnicornJPG)
  .addContentStreams(imageGraphic);

pdfDoc.addPage(page1);
pdfDoc.addPage(page2);
pdfDoc.removePage(0);
pdfDoc.insertPage(1, page1);

console.time('saveToBytes');
const savedBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
console.timeEnd('saveToBytes');

const outFile = '/Users/user/Desktop/modified.pdf';
fs.writeFileSync(outFile, savedBytes);
