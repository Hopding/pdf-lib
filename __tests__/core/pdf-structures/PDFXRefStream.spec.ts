// Required to prevent an issue with circular dependency resolution in this test
import 'core/pdf-objects';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import { PDFDictionary, PDFNumber, PDFStream } from 'core/pdf-objects';
import PDFOperators from 'core/pdf-operators';
import { PDFXRefStream } from 'core/pdf-structures';
import { arrayToString, typedArrayFor } from 'utils';

describe(`PDFXRefStream`, () => {
  it(`inherits from PDFSteam`, () => {
    expect(
      new PDFXRefStream(PDFDictionary.from({}, PDFObjectIndex.create())),
    ).toBeInstanceOf(PDFStream);
  });

  describe(`static "create" factory method`, () => {
    it(`requires a PDFObjectIndex to be constructed`, () => {
      expect(() => PDFXRefStream.create()).toThrowError(
        '"index" must be an instance of PDFObjectIndex',
      );
      expect(PDFXRefStream.create(PDFObjectIndex.create())).toBeInstanceOf(
        PDFXRefStream,
      );
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFXRefStream in bytes`, () => {
      const xrefStream = PDFXRefStream.create(PDFObjectIndex.create());

      xrefStream.addFreeObjectEntry(11, 2);
      xrefStream.addUncompressedObjectEntry(30, 40);
      xrefStream.addCompressedObjectEntry(5, 691);

      expect(xrefStream.bytesSize()).toBe(85);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFXRefStream into the buffer as bytes`, () => {
      const xrefStream = PDFXRefStream.create(PDFObjectIndex.create());

      xrefStream.addFreeObjectEntry(11, 2);
      xrefStream.addUncompressedObjectEntry(30, 40);
      xrefStream.addCompressedObjectEntry(5, 691);

      const buffer = new Uint8Array(xrefStream.bytesSize());
      xrefStream.copyBytesInto(buffer);

      const expected = `
<<
/Type /XRef
/W [ 1 2 3 ]
/Length 26
>>
stream
0 11 002
1 30 040
2 05 691
endstream
  `.trim();
      expect(buffer).toEqual(typedArrayFor(expected));
    });
  });
});
