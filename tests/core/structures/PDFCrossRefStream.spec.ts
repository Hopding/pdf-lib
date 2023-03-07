import pako from 'pako';

import {
  mergeIntoTypedArray,
  PDFContext,
  PDFCrossRefStream,
  PDFRef,
  toCharCode,
} from '../../../src/index';

describe(`PDFCrossRefStream`, () => {
  const context = PDFContext.create();
  const dict = context.obj({});

  it(`can be constructed from PDFCrossRefStream.create(...)`, () => {
    expect(PDFCrossRefStream.create(dict, false)).toBeInstanceOf(
      PDFCrossRefStream,
    );
  });

  const stream1 = PDFCrossRefStream.create(dict, false);
  stream1.addDeletedEntry(PDFRef.of(1, 2), 11);
  stream1.addUncompressedEntry(PDFRef.of(2, 40), 30);
  stream1.addCompressedEntry(PDFRef.of(21), PDFRef.of(5), 691);

  const stream2 = PDFCrossRefStream.create(dict, false);
  stream2.addUncompressedEntry(PDFRef.of(2), 300);
  stream2.addCompressedEntry(PDFRef.of(3), PDFRef.of(10), 0);
  stream2.addUncompressedEntry(PDFRef.of(9000), 600);
  stream2.addCompressedEntry(PDFRef.of(9001), PDFRef.of(10), 1);

  it(`can be cloned`, () => {
    const original = stream1;
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(String(clone)).toBe(String(original));
  });

  it(`can be converted to a string`, () => {
    expect(String(stream1)).toEqual(
      '<<\n/Type /XRef\n/Length 16\n/W [ 1 1 2 ]\n/Index [ 0 3 21 1 ]\n>>\n' +
        'stream\n' +
        '001111111111111111010110101111100101000101011010110011' +
        '\nendstream',
    );
  });

  it(`can be converted to a string without object number 1`, () => {
    expect(String(stream2)).toEqual(
      '<<\n/Type /XRef\n/Length 25\n/W [ 1 2 2 ]\n/Index [ 0 1 2 2 9000 2 ]\n>>\n' +
        'stream\n' +
        '00011111111111111111110110000100101000110101100000100101001' +
        '\nendstream',
    );
  });

  it(`can provide its size in bytes`, () => {
    expect(stream1.sizeInBytes()).toBe(95);
  });

  it(`can provide its size in bytes without object number 1`, () => {
    expect(stream2.sizeInBytes()).toBe(110);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(stream1.sizeInBytes() + 3).fill(
      toCharCode(' '),
    );

    // prettier-ignore
    const expectedEntries = new Uint8Array([
      0,  0, 255, 255,
      0, 11,   0,   2,
      1, 30,   0,  40,
      2,  5,   2, 179,
    ]);

    expect(stream1.copyBytesInto(buffer, 2)).toBe(95);
    expect(buffer).toEqual(
      mergeIntoTypedArray(
        '  <<\n/Type /XRef\n/Length 16\n/W [ 1 1 2 ]\n/Index [ 0 3 21 1 ]\n>>\n',
        'stream\n',
        expectedEntries,
        '\nendstream ',
      ),
    );
  });

  it(`can be serialized without object number 1`, () => {
    const buffer = new Uint8Array(stream2.sizeInBytes() + 3).fill(
      toCharCode(' '),
    );

    // prettier-ignore
    const expectedEntries = new Uint8Array([
      0,  0,   0,  255,  255,
      1,  1,  44,    0,    0,
      2,  0,  10,    0,    0,
      1,  2,  88,    0,    0,
      2,  0,  10,    0,    1,
    ]);

    expect(stream2.copyBytesInto(buffer, 2)).toBe(110);
    expect(buffer).toEqual(
      mergeIntoTypedArray(
        '  <<\n/Type /XRef\n/Length 25\n/W [ 1 2 2 ]\n/Index [ 0 1 2 2 9000 2 ]\n>>\n',
        'stream\n',
        expectedEntries,
        '\nendstream ',
      ),
    );
  });

  it(`can be serialized when encoded`, () => {
    const stream = PDFCrossRefStream.create(dict, true);
    stream.addUncompressedEntry(PDFRef.of(2), 300);
    stream.addCompressedEntry(PDFRef.of(3), PDFRef.of(10), 0);
    stream.addUncompressedEntry(PDFRef.of(9000), 600);
    stream.addCompressedEntry(PDFRef.of(9001), PDFRef.of(10), 1);

    const buffer = new Uint8Array(stream.sizeInBytes() + 3).fill(
      toCharCode(' '),
    );

    // prettier-ignore
    const expectedEntries = new Uint8Array([
      0,  0,   0,  255,  255,
      1,  1,  44,    0,    0,
      2,  0,  10,    0,    0,
      1,  2,  88,    0,    0,
      2,  0,  10,    0,    1,
    ]);
    const encodedEntries = pako.deflate(expectedEntries);

    expect(stream.copyBytesInto(buffer, 2)).toBe(135);
    expect(buffer).toEqual(
      mergeIntoTypedArray(
        '  <<\n/Type /XRef\n/Length 29\n/W [ 1 2 2 ]\n/Index [ 0 1 2 2 9000 2 ]\n/Filter /FlateDecode\n>>\n',
        'stream\n',
        encodedEntries,
        '\nendstream ',
      ),
    );
  });
});
