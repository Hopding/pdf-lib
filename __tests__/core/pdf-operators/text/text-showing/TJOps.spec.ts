import { PDFHexString, PDFNumber, PDFString } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import * as TJOps from 'core/pdf-operators/text/text-showing/TJOps';
import { typedArrayFor } from 'utils';

describe(`TJOps.Tj`, () => {
  it(`it requires a PDFString, PDFHexString, or String to be constructed`, () => {
    expect(() => new TJOps.Tj()).toThrowError(
      'Tj operator arg "str" must be one of: PDFString, PDFHexString, String',
    );
    expect(() => new TJOps.Tj(21)).toThrowError(
      'Tj operator arg "str" must be one of: PDFString, PDFHexString, String',
    );
    [
      PDFString.fromString('Foo'),
      PDFHexString.fromString('ABC123'),
      'QuxBaz',
    ].forEach((arg) => {
      const instance = new TJOps.Tj(arg);
      expect(instance).toBeInstanceOf(PDFOperator);
      expect(instance).toBeInstanceOf(TJOps.Tj);
    });
  });

  it(`has a static "of" factory method`, () => {
    expect(() => TJOps.Tj.of()).toThrowError(
      'Tj operator arg "str" must be one of: PDFString, PDFHexString, String',
    );
    expect(() => TJOps.Tj.of(21)).toThrowError(
      'Tj operator arg "str" must be one of: PDFString, PDFHexString, String',
    );
    [
      PDFString.fromString('Foo'),
      PDFHexString.fromString('ABC123'),
      'QuxBaz',
    ].forEach((arg) => {
      const instance = TJOps.Tj.of(arg);
      expect(instance).toBeInstanceOf(PDFOperator);
      expect(instance).toBeInstanceOf(TJOps.Tj);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the TJOps.Tj instance as a string`, () => {
      const instance = TJOps.Tj.of('FooBar');
      expect(instance.toString()).toEqual(`(FooBar) Tj\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the TDOps.Td instance in bytes`, () => {
      const instance = TJOps.Tj.of('FooBar');
      expect(instance.bytesSize()).toEqual(12);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the TDOps.Td instance into the buffer as bytes`, () => {
      const instance = TJOps.Tj.of('FooBar');
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`(FooBar) Tj\n`));
    });
  });
});

describe(`TJOps.TJ`, () => {
  it(`it requires PDFStrings, PDFHexStrings, Strings, or Numbers to be constructed`, () => {
    expect(() => new TJOps.TJ()).toThrowError(
      'TJ operator requires  PDFStrings, PDFHexStrings, PDFNumbers, Strings, or Numbers to be constructed',
    );
    expect(() => new TJOps.TJ([])).toThrowError(
      'TJ operator arg elements must be one of: PDFString, PDFHexString, PDFNumber, String, Number',
    );
    [
      PDFString.fromString('Foo'),
      PDFHexString.fromString('ABC123'),
      PDFNumber.fromNumber(21),
      'QuxBaz',
      21,
    ].forEach((arg) => {
      const instance = new TJOps.TJ(arg);
      expect(instance).toBeInstanceOf(PDFOperator);
      expect(instance).toBeInstanceOf(TJOps.TJ);
    });
  });

  it(`has a static "of" factory method`, () => {
    expect(() => TJOps.TJ.of()).toThrowError(
      'TJ operator requires  PDFStrings, PDFHexStrings, PDFNumbers, Strings, or Numbers to be constructed',
    );
    expect(() => TJOps.TJ.of([])).toThrowError(
      'TJ operator arg elements must be one of: PDFString, PDFHexString, PDFNumber, String, Number',
    );
    [
      PDFString.fromString('Foo'),
      PDFHexString.fromString('ABC123'),
      PDFNumber.fromNumber(21),
      'QuxBaz',
      21,
    ].forEach((arg) => {
      const instance = TJOps.TJ.of(arg);
      expect(instance).toBeInstanceOf(PDFOperator);
      expect(instance).toBeInstanceOf(TJOps.TJ);
    });
  });

  describe(`"toString" method`, () => {
    it(`returns the TJOps.TJ instance as a string`, () => {
      const instance = TJOps.TJ.of('FooBar', 21, 'Qux', 42, 'Baz');
      expect(instance.toString()).toEqual(
        `[ (FooBar) 21 (Qux) 42 (Baz) ] TJ\n`,
      );
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the TDOps.Td instance in bytes`, () => {
      const instance = TJOps.TJ.of('FooBar', 21, 'Qux', 42, 'Baz');
      expect(instance.bytesSize()).toEqual(34);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the TDOps.Td instance into the buffer as bytes`, () => {
      const instance = TJOps.TJ.of('FooBar', 21, 'Qux', 42, 'Baz');
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(
        typedArrayFor(`[ (FooBar) 21 (Qux) 42 (Baz) ] TJ\n`),
      );
    });
  });
});
