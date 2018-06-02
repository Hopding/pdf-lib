// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import w from 'core/pdf-operators/graphics/graphics-state/w';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`w`, () => {
  it(`requires a Number to be constucted`, () => {
    expect(() => new w()).toThrowError();
    expect(() => new w('Foo')).toThrowError(
      'w operator arg "lineWidth" must be a number.',
    );
    expect(new w(0)).toBeInstanceOf(w);
    expect(new w(100)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => w.of()).toThrowError();
    expect(() => w.of('Foo')).toThrowError(
      'w operator arg "lineWidth" must be a number.',
    );
    expect(w.of(0)).toBeInstanceOf(w);
    expect(w.of(100)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the w instance as a string`, () => {
      const instance = w.of(0);
      expect(instance.toString()).toEqual('0 w\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the w instance in bytes`, () => {
      const instance = w.of(21);
      expect(instance.bytesSize()).toEqual(5);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the w instance into the buffer as bytes`, () => {
      const instance = w.of(9999);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('9999 w\n'));
    });
  });
});
