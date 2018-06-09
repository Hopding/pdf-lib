// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import Do from 'core/pdf-operators/Do';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`Do`, () => {
  it(`requires a String to be constucted`, () => {
    expect(() => new Do()).toThrowError();
    expect(() => new Do([])).toThrowError(
      'Do operator arg "name" must be a string or PDFName.',
    );
    expect(new Do('foo')).toBeInstanceOf(Do);
    expect(new Do('foo')).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => Do.of()).toThrowError();
    expect(() => Do.of([])).toThrowError(
      'Do operator arg "name" must be a string or PDFName.',
    );
    expect(Do.of('foo')).toBeInstanceOf(Do);
    expect(Do.of('foo')).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the Do instance as a string`, () => {
      const doInstance = Do.of('FooBar');
      expect(doInstance.toString()).toEqual('/FooBar Do\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const doInstance = Do.of('FooBar');
      expect(doInstance.bytesSize()).toEqual(11);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const doInstance = Do.of('FooBar');
      const buffer = new Uint8Array(doInstance.bytesSize());
      doInstance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('/FooBar Do\n'));
    });
  });
});
