// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import Tw from 'core/pdf-operators/text/text-state/Tw';
import { typedArrayFor } from 'utils';

describe(`Tw`, () => {
  it(`requires a Number to be constucted`, () => {
    expect(() => new Tw()).toThrowError();
    expect(() => new Tw([])).toThrowError(
      'Tw operator arg "wordSpace" must be a number.',
    );
    expect(new Tw(21)).toBeInstanceOf(Tw);
    expect(new Tw(21)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => Tw.of()).toThrowError();
    expect(() => Tw.of([])).toThrowError(
      'Tw operator arg "wordSpace" must be a number.',
    );
    expect(Tw.of(21)).toBeInstanceOf(Tw);
    expect(Tw.of(21)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the Tw instance as a string`, () => {
      const instance = Tw.of(21);
      expect(instance.toString()).toEqual('21 Tw\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = Tw.of(21);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = Tw.of(21);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('21 Tw\n'));
    });
  });
});
