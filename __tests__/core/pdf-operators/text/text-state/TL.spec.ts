// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import TL from 'core/pdf-operators/text/text-state/TL';
import { typedArrayFor } from 'utils';

describe(`TL`, () => {
  it(`requires a Number to be constucted`, () => {
    expect(() => new TL()).toThrowError();
    expect(() => new TL([])).toThrowError(
      'TL operator arg "leading" must be a number.',
    );
    expect(new TL(21)).toBeInstanceOf(TL);
    expect(new TL(21)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => TL.of()).toThrowError();
    expect(() => TL.of([])).toThrowError(
      'TL operator arg "leading" must be a number.',
    );
    expect(TL.of(21)).toBeInstanceOf(TL);
    expect(TL.of(21)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the TL instance as a string`, () => {
      const instance = TL.of(21);
      expect(instance.toString()).toEqual('21 TL\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = TL.of(21);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = TL.of(21);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('21 TL\n'));
    });
  });
});
