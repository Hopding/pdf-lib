import { PDFCrossRefSection, PDFRef } from '../../../src/core';
import { toCharCode, typedArrayFor } from '../../../src/utils';

describe(`PDFCrossRefSection`, () => {
  it(`can be constructed from PDFCrossRefSection.create()`, () => {
    expect(PDFCrossRefSection.create()).toBeInstanceOf(PDFCrossRefSection);
  });

  const xref1 = PDFCrossRefSection.create();
  xref1.addEntry(PDFRef.of(1), 21);
  xref1.addDeletedEntry(PDFRef.of(2, 1), 24);
  xref1.addEntry(PDFRef.of(3), 192188923);
  xref1.addEntry(PDFRef.of(4), 129219);

  const xref2 = PDFCrossRefSection.create();
  xref2.addEntry(PDFRef.of(3), 21);
  xref2.addDeletedEntry(PDFRef.of(4, 1), 24);
  xref2.addEntry(PDFRef.of(6), 192188923);
  xref2.addEntry(PDFRef.of(7), 129219);

  it(`can be converted to a string with a single subsection`, () => {
    expect(String(xref1)).toEqual(
      'xref\n' +
        '0 5\n' +
        '0000000000 65535 f \n' +
        '0000000021 00000 n \n' +
        '0000000024 00001 f \n' +
        '0192188923 00000 n \n' +
        '0000129219 00000 n \n',
    );
  });

  it(`can be converted to a string with multiple subsections and without object number 1`, () => {
    expect(String(xref2)).toEqual(
      'xref\n' +
        '0 1\n' +
        '0000000000 65535 f \n' +
        '3 2\n' +
        '0000000021 00000 n \n' +
        '0000000024 00001 f \n' +
        '6 2\n' +
        '0192188923 00000 n \n' +
        '0000129219 00000 n \n',
    );
  });

  it(`can provide its size in bytes with a single subsection`, () => {
    expect(xref1.sizeInBytes()).toBe(109);
  });

  it(`can provide its size in bytes with multiple subsections and without object number 1`, () => {
    expect(xref2.sizeInBytes()).toBe(117);
  });

  it(`can be serialized with a single subsection`, () => {
    const buffer = new Uint8Array(113).fill(toCharCode(' '));
    expect(xref1.copyBytesInto(buffer, 3)).toBe(109);
    expect(buffer).toEqual(
      typedArrayFor(
        '   xref\n' +
          '0 5\n' +
          '0000000000 65535 f \n' +
          '0000000021 00000 n \n' +
          '0000000024 00001 f \n' +
          '0192188923 00000 n \n' +
          '0000129219 00000 n \n ',
      ),
    );
  });

  it(`can be serialized with multiple subsections and without object number 1`, () => {
    const buffer = new Uint8Array(121).fill(toCharCode(' '));
    expect(xref2.copyBytesInto(buffer, 3)).toBe(117);
    expect(buffer).toEqual(
      typedArrayFor(
        '   xref\n' +
          '0 1\n' +
          '0000000000 65535 f \n' +
          '3 2\n' +
          '0000000021 00000 n \n' +
          '0000000024 00001 f \n' +
          '6 2\n' +
          '0192188923 00000 n \n' +
          '0000129219 00000 n \n ',
      ),
    );
  });
});
