import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFObject,
  PDFString,
} from 'core/pdf-objects';
import { PDFObjectStream } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

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
      'PDFObjectStream.dictionary must be a PDFDictionary',
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
        'PDFObjectStream.dictionary must be a PDFDictionary',
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
});
