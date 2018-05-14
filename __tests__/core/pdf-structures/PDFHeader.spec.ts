// Required to prevent import error in this test
import 'core/pdf-objects';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import { PDFHeader } from 'core/pdf-structures';
import { charCode, mergeUint8Arrays, typedArrayFor } from 'utils';

describe(`PDFHeader`, () => {
  it(`requires 2 numbers to be constructed`, () => {
    expect(() => new PDFHeader()).toThrowError(
      'PDFHeader.major must be a Number',
    );
    expect(() => new PDFHeader(1, '7')).toThrowError(
      'PDFHeader.minor must be a Number',
    );
    expect(new PDFHeader(1, 7)).toBeInstanceOf(PDFHeader);
  });

  it(`has a static "forVersion" factory method`, () => {
    expect(() => new PDFHeader()).toThrowError(
      'PDFHeader.major must be a Number',
    );
    expect(() => new PDFHeader(1, '7')).toThrowError(
      'PDFHeader.minor must be a Number',
    );
    expect(new PDFHeader(1, 7)).toBeInstanceOf(PDFHeader);
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFHeader as a string`, () => {
      const pdfHeader = PDFHeader.forVersion(1, 2);
      expect(pdfHeader.toString()).toBe('%PDF-1.2\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFHeader in bytes`, () => {
      const pdfHeader = PDFHeader.forVersion(1, 2);
      expect(pdfHeader.bytesSize()).toBe(15);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFHeader into the buffer as bytes`, () => {
      const pdfHeader = PDFHeader.forVersion(1, 2);
      const buffer = new Uint8Array(pdfHeader.bytesSize());
      pdfHeader.copyBytesInto(buffer);
      expect(buffer).toEqual(
        mergeUint8Arrays(
          typedArrayFor('%PDF-1.2\n'),
          new Uint8Array([charCode('%'), 130, 130, 130, 130, charCode('\n')]),
        ),
      );
    });
  });
});
