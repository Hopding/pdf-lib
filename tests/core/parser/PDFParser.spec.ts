import fs from 'fs';

import {
  CharCodes,
  mergeIntoTypedArray,
  PDFDict,
  PDFHeader,
  PDFInvalidObject,
  PDFPageLeaf,
  PDFParser,
  PDFRef,
  PDFString,
  ReparseError,
  typedArrayFor,
} from '../../../src/index';

describe(`PDFParser`, () => {
  const origConsoleWarn = console.warn;

  beforeAll(() => {
    const ignoredWarnings = [
      'Trying to parse invalid object:',
      'Invalid object ref:',
      'Removing parsed object: 0 0 R',
    ];
    console.warn = jest.fn((...args) => {
      const isIgnored = ignoredWarnings.find((iw) => args[0].includes(iw));
      if (!isIgnored) origConsoleWarn(...args);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.warn = origConsoleWarn;
  });

  it(`throws an error when the PDF is missing a header`, async () => {
    const input = `
      I_AM_NOT_A_HEADER
      1 0 obj
        (foobar)
      endobj
    `;
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    await expect(parser.parseDocument()).rejects.toThrow();
  });

  it(`does not throw an error when the 'endobj' keyword is missing`, async () => {
    const input = `
      %PDF-1.7
      1 0 obj
        (foobar)
      foo
    `;
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    const context = await parser.parseDocument();
    expect(context.lookup(PDFRef.of(1))).toBeInstanceOf(PDFString);
  });

  it(`handles invalid binary comments after header`, async () => {
    const input = mergeIntoTypedArray(
      '%PDF-1.7\n',
      new Uint8Array([128, 1, 2, 3, 4, 5, 129, 130, 131, CharCodes.Newline]),
      '1 0 obj\n',
      ' . (foobar)\n',
      'endobj',
    );
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    const context = await parser.parseDocument();
    expect(context.enumerateIndirectObjects().length).toBe(1);
  });

  it(`handles invalid binary comments with missing newline after header`, async () => {
    const input = mergeIntoTypedArray(
      '%PDF-1.7\n',
      new Uint8Array([142, 1, 2, 3, 4, 5, 129, 130, 131]),
      '1 0 obj\n',
      ' . (foobar)\n',
      'endobj',
    );
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    const context = await parser.parseDocument();
    expect(context.enumerateIndirectObjects().length).toBe(1);
  });

  it(`does not stall when stuff follows the last %%EOL`, async () => {
    const input = `
      %PDF-1.7
      1 0 obj
        (foobar)
      endobj
      startxref
      127
      %%EOL
      @@@@@@@@@@@@@@@@@@
    `;
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    const context = await parser.parseDocument();
    expect(context.enumerateIndirectObjects().length).toBe(1);
  });

  it(`handles invalid indirect objects`, async () => {
    const input = `
    %PDF-1.7
    22 0 obj <</Type/Outlines/First ## 0 R/Last ** 0 R/Count 2>> endobj
  `;
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    const context = await parser.parseDocument();

    expect(context.enumerateIndirectObjects().length).toBe(1);
    const object = context.lookup(PDFRef.of(22));
    expect(object).toBeInstanceOf(PDFInvalidObject);
  });

  it(`throws an error with invalid indirect objects when throwOnInvalidObject=true`, async () => {
    const input = `
    %PDF-1.7
    22 0 obj <</Type/Outlines/First ## 0 R/Last ** 0 R/Count 2>> endobj
  `;
    const parser = PDFParser.forBytesWithOptions(
      typedArrayFor(input),
      100,
      true,
    );
    await expect(parser.parseDocument()).rejects.toBeInstanceOf(Error);
  });

  it(`handles xref sections with empty subsections`, async () => {
    const input = `
    %PDF-1.7
    22 0 obj
      (foo)
    endobj
    xref
    0 0
    trailer
    << >>
    startxref
    21
    %%EOF
  `;
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    const context = await parser.parseDocument();

    expect(context.enumerateIndirectObjects().length).toBe(1);
    const object = context.lookup(PDFRef.of(22));
    expect(object).toBeInstanceOf(PDFString);
  });

  it(`can parse PDF files with comments and stuff preceding the header`, async () => {
    const pdfBytes = fs.readFileSync(
      './assets/pdfs/pdf20examples/PDF 2.0 with offset start.pdf',
    );

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-2.0\n%');
    expect(context.enumerateIndirectObjects().length).toBe(8);
  });

  it(`can parse PDF files with comments stuff following the header`, async () => {
    const pdfBytes = fs.readFileSync(
      './assets/pdfs/stuff_following_header.pdf',
    );

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.4\n%');
    expect(context.enumerateIndirectObjects().length).toBe(12);
  });

  it(`can parse PDF files with missing xref table, trailer dict, and trailer`, async () => {
    const pdfBytes = fs.readFileSync(
      './assets/pdfs/missing_xref_trailer_dict.pdf',
    );

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-2.0\n%');
    expect(context.enumerateIndirectObjects().length).toBe(8);
  });

  it(`can parse PDF files without object streams or update sections`, async () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/normal.pdf');

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.3\n%');
    expect(context.enumerateIndirectObjects().length).toBe(108);
  });

  it(`can parse PDF files with update sections`, async () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/with_update_sections.pdf');

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.7\n%');
    expect(context.enumerateIndirectObjects().length).toBe(131);
  });

  it(`can parse PDF files with comments`, async () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/with_comments.pdf');

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.7\n%');
    expect(context.enumerateIndirectObjects().length).toBe(143);
  });

  it(`prevents double parsing`, async () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/normal.pdf');

    const parser = PDFParser.forBytesWithOptions(pdfBytes);

    await expect(parser.parseDocument()).resolves.not.toThrow();
    await expect(parser.parseDocument()).rejects.toThrow(
      new ReparseError('PDFParser', 'parseDocument'),
    );
  });

  it(`can parse PDF files with binary jibberish between indirect objects`, async () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/giraffe.pdf');

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.6\n%');
    expect(context.enumerateIndirectObjects().length).toBe(17);
  });

  it(`can fix incorrect values for /Root`, async () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/invalid_root_ref.pdf');

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.5\n%');
    expect(context.trailerInfo.Root).toBe(PDFRef.of(2, 0));
    expect(context.enumerateIndirectObjects().length).toBe(28);
  });

  it(`can parse files containing indirect objects missing their 'endobj' keyword`, async () => {
    const pdfBytes = fs.readFileSync(
      './assets/pdfs/missing_endobj_keyword.pdf',
    );

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.3\n%');
    expect(context.enumerateIndirectObjects().length).toBe(7);
  });

  it(`can parse files with containing large arrays with most 'null' values`, async () => {
    const pdfBytes = fs.readFileSync('./assets/pdfs/bixby_guide.pdf');

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.4\n%');

    const objects = context.enumerateIndirectObjects();
    expect(objects.length).toBe(26079);
    expect(
      objects.filter(([_ref, obj]) => obj instanceof PDFPageLeaf).length,
    ).toBe(176);
  });

  it(`can parse files with invalid stream EOLs: "stream \r\n`, async () => {
    const pdfBytes = fs.readFileSync(
      './assets/pdfs/with_invalid_stream_EOL.pdf',
    );

    const parser = PDFParser.forBytesWithOptions(pdfBytes);
    const context = await parser.parseDocument();

    expect(context.header).toBeInstanceOf(PDFHeader);
    expect(context.header.toString()).toEqual('%PDF-1.3\n%');

    const objects = context.enumerateIndirectObjects();
    expect(objects.length).toBe(11);
    expect(
      objects.filter(([_ref, obj]) => obj instanceof PDFPageLeaf).length,
    ).toBe(2);
  });

  it(`handles updated PDFs missing newline after %%EOF marker`, async () => {
    const input = `
    %PDF-1.7
    22 0 obj
      (foo)
    endobj
    xref
    0 0
    trailer
    << >>
    startxref
    21
    %%EOF28 0 obj
    << /Foo /Bar >>
    endobj
    xref
    0 0
    trailer
    << >>
    startxref
    21
    %%EOF
  `;
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    const context = await parser.parseDocument();

    expect(context.enumerateIndirectObjects().length).toBe(2);
    const object22 = context.lookup(PDFRef.of(22));
    expect(object22).toBeInstanceOf(PDFString);
    const object28 = context.lookup(PDFRef.of(28));
    expect(object28).toBeInstanceOf(PDFDict);
  });

  it(`handles updated PDFs with comments preceding %%EOF marker`, async () => {
    const input = `
    %PDF-1.7
    22 0 obj
      (foo)
    endobj
    xref
    0 0
    trailer
    << >>
    startxref
    21
    %%EOF28 0 obj
    << /Foo /Bar >>
    endobj
    xref
    0 0
    trailer
    << >>
    startxref
    21 % Foo
    % Bar
    %%EOF
  `;
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    const context = await parser.parseDocument();

    expect(context.enumerateIndirectObjects().length).toBe(2);
    const object22 = context.lookup(PDFRef.of(22));
    expect(object22).toBeInstanceOf(PDFString);
    const object28 = context.lookup(PDFRef.of(28));
    expect(object28).toBeInstanceOf(PDFDict);
  });

  it(`removes indirect objects with objectNumber=0`, async () => {
    const input = `
    %PDF-1.7
    1 0 obj
      (foo)
    endobj
    0 0 obj
      (bar)
    endobj
    2 0 obj
      (baz)
    endobj
    %%EOF
  `;
    const parser = PDFParser.forBytesWithOptions(typedArrayFor(input));
    const context = await parser.parseDocument();

    expect(context.enumerateIndirectObjects().length).toBe(2);
    const object1 = context.lookup(PDFRef.of(1));
    expect(object1).toBeInstanceOf(PDFString);
    const object0 = context.lookup(PDFRef.of(0));
    expect(object0).toBe(undefined);
    const object2 = context.lookup(PDFRef.of(2));
    expect(object2).toBeInstanceOf(PDFString);
  });
});
