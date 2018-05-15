import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { PDFCatalog, PDFPageTree } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`PDFCatalog`, () => {
  it(`extends PDFDictionary`, () => {
    expect(
      PDFCatalog.create(
        PDFIndirectReference.forNumbers(0, 1),
        PDFObjectIndex.create(),
      ),
    ).toBeInstanceOf(PDFDictionary);
  });

  describe(`static "create" factory method`, () => {
    it(`requires a PDFIndirectReference and a PDFObjectIndex as arguments`, () => {
      expect(() => PDFCatalog.create()).toThrowError(
        '"pageTree" must be an indirect reference',
      );
      expect(() =>
        PDFCatalog.create(PDFIndirectReference.forNumbers(0, 1)),
      ).toThrowError('"index" must be an instance of PDFObjectIndex');
    });

    it(`returns a valid PDFCatalog object`, () => {
      const pdfCatalog = PDFCatalog.create(
        PDFIndirectReference.forNumbers(0, 1),
        PDFObjectIndex.create(),
      );
      expect(pdfCatalog).toBeInstanceOf(PDFCatalog);
      expect(pdfCatalog.get('Type')).toBe(PDFName.from('Catalog'));
      expect(pdfCatalog.get('Pages')).toBe(
        PDFIndirectReference.forNumbers(0, 1),
      );
    });
  });

  describe(`static "fromObject" factory method`, () => {
    it(`requires an Object and a PDFObjectIndex as its arguments`, () => {
      expect(() => PDFCatalog.fromObject()).toThrowError(
        'PDFDictionary can only be constructed from an Object or a Map',
      );
      expect(() =>
        PDFCatalog.fromObject({ Foo: PDFString.fromString('Bar') }),
      ).toThrowError('"index" must be an instance of PDFObjectIndex');
    });

    it(`returns a PDFCatalog`, () => {
      const pdfCatalog = PDFCatalog.fromObject(
        { Foo: PDFString.fromString('Bar') },
        PDFObjectIndex.create(),
      );
      expect(pdfCatalog).toBeInstanceOf(PDFCatalog);
    });
  });

  describe(`static "fromDict" factory method`, () => {
    it(`requires a PDFDictionary as its argument`, () => {
      expect(() => PDFCatalog.fromDict()).toThrowError(
        '"dict" must be a PDFDictionary',
      );
      expect(
        PDFCatalog.fromDict(
          PDFDictionary.from(
            { Foo: PDFString.fromString('foo') },
            PDFObjectIndex.create(),
          ),
        ),
      ).toBeInstanceOf(PDFCatalog);
    });
  });

  describe(`"Pages" getter`, () => {
    it(`looks up and returns the "Pages" entry in the PDFCatalog`, () => {
      const index = PDFObjectIndex.create();

      const kidsArray = PDFArray.fromArray([], index);
      const pagesDict = PDFPageTree.createRootNode(
        PDFArray.fromArray([PDFIndirectReference.forNumbers(1, 2)], index),
        index,
      );

      index.set(PDFIndirectReference.forNumbers(1, 2), kidsArray);
      index.set(PDFIndirectReference.forNumbers(1, 3), pagesDict);

      const catalog = PDFCatalog.create(
        PDFIndirectReference.forNumbers(1, 3),
        index,
      );

      expect(catalog.Pages).toBe(pagesDict);
    });
  });
});
