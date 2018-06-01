// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import Ts from 'core/pdf-operators/text/text-state/Ts';
import { typedArrayFor } from 'utils';

describe(`Ts`, () => {
  it(`requires a Number to be constucted`, () => {
    expect(() => new Ts()).toThrowError();
    expect(() => new Ts([])).toThrowError(
      'Ts operator arg "rise" must be a number.',
    );
    expect(new Ts(21)).toBeInstanceOf(Ts);
    expect(new Ts(21)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => Ts.of()).toThrowError();
    expect(() => Ts.of([])).toThrowError(
      'Ts operator arg "rise" must be a number.',
    );
    expect(Ts.of(21)).toBeInstanceOf(Ts);
    expect(Ts.of(21)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the Ts instance as a string`, () => {
      const instance = Ts.of(21);
      expect(instance.toString()).toEqual('21 Ts\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = Ts.of(21);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = Ts.of(21);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('21 Ts\n'));
    });
  });
});
