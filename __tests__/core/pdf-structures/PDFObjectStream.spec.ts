import pako from 'pako';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectObject,
  PDFNumber,
  PDFObject,
  PDFString,
} from 'core/pdf-objects';
import PDFOperators from 'core/pdf-operators';
import { PDFObjectStream } from 'core/pdf-structures';
import { arrayToString, mergeUint8Arrays, typedArrayFor } from 'utils';

describe(`PDFObjectStream`, () => {
  it(`extends PDFObject`, () => {
    const dict = PDFDictionary.from(
      { foo: PDFString.fromString('bar') },
      PDFObjectIndex.create(),
    );
    expect(PDFObjectStream.from(dict, [])).toBeInstanceOf(PDFObject);
  });

  it(`requires a PDFDictionary and PDFIndirectObject[] to be constructed`, () => {
    expect(() => new PDFObjectStream()).toThrowError(
      'PDFStream.dictionary must be of type PDFDictionary',
    );

    const dict = PDFDictionary.from(
      { foo: PDFString.fromString('bar') },
      PDFObjectIndex.create(),
    );
    expect(() => new PDFObjectStream(dict)).toThrowError(
      'validateArr.value must be an array.',
    );
    expect(() => new PDFObjectStream(dict, ['foo'])).toThrowError(
      'PDFObjectStream.objects must be an array of PDFIndirectObject',
    );

    expect(
      new PDFObjectStream(dict, [
        PDFIndirectObject.of(PDFString.fromString('foo')),
        PDFIndirectObject.of(PDFString.fromString('bar')),
      ]),
    ).toBeInstanceOf(PDFObjectStream);
  });

  describe(`static "from" factory method`, () => {
    it(`requires a PDFDictionary and PDFIndirectObject[] as its arguments`, () => {
      expect(() => new PDFObjectStream()).toThrowError(
        'PDFStream.dictionary must be of type PDFDictionary',
      );

      const dict = PDFDictionary.from(
        { foo: PDFString.fromString('bar') },
        PDFObjectIndex.create(),
      );
      expect(() => new PDFObjectStream(dict)).toThrowError(
        'validateArr.value must be an array.',
      );
      expect(() => new PDFObjectStream(dict, ['foo'])).toThrowError(
        'PDFObjectStream.objects must be an array of PDFIndirectObject',
      );

      expect(
        new PDFObjectStream(dict, [
          PDFIndirectObject.of(PDFString.fromString('foo')),
          PDFIndirectObject.of(PDFString.fromString('bar')),
        ]),
      ).toBeInstanceOf(PDFObjectStream);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFObjectStream in bytes`, () => {
      const index = PDFObjectIndex.create();

      const object1 = PDFString.fromString('FooBar');
      const object2 = PDFDictionary.from(
        { Qux: PDFString.fromString('Baz') },
        index,
      );
      const object3 = PDFArray.fromArray(
        [
          PDFDictionary.from({ Qux: PDFString.fromString('Baz') }, index),
          PDFNumber.fromNumber(21),
        ],
        index,
      );

      const objStream = PDFObjectStream.create(index, [
        PDFIndirectObject.of(object1).setReferenceNumbers(1, 0),
        PDFIndirectObject.of(object2).setReferenceNumbers(2, 0),
        PDFIndirectObject.of(object3).setReferenceNumbers(9000, 0),
      ]);

      expect(objStream.bytesSize()).toBe(129);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFObjectStream into the buffer as bytes`, () => {
      const index = PDFObjectIndex.create();

      const object1 = PDFString.fromString('FooBar');
      const object2 = PDFDictionary.from(
        { Qux: PDFString.fromString('Baz') },
        index,
      );
      const object3 = PDFArray.fromArray(
        [
          PDFDictionary.from({ Qux: PDFString.fromString('Baz') }, index),
          PDFNumber.fromNumber(21),
        ],
        index,
      );

      const objStream = PDFObjectStream.create(index, [
        PDFIndirectObject.of(object1).setReferenceNumbers(1, 0),
        PDFIndirectObject.of(object2).setReferenceNumbers(2, 0),
        PDFIndirectObject.of(object3).setReferenceNumbers(9000, 0),
      ]);

      const buffer = new Uint8Array(objStream.bytesSize());
      objStream.copyBytesInto(buffer);

      const expected = `
<<
/Type /ObjStm
/Length 66
/N 3
/First 16
>>
stream
1 0 2 9 9000 26
(FooBar)
<<
/Qux (Baz)
>>
[ <<
/Qux (Baz)
>> 21 ]

endstream
  `.trim();
      expect(buffer).toEqual(typedArrayFor(expected));
    });

    it(`copies the encoded PDFObjectStream into the buffer as bytes`, () => {
      const index = PDFObjectIndex.create();

      const object1 = PDFString.fromString('FooBar');
      const object2 = PDFDictionary.from(
        { Qux: PDFString.fromString('Baz') },
        index,
      );
      const object3 = PDFArray.fromArray(
        [
          PDFDictionary.from({ Qux: PDFString.fromString('Baz') }, index),
          PDFNumber.fromNumber(21),
        ],
        index,
      );

      const objStream = PDFObjectStream.create(index, [
        PDFIndirectObject.of(object1).setReferenceNumbers(1, 0),
        PDFIndirectObject.of(object2).setReferenceNumbers(2, 0),
        PDFIndirectObject.of(object3).setReferenceNumbers(9000, 0),
      ]);
      objStream.encode();

      const buffer = new Uint8Array(objStream.bytesSize());
      objStream.copyBytesInto(buffer);

      // prettier-ignore
      const encodedContents = pako.deflate(typedArrayFor(
`1 0 2 9 9000 26
(FooBar)
<<
/Qux (Baz)
>>
[ <<
/Qux (Baz)
>> 21 ]
`));

      // prettier-ignore
      const expected = mergeUint8Arrays(
        typedArrayFor(
`<<
/Type /ObjStm
/Filter /FlateDecode
/Length ${encodedContents.length}
/N 3
/First 16
>>
stream\n`,
        ),
        encodedContents,
        typedArrayFor(`\nendstream`));

      expect(buffer).toEqual(expected);
    });
  });
});
