// Required to prevent error from circular dependencies in this test
import 'core/pdf-objects';

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
import PDFOperators from 'core/pdf-operators';
import { PDFContentStream, PDFPage, PDFPageTree } from 'core/pdf-structures';
import { typedArrayFor } from 'utils';

describe(`PDFPage`, () => {
  it(`extends PDFDictionary`, () => {
    const dict = PDFDictionary.from(
      { foo: PDFString.fromString('bar') },
      PDFObjectIndex.create(),
    );
    expect(PDFPage.fromDict(dict)).toBeInstanceOf(PDFDictionary);
  });

  describe(`static "create" factory method`, () => {
    it(`requires a PDFObjectIndex and size as its arguments`, () => {
      expect(() => PDFPage.create()).toThrowError(
        'size must be an array of 2 numbers.',
      );
      expect(() => PDFPage.create('foo', [])).toThrowError(
        'size tuple must have two elements.',
      );
      expect(() => PDFPage.create('foo', ['1', '2'])).toThrowError(
        'size tuple entries must be Numbers.',
      );
      expect(() => PDFPage.create('foo', [1, '2'])).toThrowError(
        'size tuple entries must be Numbers.',
      );
      expect(() => PDFPage.create('foo', [1, 2])).toThrowError(
        '"index" must be a an instance of PDFObjectIndex',
      );
    });

    it(`returns a valid PDFPage object`, () => {
      expect(PDFPage.create(PDFObjectIndex.create(), [1, 2])).toBeInstanceOf(
        PDFPage,
      );
    });
  });

  describe(`static "fromDict" factory method`, () => {
    it(`requires a PDFDictionary as its argument`, () => {
      expect(() => PDFPage.fromDict()).toThrowError(
        '"dict" must be a PDFDictionary',
      );
      expect(() => PDFPage.fromDict('foo')).toThrowError(
        '"dict" must be a PDFDictionary',
      );
    });

    it(`returns a PDFPage`, () => {
      const dict = PDFDictionary.from(
        { foo: PDFString.fromString('foo') },
        PDFObjectIndex.create(),
      );
      expect(PDFPage.fromDict(dict)).toBeInstanceOf(PDFPage);
    });
  });

  describe(`"Resources" getter`, () => {
    it(`looks up and returns the "Resources" entry in the PDFPage`, () => {
      const index = PDFObjectIndex.create();
      const resourcesDict = PDFDictionary.from(
        { foo: PDFString.fromString('bar') },
        index,
      );
      index.set(PDFIndirectReference.forNumbers(1, 2), resourcesDict);
      const page = PDFPage.create(index, [1, 2], resourcesDict);
      expect(page.Resources).toBe(resourcesDict);
    });
  });

  describe(`"Contents" getter`, () => {
    it(`looks up and returns the "Contents" entry in the PDFPage`, () => {
      const { cm, s, S } = PDFOperators;

      const index = PDFObjectIndex.create();
      const contentStream = PDFContentStream.of(
        PDFDictionary.from({}, index),
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        S.operator,
      );

      const contentsArray = PDFArray.fromArray([contentStream], index);
      index.set(PDFIndirectReference.forNumbers(1, 2), contentsArray);

      const page = PDFPage.create(index, [1, 2]);
      page.set('Contents', PDFIndirectReference.forNumbers(1, 2));
      expect(page.Contents).toBe(contentsArray);
    });
  });

  describe(`"normalizeContents" method`, () => {
    it(`converts non-PDFArray "Contents" entries to PDFArrays`, () => {
      const { cm, s, S } = PDFOperators;

      const index = PDFObjectIndex.create();
      const contentStream = PDFContentStream.of(
        PDFDictionary.from({}, index),
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        S.operator,
      );
      index.set(PDFIndirectReference.forNumbers(1, 2), contentStream);

      const page = PDFPage.create(index, [1, 2]);
      page.set('Contents', PDFIndirectReference.forNumbers(1, 2));
      expect(page.Contents).not.toBeInstanceOf(PDFArray);

      page.normalizeContents();

      expect(page.Contents).toBeInstanceOf(PDFArray);
      expect(index.lookup(page.Contents.get(0))).toBe(contentStream);
    });
  });

  describe(`"normalizeCTM" method`, () => {
    it(`does nothing if the PDFPage's "Contents" is undefined`, () => {
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      page.map.set(PDFName.from('Contents'), undefined);

      const res = page.normalizeCTM();
      expect(res).toBe(page);
    });

    it(`wraps the PDFPage's "Contents" in the PDFObjectIndex's graphics state content streams`, () => {
      const { q, Q, cm, s, S } = PDFOperators;
      const index = PDFObjectIndex.create();
      const ref1 = PDFIndirectReference.forNumbers(1, 0);
      const ref2 = PDFIndirectReference.forNumbers(2, 0);
      const ref3 = PDFIndirectReference.forNumbers(3, 0);

      const qContentStream = PDFContentStream.of(
        PDFDictionary.from({}, index),
        q.operator,
      );
      const QContentStream = PDFContentStream.of(
        PDFDictionary.from({}, index),
        Q.operator,
      );

      index.set(ref1, qContentStream);
      index.set(ref2, qContentStream);
      index.pushGraphicsStateContentStream = ref1;
      index.popGraphicsStateContentStream = ref2;

      const contentStream = PDFContentStream.of(
        PDFDictionary.from({}, index),
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        S.operator,
      );
      index.set(ref3, contentStream);

      const page = PDFPage.create(index, [1, 2]);
      page.set('Contents', PDFArray.fromArray([ref3], index));

      expect(page.Contents.array).toEqual([ref3]);
      page.normalizeCTM();
      expect(page.Contents.array).toEqual([ref1, ref3, ref2]);
    });
  });

  describe(`"normalizeResources" method`, () => {
    it(`adds a "Resources" entry to the PDFPage if it doesn't exist`, () => {
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      expect(() => page.Resources).toThrowError(
        'Missing PDFDictionary entry "Resources".',
      );

      page.normalizeResources({});
      expect(page.Resources).toBeInstanceOf(PDFDictionary);
    });

    it(`adds a "Resources.Font" entry to the PDFPage if it doesn't exist`, () => {
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      page.normalizeResources({ Font: true });
      expect(page.Resources.get('Font')).toBeInstanceOf(PDFDictionary);
      expect(page.Resources.getMaybe('XObject')).toBeUndefined();
    });

    it(`adds a "Resources.XObject" entry to the PDFPage if it doesn't exist`, () => {
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      page.normalizeResources({ XObject: true });
      expect(page.Resources.get('XObject')).toBeInstanceOf(PDFDictionary);
      expect(page.Resources.getMaybe('Font')).toBeUndefined();
    });
  });

  describe(`"addContentStreams" method`, () => {
    it(`requires PDFIndirectReferences as its arguments`, () => {
      const { cm, s, S } = PDFOperators;
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      const contentStream = PDFContentStream.of(
        PDFDictionary.from({}, index),
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        S.operator,
      );

      expect(() => page.addContentStreams('foo')).toThrowError(
        '"contentStream" must be of type PDFIndirectReference<PDFContentStream>',
      );
      expect(() => page.addContentStreams(contentStream)).toThrowError(
        '"contentStream" must be of type PDFIndirectReference<PDFContentStream>',
      );
    });

    it(`adds its arguments to the "Contents" array of the PDFPage`, () => {
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      expect(() => page.Contents).toThrowError();

      page.addContentStreams(PDFIndirectReference.forNumbers(1, 2));
      expect(page.Contents).toBeInstanceOf(PDFArray);
      expect(page.Contents.array.length).toBe(1);

      page.addContentStreams(
        PDFIndirectReference.forNumbers(1, 3),
        PDFIndirectReference.forNumbers(1, 4),
      );
      expect(page.Contents.array.length).toBe(3);
    });
  });

  describe(`"addFontDictionary" method`, () => {
    it(`requires a string and PDFIndirectReference as its arguments`, () => {
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      expect(() => page.addFontDictionary(12)).toThrowError(
        '"key" must be a string',
      );
      expect(() => page.addFontDictionary('FooFont')).toThrowError(
        '"fontDict" must be an instance of PDFIndirectReference',
      );
    });

    it(`adds a Font to the PDFPage's font dictionary`, () => {
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      expect(() => page.Resources).toThrowError();

      page.addFontDictionary('FooFont', PDFIndirectReference.forNumbers(1, 2));
      expect(page.Resources).toBeInstanceOf(PDFDictionary);
      expect(page.Resources.get('Font')).toBeInstanceOf(PDFDictionary);
      expect(page.Resources.get('Font').get('FooFont')).toBe(
        PDFIndirectReference.forNumbers(1, 2),
      );
    });
  });

  describe(`"addXObject" method`, () => {
    it(`requires a string and PDFIndirectReference as its arguments`, () => {
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      expect(() => page.addXObject(12)).toThrowError('"key" must be a string');
      expect(() => page.addXObject('FooFont')).toThrowError(
        '"xObject" must be an instance of PDFIndirectReference',
      );
    });

    it(`adds an XObject to the PDFPage's XObject dictionary`, () => {
      const index = PDFObjectIndex.create();
      const page = PDFPage.create(index, [1, 2]);
      expect(() => page.Resources).toThrowError();

      page.addXObject('FooX', PDFIndirectReference.forNumbers(1, 2));
      expect(page.Resources).toBeInstanceOf(PDFDictionary);
      expect(page.Resources.get('XObject')).toBeInstanceOf(PDFDictionary);
      expect(page.Resources.get('XObject').get('FooX')).toBe(
        PDFIndirectReference.forNumbers(1, 2),
      );
    });
  });
});
