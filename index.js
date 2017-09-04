import {
  PDFArrayObject,
  PDFDictionaryObject,
  PDFNameObject,
  PDFIndirectObject,
  PDFStreamObject,
} from './src/PDFObjects';

const outlinesObj = PDFIndirectObject(2, 0, {
  'Type': new PDFNameObject('Outlines'),
  'Count': 0,
});

const pagesObj = PDFIndirectObject(3, 0);

const contentsObj = new PDFStreamObject(5, 0, {
  'Length': 73,
},
`
  BT
    /F1 24 Tf
    100 100 Td
    (Hello World) Tj
  ET
`);

const procSetObj = PDFIndirectObject(6, 0, [
  new PDFNameObject('PDF'),
  new PDFNameObject('Text'),
]);

const fontObj = PDFIndirectObject(7, 0, {
  'Type': new PDFNameObject('Font'),
  'Subtype': new PDFNameObject('Type1'),
  'Name': new PDFNameObject('F1'),
  'BaseFont': new PDFNameObject('Helvetica'),
  'Encoding': new PDFNameObject('MacRomanEncoding'),
});

const pageObj = PDFIndirectObject(4, 0, {
  'Type': new PDFNameObject('Page'),
  'Parent': pagesObj,
  'MediaBox': new PDFArrayObject([0, 0, 612, 792]),
  'Contents': contentsObj,
  'Resources': new PDFDictionaryObject({
    'ProcSet': procSetObj,
    'Font': new PDFDictionaryObject({ 'F1': fontObj }),
  }),
});

pagesObj.setContent({
  'Type': new PDFNameObject('Pages'),
  'Kids': new PDFArrayObject([pageObj.toIndirectRef()]),
  'Count': 1,
});

const catalogObj = PDFIndirectObject(1, 0, {
  'Type': new PDFNameObject('Catalog'),
  'Outlines': outlinesObj,
  'Pages': pagesObj,
});

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

xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000074 00000 n
0000000120 00000 n
0000000179 00000 n
0000000364 00000 n
0000000466 00000 n
0000000496 00000 n

trailer
${new PDFDictionaryObject({
  'Size': 8,
  'Root': catalogObj,
})}

startxref
625
%%EOF
`;

console.log(pdfStr);
