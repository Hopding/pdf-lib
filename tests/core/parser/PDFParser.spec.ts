import fs from 'fs';

import { PDFContext, PDFHeader, PDFParser } from 'src/index';

describe(`PDFParser`, () => {
  it(`can parse PDF files without object streams or update sections`, () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');

    const context = PDFContext.create();
    const parser = PDFParser.forBytes(pdfBytes, context);

    expect(context.enumerateIndirectObjects().length).toBe(0);

    const header = parser.parseDocumentIntoContext();
    expect(header).toBeInstanceOf(PDFHeader);
    expect(header.toString()).toEqual('%PDF-1.3\n%');
    expect(context.enumerateIndirectObjects().length).toBe(108);
  });

  it(`can parse PDF files with update sections`, () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');

    const context = PDFContext.create();
    const parser = PDFParser.forBytes(pdfBytes, context);

    expect(context.enumerateIndirectObjects().length).toBe(0);

    const header = parser.parseDocumentIntoContext();

    expect(header).toBeInstanceOf(PDFHeader);
    expect(header.toString()).toEqual('%PDF-1.7\n%');
    expect(context.enumerateIndirectObjects().length).toBe(135);
  });

  it(`prevents double parsing`, () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');

    const context = PDFContext.create();
    const parser = PDFParser.forBytes(pdfBytes, context);

    expect(() => parser.parseDocumentIntoContext()).not.toThrow();
    expect(() => parser.parseDocumentIntoContext()).toThrow(
      'PDF already parsed! FIX ME!',
    );
  });
});
