import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import { PDFDictionary, PDFString } from 'core/pdf-objects';
import { PDFLinearizationParams } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`PDFLinearizationParams`, () => {
  it(`extends PDFDictionary`, () => {
    const dict = PDFDictionary.from(
      { foo: PDFString.fromString('bar') },
      PDFObjectIndex.create(),
    );
    expect(PDFLinearizationParams.fromDict(dict)).toBeInstanceOf(PDFDictionary);
  });

  describe(`static "fromDict" factory method`, () => {
    it(`requires a PDFDictionary as its argument`, () => {
      expect(() => PDFLinearizationParams.fromDict()).toThrowError(
        '"dict" must be a PDFDictionary',
      );
      const dict = PDFDictionary.from(
        { foo: PDFString.fromString('bar') },
        PDFObjectIndex.create(),
      );
      expect(PDFLinearizationParams.fromDict(dict)).toBeInstanceOf(
        PDFLinearizationParams,
      );
    });
  });
});
