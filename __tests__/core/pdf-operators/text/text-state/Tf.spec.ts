// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import Tf from 'core/pdf-operators/text/text-state/Tf';
import { typedArrayFor } from 'utils';

describe(`Tf`, () => {
  it(`requires a String and Number to be constucted`, () => {
    expect(() => new Tf()).toThrowError();
    expect(() => new Tf([])).toThrowError(
      'Tf operator arg "font" must be a string or PDFName.',
    );
    expect(() => new Tf('Foo')).toThrowError(
      'Tf operator arg "size" must be a number.',
    );
    expect(new Tf('Foo', 21)).toBeInstanceOf(Tf);
    expect(new Tf('Foo', 21)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => Tf.of()).toThrowError();
    expect(() => Tf.of([])).toThrowError(
      'Tf operator arg "font" must be a string or PDFName.',
    );
    expect(() => Tf.of('Foo')).toThrowError(
      'Tf operator arg "size" must be a number.',
    );
    expect(Tf.of('Foo', 21)).toBeInstanceOf(Tf);
    expect(Tf.of('Foo', 21)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the Tf instance as a string`, () => {
      const instance = Tf.of('Foo', 21);
      expect(instance.toString()).toEqual('/Foo 21 Tf\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = Tf.of('Foo', 21);
      expect(instance.bytesSize()).toEqual(11);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = Tf.of('Foo', 21);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('/Foo 21 Tf\n'));
    });
  });
});
