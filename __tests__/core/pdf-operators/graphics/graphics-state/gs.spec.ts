// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import gs from 'core/pdf-operators/graphics/graphics-state/gs';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`gs`, () => {
  it(`requires a String to be constucted`, () => {
    expect(() => new gs()).toThrowError();
    expect(() => new gs([])).toThrowError(
      'gs operator arg "dictName" must be a string or PDFName.',
    );
    expect(new gs('FooBar')).toBeInstanceOf(gs);
    expect(new gs('FooBar')).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => gs.of()).toThrowError();
    expect(() => gs.of([])).toThrowError(
      'gs operator arg "dictName" must be a string or PDFName.',
    );
    expect(gs.of('FooBar')).toBeInstanceOf(gs);
    expect(gs.of('FooBar')).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the gs instance as a string`, () => {
      const instance = gs.of('FooBar');
      expect(instance.toString()).toEqual('/FooBar gs\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = gs.of('FooBar');
      expect(instance.bytesSize()).toEqual(11);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = gs.of('FooBar');
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('/FooBar gs\n'));
    });
  });
});
