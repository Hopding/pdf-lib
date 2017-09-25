import {
  PDFArrayObject,
  PDFDictionaryObject,
  PDFNameObject,
  PDFIndirectObject,
  PDFStreamObject,
  PDFTextObject,
  PDFCrossRefTable,
  PDFTrailer,
} from './src/PDFObjects';
import PDFDocument from './src/PDFDocument';

const pagesObj = PDFIndirectObject(2, 0);

const textObj = PDFTextObject()
  .setFont(PDFNameObject('F1'), 24)
  .moveText(100, 100)
  .showText('Hello World!');

const contentsObj = PDFStreamObject(4, 0)
  .setInDictionary('Length', 73)
  .setStream(textObj);

const procSetObj = PDFIndirectObject(5, 0, [
  PDFNameObject('PDF'),
  PDFNameObject('Text'),
]);

const fontObj = PDFIndirectObject(6, 0, {
  'Type': PDFNameObject('Font'),
  'Subtype': PDFNameObject('Type1'),
  'Name': PDFNameObject('F1'),
  'BaseFont': PDFNameObject('Helvetica'),
  'Encoding': PDFNameObject('MacRomanEncoding'),
});

const pageObj = PDFIndirectObject(3, 0, {
  'Type': PDFNameObject('Page'),
  'Parent': pagesObj,
  'MediaBox': PDFArrayObject([0, 0, 612, 792]),
  'Contents': contentsObj,
  'Resources': PDFDictionaryObject({
    'ProcSet': procSetObj,
    'Font': PDFDictionaryObject({ 'F1': fontObj }),
  }),
});

pagesObj.setContent({
  'Type': PDFNameObject('Pages'),
  'Kids': PDFArrayObject([pageObj.toIndirectRef()]),
  'Count': 1,
});

const catalogObj = PDFIndirectObject(1, 0, {
  'Type': PDFNameObject('Catalog'),
  'Pages': pagesObj,
});

const trailer = PDFTrailer({
  'Size': 8,
  'Root': catalogObj,
}, 625);

const pdfStr =
`%PDF-1.7

${catalogObj}

{outlinesObj}

${pagesObj}

${pageObj}

${contentsObj}

${procSetObj}

${fontObj}

{crossRefTable}
${trailer}`;

// console.log(pdfStr);
const pdf = PDFDocument()

const myPageObj = PDFIndirectObject(3, 0, {
  'Type': PDFNameObject('Page'),
  'Parent': pdf.pageTree,
  'MediaBox': PDFArrayObject([0, 0, 612, 792]),
  'Contents': contentsObj,
  'Resources': PDFDictionaryObject({
    'ProcSet': procSetObj,
    'Font': PDFDictionaryObject({ 'F1': fontObj }),
  }),
});

pdf
  .addPage(myPageObj)
  .addIndirectObject(contentsObj)
  .addIndirectObject(procSetObj)
  .addIndirectObject(fontObj);

console.log(pdf.toString());
