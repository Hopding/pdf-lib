// Required to prevent an issue with circular dependency resolution in this test
import 'core/pdf-objects';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import { PDFDictionary, PDFNumber } from 'core/pdf-objects';
import PDFOperators from 'core/pdf-operators';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import PDFTextObject from 'core/pdf-operators/text/PDFTextObject';
import { arrayToString, typedArrayFor } from 'utils';

describe(`PDFTextObject`, () => {
  it(`requires PDF text operators to be constructed`, () => {
    const { cm, S, Tm, Tj, quote } = PDFOperators;

    expect(() => new PDFTextObject('foo', 'bar')).toThrowError(
      'only PDF text operators can be pushed to a PDFTextObject',
    );
    expect(
      () => new PDFTextObject(cm.of(1, 2, 3, 4, 5, 6), S.operator),
    ).toThrowError('only PDF text operators can be pushed to a PDFTextObject');

    expect(
      new PDFTextObject(
        Tm.of(1, 2, 3, 4, 5, 6),
        Tj.of('Foo bar and stuff.'),
        quote.single.of('Qux and baz.'),
      ),
    ).toBeInstanceOf(PDFTextObject);
    expect(
      new PDFTextObject(
        Tm.of(1, 2, 3, 4, 5, 6),
        Tj.of('Foo bar and stuff.'),
        quote.single.of('Qux and baz.'),
      ),
    ).toBeInstanceOf(PDFOperator);
  });

  describe(`static "of" factory method`, () => {
    const { cm, S, Tm, Tj, quote } = PDFOperators;

    expect(() => PDFTextObject.of('foo', 'bar')).toThrowError(
      'only PDF text operators can be pushed to a PDFTextObject',
    );
    expect(() =>
      PDFTextObject.of(cm.of(1, 2, 3, 4, 5, 6), S.operator),
    ).toThrowError('only PDF text operators can be pushed to a PDFTextObject');

    expect(
      PDFTextObject.of(
        Tm.of(1, 2, 3, 4, 5, 6),
        Tj.of('Foo bar and stuff.'),
        quote.single.of('Qux and baz.'),
      ),
    ).toBeInstanceOf(PDFTextObject);
    expect(
      PDFTextObject.of(
        Tm.of(1, 2, 3, 4, 5, 6),
        Tj.of('Foo bar and stuff.'),
        quote.single.of('Qux and baz.'),
      ),
    ).toBeInstanceOf(PDFOperator);
  });

  describe(`"operatorsBytesSize" method`, () => {
    it(`returns the size of the PDFTextObject's operators in bytes`, () => {
      const { cm, S, Tm, Tj, quote } = PDFOperators;
      const textObject = PDFTextObject.of(
        Tm.of(1, 2, 3, 4, 5, 6),
        Tj.of('Foo bar and stuff.'),
        quote.single.of('Qux and baz.'),
      );
      expect(textObject.operatorsBytesSize()).toBe(56);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the PDFTextObject as a string`, () => {
      const { cm, S, Tm, Tj, quote } = PDFOperators;
      const textObject = PDFTextObject.of(
        Tm.of(1, 2, 3, 4, 5, 6),
        Tj.of('Foo bar and stuff.'),
        quote.single.of('Qux and baz.'),
      );

      expect(textObject.toString()).toEqual(
        `BT\n` +
          `1 2 3 4 5 6 Tm\n` +
          `(Foo bar and stuff.) Tj\n` +
          `(Qux and baz.) '\n` +
          `ET\n`,
      );
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the PDFTextObject in bytes`, () => {
      const { cm, S, Tm, Tj, quote } = PDFOperators;
      const textObject = PDFTextObject.of(
        Tm.of(1, 2, 3, 4, 5, 6),
        Tj.of('Foo bar and stuff.'),
        quote.single.of('Qux and baz.'),
      );
      expect(textObject.bytesSize()).toBe(62);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the PDFTextObject into the buffer as bytes`, () => {
      const { cm, S, Tm, Tj, quote } = PDFOperators;
      const textObject = PDFTextObject.of(
        Tm.of(1, 2, 3, 4, 5, 6),
        Tj.of('Foo bar and stuff.'),
        quote.single.of('Qux and baz.'),
      );

      const buffer = new Uint8Array(textObject.bytesSize());
      textObject.copyBytesInto(buffer);

      expect(buffer).toEqual(
        typedArrayFor(
          `BT\n` +
            `1 2 3 4 5 6 Tm\n` +
            `(Foo bar and stuff.) Tj\n` +
            `(Qux and baz.) '\n` +
            `ET\n`,
        ),
      );
    });
  });
});
