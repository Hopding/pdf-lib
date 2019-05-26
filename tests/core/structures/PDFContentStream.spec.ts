import {
  PDFContentStream,
  PDFContext,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFOperator,
  PDFOperatorNames as Ops,
  PDFString,
  toCharCode,
  typedArrayFor,
} from 'src/index';

describe(`PDFContentStream`, () => {
  const context = PDFContext.create();
  const dict = PDFDict.withContext(context);
  const operators = [
    PDFOperator.of(Ops.BeginText),
    PDFOperator.of(Ops.SetFontAndSize, [PDFName.of('F1'), PDFNumber.of(24)]),
    PDFOperator.of(Ops.MoveText, [PDFNumber.of(100), PDFNumber.of(100)]),
    PDFOperator.of(Ops.ShowText, [PDFString.of('Hello World and stuff!')]),
    PDFOperator.of(Ops.EndText),
  ];

  it(`can be constructed from PDFContentStream.of(...)`, () => {
    expect(PDFContentStream.of(dict, operators)).toBeInstanceOf(
      PDFContentStream,
    );
  });

  it(`can be cloned`, () => {
    const original = PDFContentStream.of(dict, operators);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(String(clone)).toBe(String(original));
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFContentStream.of(dict, operators))).toEqual(
      '<<\n/Length 55\n>>\n' +
        'stream\n' +
        'BT\n' +
        '/F1 24 Tf\n' +
        '100 100 Td\n' +
        '(Hello World and stuff!) Tj\n' +
        'ET\n' +
        '\nendstream',
    );
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFContentStream.of(dict, operators).sizeInBytes()).toBe(89);
  });

  it(`can be serialized`, () => {
    const stream = PDFContentStream.of(dict, operators);
    const buffer = new Uint8Array(stream.sizeInBytes() + 3).fill(
      toCharCode(' '),
    );
    expect(stream.copyBytesInto(buffer, 2)).toBe(89);
    expect(buffer).toEqual(
      typedArrayFor(
        '  <<\n/Length 55\n>>\n' +
          'stream\n' +
          'BT\n' +
          '/F1 24 Tf\n' +
          '100 100 Td\n' +
          '(Hello World and stuff!) Tj\n' +
          'ET\n' +
          '\nendstream ',
      ),
    );
  });
});
