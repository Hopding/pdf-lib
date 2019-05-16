import fs from 'fs';

import { PDFContext, PDFHeader, PDFParser } from 'src/index';

describe(`PDFParser`, () => {
  it(`can parse PDF files`, () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');

    const context = PDFContext.create();
    const parser = PDFParser.forBytes(pdfBytes, context);

    const header = parser.parseHeader();
    expect(header).toBeInstanceOf(PDFHeader);
    expect(header.toString()).toEqual('%PDF-1.3\n%');

    expect(context.enumerateIndirectObjects()).toHaveLength(0);
    parser.parseDocumentSection();
    expect(context.enumerateIndirectObjects()).toHaveLength(108);
  });
});
