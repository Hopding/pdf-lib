/* eslint-disable no-unused-vars */
import fs from 'fs';

import PDFDocumentFactory from 'core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from 'core/pdf-document/PDFDocumentWriter';
import { PDFDictionary, PDFName } from 'core/pdf-objects';
import { PDFContentStream, PDFPage } from 'core/pdf-structures';
import PDFXRefTableFactory from 'core/pdf-structures/factories/PDFXRefTableFactory';
import PDFOperators from 'core/pdf-operators';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';

import { arrayToString, charCodes, writeToDebugFile } from 'utils';

import {
  createSpecGraphic,
  createTextGraphic,
  createImageGraphic,
} from '../content-streams';
import fonts from '../fonts';
import { pngImages, jpgImages } from '../images';

/*
Adding "TESTING" to "/Users/user/Desktop/pdf-lib/test-pdfs/pdf/ef/inst/ef_ins_1040.pdf"
messes up the text within the "Caution" sections...
*/

const files = {
  BOL: n => `/Users/user/Desktop/bols/bol${n || ''}.pdf`,
  MINIMAL: '/Users/user/github/pdf-lib/test-pdfs/minimal.pdf',
  PDF_SPEC: '/Users/user/Documents/PDF32000_2008.pdf',
  CMP_SIMPLE_TABLE_DECOMPRESS:
    '/Users/user/Documents/cmp_simple_table-decompress.pdf',
  CMP_SIMPLE_TABLE: '/Users/user/Documents/cmp_simple_table.pdf',
  AST_SCI_DATA_TABLES: '/Users/user/Documents/ast_sci_data_tables_sample.pdf',
  MOVE_CRM_WEB_SERV: '/Users/user/Documents/moveCRM_Webservices.pdf',
  ANOTHER_LINEARIZED:
    '/Users/user/github/pdf-lib/test-pdfs/pdf/dc/inst/dc_ins_2210.pdf',
  UPDATED: '/Users/user/github/pdf-lib/test-pdfs/pdf/fd/form/F1040V.pdf',
};

const inFile = files.BOL(6);
const outFile = '/Users/user/Desktop/modified.pdf';
const bytes = fs.readFileSync(inFile);

console.time('PDFDocument');
const pdfDoc = PDFDocumentFactory.load(bytes);
const pages = pdfDoc.getPages();

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

const firstPage = pages[0];
firstPage
  .addXObject('SmallMarioPNG', smallMarioPNG)
  .addXObject('MinionsPNG', minionsPNG)
  .addXObject('GreyscaleBirdPNG', greyscaleBirdPNG)
  .addXObject('CatUnicornJPG', catUnicornJPG)
  .addContentStreams(imageGraphic);

pages.forEach(page => {
  page
    .addFontDictionary('FontOne', FontOne)
    .addFontDictionary('FontTwo', FontTwo)
    .addFontDictionary('FontThree', FontThree)
    .addContentStreams(specGraphic, textGraphic);
});

const newPage1 = pdfDoc
  .createPage([500, 500])
  .addFontDictionary('FontOne', FontOne)
  .addFontDictionary('FontTwo', FontTwo)
  .addFontDictionary('FontThree', FontThree)
  .addContentStreams(specGraphic, textGraphic);

const newPage2 = pdfDoc
  .createPage([500, 500])
  .addFontDictionary('FontOne', FontOne)
  .addFontDictionary('FontTwo', FontTwo)
  .addFontDictionary('FontThree', FontThree)
  .addXObject('SmallMarioPNG', smallMarioPNG)
  .addXObject('MinionsPNG', minionsPNG)
  .addXObject('GreyscaleBirdPNG', greyscaleBirdPNG)
  .addXObject('CatUnicornJPG', catUnicornJPG)
  .addContentStreams(imageGraphic);

pdfDoc.insertPage(0, newPage1);
pdfDoc.addPage(newPage1);
pdfDoc.addPage(newPage2);
pdfDoc.removePage(0);

console.time('saveToBytes');
const savedBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
console.timeEnd('saveToBytes');
console.timeEnd('PDFDocument');
fs.writeFileSync(outFile, savedBytes);
