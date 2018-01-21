/* eslint-disable no-unused-vars */
import fs from 'fs';
import PDFDocumentFactory from 'core/pdf-document/PDFDocumentFactory';
import PDFDocumentWriter from 'core/pdf-document/PDFDocumentWriter';
import { PDFDictionary, PDFName } from 'core/pdf-objects';
import { PDFContentStream, PDFPage } from 'core/pdf-structures';
import PDFXRefTableFactory from 'core/pdf-structures/factories/PDFXRefTableFactory';
import PDFOperators from 'core/pdf-operators';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';

import { arrayToString, charCodes, writeToDebugFile } from './src/utils';

/*
Adding "TESTING" to "/Users/user/Desktop/pdf-lib/test-pdfs/pdf/ef/inst/ef_ins_1040.pdf"
messes up the text within the "Caution" sections...
*/

const files = {
  BOL: n => `/Users/user/Desktop/bols/bol${n || ''}.pdf`,
  MINIMAL: '/Users/user/Desktop/pdf-lib/test-pdfs/minimal.pdf',
  PDF_SPEC: '/Users/user/Documents/PDF32000_2008.pdf',
  CMP_SIMPLE_TABLE_DECOMPRESS:
    '/Users/user/Documents/cmp_simple_table-decompress.pdf',
  CMP_SIMPLE_TABLE: '/Users/user/Documents/cmp_simple_table.pdf',
  AST_SCI_DATA_TABLES: '/Users/user/Documents/ast_sci_data_tables_sample.pdf',
  MOVE_CRM_WEB_SERV: '/Users/user/Documents/moveCRM_Webservices.pdf',
  ANOTHER_LINEARIZED:
    '/Users/user/Desktop/pdf-lib/test-pdfs/pdf/dc/inst/dc_ins_2210.pdf',
  UPDATED: '/Users/user/Desktop/pdf-lib/test-pdfs/pdf/fd/form/F1040V.pdf',
};

const inFile = files.BOL(6);
const outFile = '/Users/user/Desktop/modified.pdf';
const bytes = fs.readFileSync(inFile);

const ubuntuFontFile = '/Users/user/Desktop/fonts/ubuntu/Ubuntu-R.ttf';
// const ubuntuFontFile = '/Users/user/Desktop/fonts/cursivey-font.otf';
// const ubuntuFontFile = '/Users/user/Desktop/fonts/elegant-font.otf';
// const ubuntuFontFile = '/Users/user/Desktop/fonts/candles/Candles_.TTF';
// const ubuntuFontFile = '/Users/user/Desktop/fonts/candles/Candles Chrome.ttf';
// const ubuntuFontFile =
// '/Users/user/Desktop/fonts/fantasque/FantasqueSansMono-Regular.ttf';
const ubuntuFontBytes = fs.readFileSync(ubuntuFontFile);

const pngImages = {
  minions: fs.readFileSync('/Users/user/Pictures/minions.png'),
  minionsNoAlpha: fs.readFileSync('/Users/user/Pictures/minions-no-alpha.png'),
  greyscaleBird: fs.readFileSync('/Users/user/Pictures/greyscale-bird.png'),
  smallMario: fs.readFileSync('/Users/user/Pictures/small-mario.png'),
};

const jpgImages = {
  catUnicorn: fs.readFileSync('/Users/user/Pictures/cat-riding-unicorn.jpg'),
  minions: fs.readFileSync('/Users/user/Pictures/mini.jpg'),
};

console.time('PDFDocument');
const pdfDoc = PDFDocumentFactory.load(bytes);

const pages = pdfDoc.getPages();
console.log(`Pages: ${pages.length}`);
// const page1 = pages[0];
// console.log(`Page 1 Content Streams: ${page1.contentStreams.length}`);

const createDrawing = () => {
  const { m, l, S, w, d, re, g, c, b, B, RG, rg } = PDFOperators;
  const contentStream = PDFContentStream.of(
    // Draw black line segment
    m.of(50, 50),
    l.of(500, 500),
    S.operator,
    // Draw a thicker, dashed line segment
    w.of(4),
    d.of([4, 6], 0),
    m.of(150, 250),
    l.of(400, 250),
    S.operator,
    d.of([], 0),
    w.of(1),
    // Draw a rectangle with a 1-unit red border, filled with light blue.
    RG.of(1.0, 0.0, 0.0),
    rg.of(0.5, 0.75, 1.0),
    re.of(200, 300, 50, 75),
    B.operator,
  );
  // Draw a curve filled with gray and with a colored border.
  contentStream.operators.push(
    RG.of(0.5, 0.1, 0.2),
    g.of(0.7),
    m.of(300, 300),
    c.of(300, 400, 400, 400, 400, 300),
    b.operator,
  );
  return pdfDoc.register(contentStream);
};

const createText = () => {
  const { Tf, Tj, Td, Tr, T, RG, rg, w } = PDFOperators;
  const contentStream = PDFContentStream.of(
    PDFTextObject.of(
      // Draw red colored text at x-y coordinates (50, 500)
      rg.of(1.0, 0.0, 0.0),
      Tf.of('/Ubuntu-M', 50),
      Td.of(50, 500),
      Tj.of('This Is A Test Of The...'),
      Td.of(0, -75),
      Tj.of('Embedded Ubuntu Font!'),
      // Draw dark-cyan colored text at x-y coordinates (50, 425)
      Tf.of('/F9001', 50),
      Td.of(0, -75),
      Tr.of(2),
      w.of(2), // line width
      rg.of(0.0, 0.5, 0.5),
      RG.of(1.0, 0.75, 1.0),
      Tj.of('This Is ALSO A Test...'),
    ),
  );
  return pdfDoc.register(contentStream);
};

const createPNGXObject = () => {
  const { Do, cm, RG, rg, re, B, m, l, S, q, Q } = PDFOperators;
  const contentStream = PDFContentStream.of(
    // Draw a rectangle with a 1-unit red border, filled with light blue.
    q.operator,
    RG.of(1.0, 0.0, 0.0),
    rg.of(0.5, 0.75, 1.0),
    re.of(0, 0, 500, 500),
    B.operator,
    Q.operator,

    q.operator,
    cm.of(250, 0, 0, 250, 0, 0),
    Do.of('/MinionsPNG'),
    Q.operator,

    q.operator,
    cm.of(250, 0, 0, 250, 250, 0),
    Do.of('/GreyscaleBirdPNG'),
    Q.operator,

    q.operator,
    cm.of(250, 0, 0, 250, 0, 250),
    Do.of('/SmallMarioPNG'),
    Q.operator,

    // q.operator,
    // cm.of(250, 0, 0, 250, 250, 250),
    // Do.of('/MinionsNoAlphaPNG'),
    // Q.operator,

    q.operator,
    cm.of(250, 0, 0, 125, 250, 250),
    Do.of('/CatUnicornJPG'),
    Q.operator,
  );
  return pdfDoc.register(contentStream);
};

const drawingStream = createDrawing();
const textStream = createText();
const pngStream = createPNGXObject();

const F9000 = pdfDoc.register(
  PDFDictionary.from({
    Type: PDFName.from('Font'),
    Subtype: PDFName.from('Type1'),
    BaseFont: PDFName.from('Times-Roman'),
  }),
);
const F9001 = pdfDoc.register(
  PDFDictionary.from({
    Type: PDFName.from('Font'),
    Subtype: PDFName.from('Type1'),
    BaseFont: PDFName.from('Helvetica'),
  }),
);

const UbuntuM = pdfDoc.embedFont('Ubuntu-M', ubuntuFontBytes, {
  Nonsymbolic: true,
});

const firstPage = pages[0];
firstPage.addContentStreams(pdfDoc.lookup, pngStream);

pages.forEach(page => {
  page
    .addContentStreams(pdfDoc.lookup, drawingStream, textStream)
    .addFontDictionary(pdfDoc.lookup, 'F9000', F9000)
    .addFontDictionary(pdfDoc.lookup, 'F9001', F9001)
    .addFontDictionary(pdfDoc.lookup, 'Ubuntu-M', UbuntuM);
});

const newPage = PDFPage.create([500, 500])
  .addContentStreams(pdfDoc.lookup, drawingStream, textStream)
  .addFontDictionary(pdfDoc.lookup, 'F9000', F9000)
  .addFontDictionary(pdfDoc.lookup, 'F9001', F9001)
  .addFontDictionary(pdfDoc.lookup, 'Ubuntu-M', UbuntuM);

const newPage2 = PDFPage.create([500, 500])
  .addContentStreams(pdfDoc.lookup, pngStream)
  .addFontDictionary(pdfDoc.lookup, 'F9000', F9000)
  .addFontDictionary(pdfDoc.lookup, 'F9001', F9001)
  .addFontDictionary(pdfDoc.lookup, 'Ubuntu-M', UbuntuM);

pdfDoc.addPage(newPage);
pdfDoc.insertPage(0, newPage2);
// pdfDoc.removePage(0);

const saveFile = () => {
  console.time('saveToBytes');
  const savedBytes = PDFDocumentWriter.saveToBytes(pdfDoc);
  console.timeEnd('saveToBytes');
  console.timeEnd('PDFDocument');
  fs.writeFileSync(outFile, savedBytes);
};

let imageXObject = pdfDoc.addPNG(pngImages.greyscaleBird);
firstPage.addXObject(pdfDoc.lookup, 'GreyscaleBirdPNG', imageXObject);
newPage2.addXObject(pdfDoc.lookup, 'GreyscaleBirdPNG', imageXObject);

imageXObject = pdfDoc.addPNG(pngImages.minions);
firstPage.addXObject(pdfDoc.lookup, 'MinionsPNG', imageXObject);
newPage2.addXObject(pdfDoc.lookup, 'MinionsPNG', imageXObject);

imageXObject = pdfDoc.addPNG(pngImages.minionsNoAlpha);
firstPage.addXObject(pdfDoc.lookup, 'MinionsNoAlphaPNG', imageXObject);
newPage2.addXObject(pdfDoc.lookup, 'MinionsNoAlphaPNG', imageXObject);

imageXObject = pdfDoc.addPNG(pngImages.smallMario);
firstPage.addXObject(pdfDoc.lookup, 'SmallMarioPNG', imageXObject);
newPage2.addXObject(pdfDoc.lookup, 'SmallMarioPNG', imageXObject);

imageXObject = pdfDoc.addJPG(jpgImages.catUnicorn);
firstPage.addXObject(pdfDoc.lookup, 'CatUnicornJPG', imageXObject);
newPage2.addXObject(pdfDoc.lookup, 'CatUnicornJPG', imageXObject);

saveFile();
