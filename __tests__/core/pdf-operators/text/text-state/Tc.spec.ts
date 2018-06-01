// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import Tc from 'core/pdf-operators/text/text-state/Tc';
import { typedArrayFor } from 'utils';

describe(`Tc`, () => {
  it(`requires a Number to be constucted`, () => {
    expect(() => new Tc()).toThrowError();
    expect(() => new Tc([])).toThrowError(
      'Tc operator arg "charSpace" must be a number.',
    );
    expect(new Tc(21)).toBeInstanceOf(Tc);
    expect(new Tc(21)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => Tc.of()).toThrowError();
    expect(() => Tc.of([])).toThrowError(
      'Tc operator arg "charSpace" must be a number.',
    );
    expect(Tc.of(21)).toBeInstanceOf(Tc);
    expect(Tc.of(21)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the Tc instance as a string`, () => {
      const instance = Tc.of(21);
      expect(instance.toString()).toEqual('21 Tc\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = Tc.of(21);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = Tc.of(21);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('21 Tc\n'));
    });
  });
});
