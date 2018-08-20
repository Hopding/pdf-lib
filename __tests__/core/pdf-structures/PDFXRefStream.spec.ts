import pako from 'pako';

// Required to prevent an issue with circular dependency resolution in this test
import 'core/pdf-objects';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFDictionary,
  PDFIndirectReference,
  PDFNumber,
  PDFStream,
} from 'core/pdf-objects';
import PDFOperators from 'core/pdf-operators';
import { PDFXRefStream } from 'core/pdf-structures';
import { arrayToString, mergeUint8Arrays, typedArrayFor } from 'utils';

describe(`PDFXRefStream`, () => {
  it(`inherits from PDFSteam`, () => {
    expect(
      new PDFXRefStream(
        {
          Size: PDFNumber.fromNumber(21),
          Root: PDFIndirectReference.forNumbers(2, 0),
        },
        PDFObjectIndex.create(),
      ),
    ).toBeInstanceOf(PDFStream);
  });

  describe(`static "create" factory method`, () => {
    it(`requires a PDFObjectIndex to be constructed`, () => {
      const sizeAndRoot = {
        Size: PDFNumber.fromNumber(21),
        Root: PDFIndirectReference.forNumbers(2, 0),
      };
      expect(() => PDFXRefStream.create(sizeAndRoot)).toThrowError(
        '"index" must be an instance of PDFObjectIndex',
      );
      expect(
        PDFXRefStream.create(sizeAndRoot, PDFObjectIndex.create()),
      ).toBeInstanceOf(PDFXRefStream);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFXRefStream in bytes`, () => {
      const xrefStream = PDFXRefStream.create(
        {
          Size: PDFNumber.fromNumber(21),
          Root: PDFIndirectReference.forNumbers(2, 0),
        },
        PDFObjectIndex.create(),
      );

      xrefStream.addFreeObjectEntry(11, 2);
      xrefStream.addUncompressedObjectEntry(30, 40);
      xrefStream.addCompressedObjectEntry(5, 691);

      expect(xrefStream.bytesSize()).toBe(92);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFXRefStream into the buffer as bytes`, () => {
      const xrefStream = PDFXRefStream.create(
        {
          Size: PDFNumber.fromNumber(21),
          Root: PDFIndirectReference.forNumbers(2, 0),
        },
        PDFObjectIndex.create(),
      );

      xrefStream.addFreeObjectEntry(11, 2);
      xrefStream.addUncompressedObjectEntry(30, 40);
      xrefStream.addCompressedObjectEntry(5, 691);

      const buffer = new Uint8Array(xrefStream.bytesSize());
      xrefStream.copyBytesInto(buffer);

      // prettier-ignore
      const expectedEntries = new Uint8Array([
        0, 11, 0, 2,
        1, 30, 0, 40,
        2,  5, 2, 691
      ]);

      // prettier-ignore
      const expected = mergeUint8Arrays(
          typedArrayFor(
`<<
/Type /XRef
/Size 21
/Root 2 0 R
/W [ 1 1 2 ]
/Length 12
>>
stream
`),
          expectedEntries,
          typedArrayFor(`\nendstream`),
      );

      expect(buffer).toEqual(expected);
    });

    it(`copies the encoded PDFXRefStream into the buffer as bytes`, () => {
      const xrefStream = PDFXRefStream.create(
        {
          Size: PDFNumber.fromNumber(21),
          Root: PDFIndirectReference.forNumbers(2, 0),
        },
        PDFObjectIndex.create(),
      );

      xrefStream.addFreeObjectEntry(11, 2);
      xrefStream.addUncompressedObjectEntry(30, 40);
      xrefStream.addCompressedObjectEntry(5, 691);

      xrefStream.encode();

      const buffer = new Uint8Array(xrefStream.bytesSize());
      xrefStream.copyBytesInto(buffer);

      // prettier-ignore
      const expectedEntries = pako.deflate(new Uint8Array([
        0, 11, 0, 2,
        1, 30, 0, 40,
        2,  5, 2, 691
      ]));

      // prettier-ignore
      const expected = mergeUint8Arrays(
          typedArrayFor(
`<<
/Type /XRef
/Size 21
/Root 2 0 R
/Filter /FlateDecode
/W [ 1 1 2 ]
/Length 20
>>
stream
`),
          expectedEntries,
          typedArrayFor(`\nendstream`),
      );

      expect(buffer).toEqual(expected);
    });
  });
});
