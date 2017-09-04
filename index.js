import {
  PDFArrayObject,
  PDFDictionaryObject,
  PDFNameObject,
  PDFIndirectObject,
  PDFStreamObject,
} from './src/PDFObjects';

const outlinesObj = PDFIndirectObject(2, 0, {
  'Type': PDFNameObject('Outlines'),
  'Count': 0,
});

const pagesObj = PDFIndirectObject(3, 0);

const contentsObj = PDFStreamObject(5, 0, {
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
${PDFDictionaryObject({
  'Size': 8,
  'Root': catalogObj,
})}

startxref
625
%%EOF
`;

console.log(pdfStr);
