// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import i from 'core/pdf-operators/graphics/graphics-state/i';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`i`, () => {
  it(`requires a Number between 0 and 100 to be constucted`, () => {
    expect(() => new i()).toThrowError();
    expect(() => new i(-0.1)).toThrowError(
      'i operator arg "flatness" must be a number from 0 to 100.',
    );
    expect(() => new i(100.1)).toThrowError(
      'i operator arg "flatness" must be a number from 0 to 100.',
    );
    expect(new i(0)).toBeInstanceOf(i);
    expect(new i(100)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => i.of()).toThrowError();
    expect(() => i.of(-0.1)).toThrowError(
      'i operator arg "flatness" must be a number from 0 to 100.',
    );
    expect(() => i.of(100.1)).toThrowError(
      'i operator arg "flatness" must be a number from 0 to 100.',
    );
    expect(i.of(0)).toBeInstanceOf(i);
    expect(i.of(100)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the i instance as a string`, () => {
      const instance = i.of(50);
      expect(instance.toString()).toEqual('50 i\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = i.of(0);
      expect(instance.bytesSize()).toEqual(4);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = i.of(100);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('100 i\n'));
    });
  });
});
