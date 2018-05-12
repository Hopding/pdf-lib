import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFBoolean,
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFDictionary`, () => {
  it(`requires an Object<PDFObject> or Map<PDFObject> and a PDFObjectIndex to be constructed`, () => {
    expect(() => new PDFDictionary()).toThrowError(
      'PDFDictionary can only be constructed from an Object or a Map',
    );
    expect(() => new PDFDictionary([])).toThrowError(
      'PDFDictionary can only be constructed from an Object or a Map',
    );
    expect(() => new PDFDictionary({ Foo: 'Bar' })).toThrowError(
      '"index" must be an instance of PDFObjectIndex',
    );
    expect(
      () => new PDFDictionary({ Foo: 'Bar' }, PDFObjectIndex.create()),
    ).toThrowError('PDFDictionary.set() requires values to be PDFObjects');

    expect(
      new PDFDictionary(
        { Foo: PDFString.fromString('Bar') },
        PDFObjectIndex.create(),
      ),
    ).toBeInstanceOf(PDFDictionary);

    const map = new Map();
    map.set('Foo', PDFString.fromString('Bar'));
    expect(new PDFDictionary(map, PDFObjectIndex.create())).toBeInstanceOf(
      PDFDictionary,
    );
  });

  it(`has a static "from" factory method`, () => {
    expect(() => PDFDictionary.from()).toThrowError(
      'PDFDictionary can only be constructed from an Object or a Map',
    );
    expect(() => PDFDictionary.from([])).toThrowError(
      'PDFDictionary can only be constructed from an Object or a Map',
    );
    expect(() => PDFDictionary.from({ Foo: 'Bar' })).toThrowError(
      '"index" must be an instance of PDFObjectIndex',
    );
    expect(() =>
      PDFDictionary.from({ Foo: 'Bar' }, PDFObjectIndex.create()),
    ).toThrowError('PDFDictionary.set() requires values to be PDFObjects');

    expect(
      PDFDictionary.from(
        { Foo: PDFString.fromString('Bar') },
        PDFObjectIndex.create(),
      ),
    ).toBeInstanceOf(PDFDictionary);

    const map = new Map();
    map.set('Foo', PDFString.fromString('Bar'));
    expect(PDFDictionary.from(map, PDFObjectIndex.create())).toBeInstanceOf(
      PDFDictionary,
    );
  });

  describe(`"filter" method`, () => {
    it(`returns all entries matching the predicate`, () => {
      const pdfDict = PDFDictionary.from(
        {
          AString: PDFString.fromString('Foo'),
          ANumber: PDFNumber.fromNumber(1),
          ABoolean: PDFBoolean.fromBool(true),
        },
        PDFObjectIndex.create(),
      );
      const res = pdfDict.filter(
        (val, key) =>
          val instanceof PDFString || key === PDFName.from('ABoolean'),
      );
      expect(res).toEqual([
        [PDFName.from('AString'), expect.any(PDFString)],
        [PDFName.from('ABoolean'), expect.any(PDFBoolean)],
      ]);
    });
  });

  describe(`"getMaybe" method`, () => {
    it(`requires a String or PDFName as its arguments`, () => {
      const pdfDict = PDFDictionary.from(
        { AString: PDFString.fromString('Foo') },
        PDFObjectIndex.create(),
      );
      expect(() => pdfDict.getMaybe(0)).toThrowError(
        'PDFDictionary.set() requires keys to be strings or PDFNames',
      );
    });

    it(`returns the value under the given key if it exists`, () => {
      const pdfDict = PDFDictionary.from(
        { AString: PDFString.fromString('Foo') },
        PDFObjectIndex.create(),
      );
      expect(pdfDict.getMaybe('AString')).toEqual(expect.any(PDFString));
      expect(pdfDict.getMaybe(PDFName.from('AString'))).toEqual(
        expect.any(PDFString),
      );
    });

    it(`returns undefined if the value under the given key does not exist`, () => {
      const pdfDict = PDFDictionary.from(
        { AString: PDFString.fromString('Foo') },
        PDFObjectIndex.create(),
      );
      expect(pdfDict.getMaybe('QUX_BAZ')).toBe(undefined);
    });
  });

  describe(`"get" method`, () => {
    it(`requires a String or PDFName as its arguments`, () => {
      const pdfDict = PDFDictionary.from(
        { AString: PDFString.fromString('Foo') },
        PDFObjectIndex.create(),
      );
      expect(() => pdfDict.get(0)).toThrowError(
        'PDFDictionary.set() requires keys to be strings or PDFNames',
      );
    });

    it(`returns the value under the given key if it exists`, () => {
      const pdfDict = PDFDictionary.from(
        { AString: PDFString.fromString('Foo') },
        PDFObjectIndex.create(),
      );
      expect(pdfDict.get('AString')).toEqual(expect.any(PDFString));
      expect(pdfDict.get(PDFName.from('AString'))).toEqual(
        expect.any(PDFString),
      );
    });

    it(`returns undefined if the value under the given key does not exist`, () => {
      const pdfDict = PDFDictionary.from(
        { AString: PDFString.fromString('Foo') },
        PDFObjectIndex.create(),
      );
      expect(() => pdfDict.get('QUX_BAZ')).toThrowError(
        'Missing PDFDictionary entry "QUX_BAZ"',
      );
    });
  });

  describe(`"set" method`, () => {
    it(`requires a String or PDFName and a PDFObject as arguments`, () => {
      const pdfDict = PDFDictionary.from(
        { AString: PDFString.fromString('Foo') },
        PDFObjectIndex.create(),
      );

      expect(() => pdfDict.set(0, 'bar')).toThrowError(
        'PDFDictionary.set() requires keys to be strings or PDFNames',
      );
      expect(() => pdfDict.set('foo', 'bar')).toThrowError(
        'PDFDictionary.set() requires values to be PDFObjects',
      );
    });

    it(`updates the PDFDictionary`, () => {
      const pdfDict = PDFDictionary.from(
        { AString: PDFString.fromString('Foo') },
        PDFObjectIndex.create(),
      );

      expect(pdfDict.set('foo', PDFString.fromString('bar'))).toBe(pdfDict);
      expect(pdfDict.set(PDFName.from('qux'), PDFBoolean.fromBool(true))).toBe(
        pdfDict,
      );

      expect(pdfDict.get(PDFName.from('foo'))).toEqual(expect.any(PDFString));
      expect(pdfDict.get('qux')).toEqual(expect.any(PDFBoolean));
    });

    it(`throws an error if the key is invalid`, () => {
      const pdfDict = new PDFDictionary(
        { AString: PDFString.fromString('Foo') },
        PDFObjectIndex.create(),
        ['Foo', 'Bar'],
      );
      expect(() =>
        pdfDict.set('Qux', PDFString.fromString('Baz')),
      ).toThrowError('Invalid key: "Qux"');
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFDictionary as a string`, () => {
      const pdfNumber = PDFNumber.fromNumber(9000);
      const pdfDict = PDFDictionary.from(
        {
          AString: PDFString.fromString('Foo'),
          AnObj: PDFIndirectObject.of(pdfNumber).setReferenceNumbers(1, 2),
        },
        PDFObjectIndex.create(),
      );

      expect(pdfDict.toString()).toEqual(
        `<<\n/AString (Foo)\n/AnObj 1 2 R\n>>`,
      );
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFDictionary in bytes`, () => {
      const pdfNumber = PDFNumber.fromNumber(9000);
      const pdfDict = PDFDictionary.from(
        {
          AString: PDFString.fromString('Foo'),
          AnObj: PDFIndirectObject.of(pdfNumber).setReferenceNumbers(1, 2),
        },
        PDFObjectIndex.create(),
      );

      expect(pdfDict.bytesSize()).toEqual(33);
    });

    it(`throws an error if it encounters a non PDFObject in the PDFDictionary`, () => {
      const pdfDict = PDFDictionary.from({}, PDFObjectIndex.create());
      pdfDict.map.set(PDFName.from('Foo'), 'Bar');
      expect(() => pdfDict.bytesSize()).toThrowError('Not a PDFObject: String');
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFDictionary into the buffer as bytes`, () => {
      const pdfNumber = PDFNumber.fromNumber(9000);
      const pdfDict = PDFDictionary.from(
        {
          AString: PDFString.fromString('Foo'),
          AnObj: PDFIndirectObject.of(pdfNumber).setReferenceNumbers(1, 2),
        },
        PDFObjectIndex.create(),
      );

      const buffer = new Uint8Array(pdfDict.bytesSize());
      pdfDict.copyBytesInto(buffer);
      expect(buffer).toEqual(
        typedArrayFor(`<<\n/AString (Foo)\n/AnObj 1 2 R\n>>`),
      );
    });

    it(`throws an error if it encounters a non PDFObject in the PDFDictionary`, () => {
      const pdfDict = PDFDictionary.from({}, PDFObjectIndex.create());
      pdfDict.map.set(PDFName.from('Foo'), 'Bar');
      const buffer = new Uint8Array(0);
      expect(() => pdfDict.copyBytesInto(buffer)).toThrowError(
        'Not a PDFObject: String',
      );
    });
  });
});
