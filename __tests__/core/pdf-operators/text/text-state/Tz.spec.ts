// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import Tz from 'core/pdf-operators/text/text-state/Tz';
import { typedArrayFor } from 'utils';

describe(`Tz`, () => {
  it(`requires a Number to be constucted`, () => {
    expect(() => new Tz()).toThrowError();
    expect(() => new Tz([])).toThrowError(
      'Tz operator arg "scale" must be a number.',
    );
    expect(new Tz(21)).toBeInstanceOf(Tz);
    expect(new Tz(21)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => Tz.of()).toThrowError();
    expect(() => Tz.of([])).toThrowError(
      'Tz operator arg "scale" must be a number.',
    );
    expect(Tz.of(21)).toBeInstanceOf(Tz);
    expect(Tz.of(21)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the Tz instance as a string`, () => {
      const instance = Tz.of(21);
      expect(instance.toString()).toEqual('21 Tz\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = Tz.of(21);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = Tz.of(21);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('21 Tz\n'));
    });
  });
});
