import { PDFHexString, PDFString } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import * as QuoteOps from 'core/pdf-operators/text/text-showing/QuoteOps';
import { typedArrayFor } from 'utils';

describe(`QuoteOps.SingleQuote`, () => {
  it(`it requires a PDFString, PDFHexString, or String to be constructed`, () => {
    expect(() => new QuoteOps.SingleQuote()).toThrowError(
      '\' operator arg "string" must be one of: PDFString, PDFHexString, String',
    );
    expect(() => new QuoteOps.SingleQuote(21)).toThrowError(
      '\' operator arg "string" must be one of: PDFString, PDFHexString, String',
    );
    [
      PDFString.fromString('Foo'),
      PDFHexString.fromString('ABC123'),
      'QuxBaz',
    ].forEach((arg) => {
      const instance = new QuoteOps.SingleQuote(arg);
      expect(instance).toBeInstanceOf(PDFOperator);
      expect(instance).toBeInstanceOf(QuoteOps.SingleQuote);
    });
  });

  it(`has a static "of" factory method`, () => {
    expect(() => QuoteOps.SingleQuote.of()).toThrowError(
      '\' operator arg "string" must be one of: PDFString, PDFHexString, String',
    );
    expect(() => QuoteOps.SingleQuote.of(21)).toThrowError(
      '\' operator arg "string" must be one of: PDFString, PDFHexString, String',
    );
    [
      PDFString.fromString('Foo'),
      PDFHexString.fromString('ABC123'),
      'QuxBaz',
    ].forEach((arg) => {
      const instance = QuoteOps.SingleQuote.of(arg);
      expect(instance).toBeInstanceOf(PDFOperator);
      expect(instance).toBeInstanceOf(QuoteOps.SingleQuote);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the QuoteOps.SingleQuote instance as a string`, () => {
      const instance = QuoteOps.SingleQuote.of('FooBar');
      expect(instance.toString()).toEqual(`(FooBar) '\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the TDOps.Td instance in bytes`, () => {
      const instance = QuoteOps.SingleQuote.of('FooBar');
      expect(instance.bytesSize()).toEqual(11);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the TDOps.Td instance into the buffer as bytes`, () => {
      const instance = QuoteOps.SingleQuote.of('FooBar');
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`(FooBar) '\n`));
    });
  });
});

describe(`QuoteOps.DoubleQuote`, () => {
  it(`it requires two numbers and a PDFString, PDFHexString, or String to be constructed`, () => {
    expect(() => new QuoteOps.DoubleQuote()).toThrowError(
      '" operator arg "aw" must be a Number',
    );
    expect(() => new QuoteOps.DoubleQuote(21)).toThrowError(
      '" operator arg "ac" must be a Number',
    );
    [
      PDFString.fromString('Foo'),
      PDFHexString.fromString('ABC123'),
      'QuxBaz',
    ].forEach((arg) => {
      const instance = new QuoteOps.DoubleQuote(21, 99, arg);
      expect(instance).toBeInstanceOf(PDFOperator);
      expect(instance).toBeInstanceOf(QuoteOps.DoubleQuote);
    });
  });

  it(`has a static "of" factory method`, () => {
    expect(() => QuoteOps.DoubleQuote.of()).toThrowError(
      '" operator arg "aw" must be a Number',
    );
    expect(() => QuoteOps.DoubleQuote.of(21)).toThrowError(
      '" operator arg "ac" must be a Number',
    );
    [
      PDFString.fromString('Foo'),
      PDFHexString.fromString('ABC123'),
      'QuxBaz',
    ].forEach((arg) => {
      const instance = QuoteOps.DoubleQuote.of(21, 99, arg);
      expect(instance).toBeInstanceOf(PDFOperator);
      expect(instance).toBeInstanceOf(QuoteOps.DoubleQuote);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the QuoteOps.DoubleQuote instance as a string`, () => {
      const instance = QuoteOps.DoubleQuote.of(21, 99, 'FooBar');
      expect(instance.toString()).toEqual(`21 99 (FooBar) "\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the QuoteOps.DoubleQuote instance in bytes`, () => {
      const instance = QuoteOps.DoubleQuote.of(21, 99, 'FooBar');
      expect(instance.bytesSize()).toEqual(17);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the TDOps.Td instance into the buffer as bytes`, () => {
      const instance = QuoteOps.DoubleQuote.of(21, 99, 'FooBar');
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`21 99 (FooBar) "\n`));
    });
  });
});
