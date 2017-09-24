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

const outlinesObj = PDFIndirectObject(2, 0, {
  'Type': PDFNameObject('Outlines'),
  'Count': 0,
});

const pagesObj = PDFIndirectObject(3, 0);

const textObj = PDFTextObject()
  .setFont(PDFNameObject('F1'), 24)
  .moveText(100, 100)
  .showText('Hello World!');

const contentsObj = PDFStreamObject(5, 0)
  .setInDictionary('Length', 73)
  .setStream(textObj);

const procSetObj = PDFIndirectObject(6, 0, [
  PDFNameObject('PDF'),
  PDFNameObject('Text'),
]);

const fontObj = PDFIndirectObject(7, 0, {
  'Type': PDFNameObject('Font'),
  'Subtype': PDFNameObject('Type1'),
  'Name': PDFNameObject('F1'),
  'BaseFont': PDFNameObject('Helvetica'),
  'Encoding': PDFNameObject('MacRomanEncoding'),
});

const pageObj = PDFIndirectObject(4, 0, {
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
  'Outlines': outlinesObj,
  'Pages': pagesObj,
});

const crossRefTable = PDFCrossRefTable([
  [catalogObj.objectNum, [
    [  0, 65535, false],
    [  9, 0, true],
    [ 74, 0, true],
    [120, 0, true],
    [179, 0, true],
    [364, 0, true],
    [466, 0, true],
    [496, 0, true],
  ]],
]);

const trailer = PDFTrailer({
  'Size': 8,
  'Root': catalogObj,
}, 625);

const pdfStr =
`
%PDF-1.7

${catalogObj}

${outlinesObj}

${pagesObj}

${pageObj}

${contentsObj}

${procSetObj}

${fontObj}

${crossRefTable}
${trailer}
`;

console.log(pdfStr);
