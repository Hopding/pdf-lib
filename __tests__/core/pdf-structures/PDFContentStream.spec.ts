import pako from 'pako';

// Required to prevent an issue with circular dependency resolution in this test
import 'core/pdf-objects';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import { PDFDictionary, PDFNumber } from 'core/pdf-objects';
import PDFOperators from 'core/pdf-operators';
import { PDFContentStream } from 'core/pdf-structures';
import { arrayToString, mergeUint8Arrays, typedArrayFor } from 'utils';

describe(`PDFContentStream`, () => {
  it(`requires a PDFDictionary and Array<PDFOperator | PDFOperator[]> to be constructed`, () => {
    expect(() => new PDFContentStream()).toThrowError(
      'PDFStream.dictionary must be of type PDFDictionary',
    );

    const dict = PDFDictionary.from({}, PDFObjectIndex.create());
    expect(() => new PDFContentStream(dict, 'foo')).toThrowError(
      'PDFContentStream requires PDFOperators or PDFOperator[]s to be constructed.',
    );

    const { cm, S, s } = PDFOperators;
    expect(
      new PDFContentStream(
        dict,
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        S.operator,
      ),
    ).toBeInstanceOf(PDFContentStream);
  });

  describe(`static "of" factory method`, () => {
    it(`requires a PDFDictionary and Array<PDFOperator | PDFOperator[]> to be constructed`, () => {
      expect(() => PDFContentStream.of()).toThrowError(
        'PDFStream.dictionary must be of type PDFDictionary',
      );

      const dict = PDFDictionary.from({}, PDFObjectIndex.create());
      expect(() => PDFContentStream.of(dict, 'foo')).toThrowError(
        'PDFContentStream requires PDFOperators or PDFOperator[]s to be constructed.',
      );
    });

    it(`returns a PDFContentStream`, () => {
      const dict = PDFDictionary.from({}, PDFObjectIndex.create());
      const { cm, S, s } = PDFOperators;
      expect(
        PDFContentStream.of(
          dict,
          s.operator,
          cm.of(1, 2, 3, 4, 5, 6),
          S.operator,
        ),
      ).toBeInstanceOf(PDFContentStream);
      expect(
        PDFContentStream.of(
          dict,
          [s.operator, cm.of(1, 2, 3, 4, 5, 6)],
          S.operator,
        ),
      ).toBeInstanceOf(PDFContentStream);
    });
  });

  describe(`"operators" array member`, () => {
    const dict = PDFDictionary.from({}, PDFObjectIndex.create());
    const { cm, S, s, re, m, Tf } = PDFOperators;
    const contentStream = PDFContentStream.of(dict, s.operator);

    it(`rejects non-PDFOperator elements`, () => {
      expect(contentStream.operators.length).toBe(1);
      expect(() => contentStream.operators.push('foo')).toThrowError(
        'Typed Array Proxy elements must be of type PDFOperator',
      );
      expect(() => contentStream.operators.fill('foo')).toThrowError(
        'Typed Array Proxy elements must be of type PDFOperator',
      );
      expect(() => contentStream.operators.splice(0, 1, 'foo')).toThrowError(
        'Typed Array Proxy elements must be of type PDFOperator',
      );
      expect(contentStream.operators.length).toBe(1);
    });

    it(`allows PDFOperator elements`, () => {
      expect(contentStream.operators.length).toBe(1);
      contentStream.operators.push(
        cm.of(1, 2, 3, 4, 5, 6),
        S.operator,
        m.of(1, 2),
      );
      contentStream.operators.pop();
      contentStream.operators.splice(1, 1, Tf.of('Foo', 12));
      expect(contentStream.operators.length).toBe(3);
    });

    it(`updates the PDFContentStream's PDFDictionary.Length entry`, () => {
      expect(dict.get('Length')).toBeInstanceOf(PDFNumber);
      expect(dict.get('Length').number).toBe(15);
    });
  });

  describe(`"Length" getter`, () => {
    it(`looks up and returns the "Length" entry of the PDFContentStream's PDFDictionary`, () => {
      const dict = PDFDictionary.from({}, PDFObjectIndex.create());
      const { cm, S, s, Tf } = PDFOperators;
      const contentStream = PDFContentStream.of(
        dict,
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        Tf.of('Foo', 12),
        S.operator,
      );
      expect(contentStream.Length).toBeInstanceOf(PDFNumber);
      expect(contentStream.Length.number).toBe(30);
    });
  });

  describe(`"operatorsBytesSize" method`, () => {
    it(`returns the size of the PDFContentStream's operators in bytes`, () => {
      const dict = PDFDictionary.from({}, PDFObjectIndex.create());
      const { cm, S, s, Tf } = PDFOperators;
      const contentStream = PDFContentStream.of(
        dict,
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        Tf.of('Foo', 12),
        S.operator,
      );
      expect(contentStream.operatorsBytesSize()).toBe(30);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFContentStream in bytes`, () => {
      const dict = PDFDictionary.from({}, PDFObjectIndex.create());
      const { cm, S, s, Tf } = PDFOperators;
      const contentStream = PDFContentStream.of(
        dict,
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        Tf.of('Foo', 12),
        S.operator,
      );
      expect(contentStream.bytesSize()).toBe(64);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFContentStream into the buffer as bytes`, () => {
      const dict = PDFDictionary.from({}, PDFObjectIndex.create());
      const { cm, S, s, Tf } = PDFOperators;
      const contentStream = PDFContentStream.of(
        dict,
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        Tf.of('Foo', 12),
        S.operator,
      );

      const buffer = new Uint8Array(contentStream.bytesSize());
      contentStream.copyBytesInto(buffer);
      const expected = `
<<
/Length 30
>>
stream
s
1 2 3 4 5 6 cm
/Foo 12 Tf
S

endstream
`.trim();

      expect(buffer).toEqual(typedArrayFor(expected));
    });

    it(`copies the encoded PDFContentStream into the buffer as bytes`, () => {
      const dict = PDFDictionary.from({}, PDFObjectIndex.create());
      const { cm, S, s, Tf } = PDFOperators;
      const contentStream = PDFContentStream.of(
        dict,
        s.operator,
        cm.of(1, 2, 3, 4, 5, 6),
        Tf.of('Foo', 12),
        S.operator,
      );
      contentStream.encode();

      const buffer = new Uint8Array(contentStream.bytesSize());
      contentStream.copyBytesInto(buffer);

      // prettier-ignore
      const expected = mergeUint8Arrays(
        typedArrayFor(
`<<
/Length 38
/Filter /FlateDecode
>>
stream
`),
        pako.deflate(typedArrayFor(
`s
1 2 3 4 5 6 cm
/Foo 12 Tf
S
`)),
        typedArrayFor(
`\nendstream`),
      );

      expect(buffer).toEqual(expected);
    });
  });
});
