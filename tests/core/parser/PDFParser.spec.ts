import fs from 'fs';

import {
  PDFHeader,
  PDFInvalidObject,
  PDFParser,
  PDFRef,
  ReparseError,
  typedArrayFor,
} from 'src/index';

describe(`PDFParser`, () => {
  it(`throws an error when the PDF is missing a header`, () => {
    const input = `
      I_AM_NOT_A_HEADER
      1 0 obj
        (foobar)
      endobj
    `;
    const parser = PDFParser.forBytes(typedArrayFor(input));
    expect(() => parser.parseDocument()).toThrow();
  });

  it(`throws an error when the 'obj' keyword is missing`, () => {
    const input = `
      %PDF-1.7
      1 0 foo
        (foobar)
      endobj
    `;
    const parser = PDFParser.forBytes(typedArrayFor(input));
    expect(() => parser.parseDocument()).toThrow();
  });

  it(`throws an error when the 'endobj' keyword is missing`, () => {
    const input = `
      %PDF-1.7
      1 0 obj
        (foobar)
      foo
    `;
    const parser = PDFParser.forBytes(typedArrayFor(input));
    expect(() => parser.parseDocument()).toThrow();
  });

  it(`handles invalid indirect objects`, () => {
    const input = `
    %PDF-1.7
    22 0 obj <</Type/Outlines/First ## 0 R/Last ** 0 R/Count 2>> endobj
  `;
    const parser = PDFParser.forBytes(typedArrayFor(input));
    const context = parser.parseDocument();

    expect(context.enumerateIndirectObjects().length).toBe(1);
    const object = context.lookup(PDFRef.of(22));
    expect(object).toBeInstanceOf(PDFInvalidObject);
  });

  it(`can parse PDF files with comments and stuff preceding the header`, () => {
    const pdfBytes = fs.readFileSync(
      './assets/pdfs/pdf20examples/PDF 2.0 with offset start.pdf',
    );

    const parser = PDFParser.forBytes(pdfBytes);
    const context = parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-2.0\n%');
    expect(context.enumerateIndirectObjects().length).toBe(8);
  });

  it(`can parse PDF files with missing xref table, trailer dict, and trailer`, () => {
    const pdfBytes = fs.readFileSync(
      './assets/pdfs/missing_xref_trailer_dict.pdf',
    );

    const parser = PDFParser.forBytes(pdfBytes);
    const context = parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-2.0\n%');
    expect(context.enumerateIndirectObjects().length).toBe(8);
  });

  it(`can parse PDF files without object streams or update sections`, () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');

    const parser = PDFParser.forBytes(pdfBytes);
    const context = parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.3\n%');
    expect(context.enumerateIndirectObjects().length).toBe(108);
  });

  it(`can parse PDF files with update sections`, () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/F1040V_tax_form.pdf');

    const parser = PDFParser.forBytes(pdfBytes);
    const context = parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.7\n%');
    expect(context.enumerateIndirectObjects().length).toBe(135);
  });

  it(`can parse PDF files with comments`, () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/with_comments.pdf');

    const parser = PDFParser.forBytes(pdfBytes);
    const context = parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.7\n%');
    expect(context.enumerateIndirectObjects().length).toBe(30);
  });

  it(`prevents double parsing`, () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/D-2210_tax_form.pdf');

    const parser = PDFParser.forBytes(pdfBytes);

    expect(() => parser.parseDocument()).not.toThrow();
    expect(() => parser.parseDocument()).toThrow(new ReparseError());
  });
});
