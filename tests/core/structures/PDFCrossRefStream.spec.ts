import {
  mergeIntoTypedArray,
  PDFContext,
  PDFCrossRefStream,
  PDFRef,
  toCharCode,
} from 'src/index';

describe(`PDFCrossRefStream`, () => {
  const context = PDFContext.create();
  const dict = context.obj({});

  it(`can be constructed from PDFCrossRefStream.of(...)`, () => {
    expect(PDFCrossRefStream.of(dict)).toBeInstanceOf(PDFCrossRefStream);
  });

  it(`can be cloned`, () => {
    const original = PDFCrossRefStream.of(dict);

    original.addDeletedEntry(PDFRef.of(0, 2), 11);
    original.addUncompressedEntry(PDFRef.of(0, 40), 30);
    original.addCompressedEntry(PDFRef.of(5), 691);

    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(String(clone)).toBe(String(original));
  });

  it(`can be converted to a string`, () => {
    const stream = PDFCrossRefStream.of(dict);

    stream.addDeletedEntry(PDFRef.of(0, 2), 11);
    stream.addUncompressedEntry(PDFRef.of(0, 40), 30);
    stream.addCompressedEntry(PDFRef.of(5), 691);

    expect(String(stream)).toEqual(
      '<<\n/Type /XRef\n/Length 12\n>>\n' +
        'stream\n' +
        '010110101111100101000101011010110011' +
        '\nendstream',
    );
  });

  it(`can provide its size in bytes`, () => {
    const stream = PDFCrossRefStream.of(dict);

    stream.addDeletedEntry(PDFRef.of(0, 2), 11);
    stream.addUncompressedEntry(PDFRef.of(0, 40), 30);
    stream.addCompressedEntry(PDFRef.of(5), 691);

    expect(stream.sizeInBytes()).toBe(58);
  });

  it(`can be serialized`, () => {
    const stream = PDFCrossRefStream.of(dict);

    stream.addDeletedEntry(PDFRef.of(0, 2), 11);
    stream.addUncompressedEntry(PDFRef.of(0, 40), 30);
    stream.addCompressedEntry(PDFRef.of(5), 691);

    const buffer = new Uint8Array(stream.sizeInBytes() + 3).fill(
      toCharCode(' '),
    );

    // prettier-ignore
    const expectedEntries = new Uint8Array([
      0, 11, 0, 2,
      1, 30, 0, 40,
      2,  5, 2, 691
    ]);

    expect(stream.copyBytesInto(buffer, 2)).toBe(58);
    expect(buffer).toEqual(
      mergeIntoTypedArray(
        '  <<\n/Type /XRef\n/Length 12\n>>\n',
        'stream\n',
        expectedEntries,
        '\nendstream ',
      ),
    );
  });
});
