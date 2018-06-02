// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import M from 'core/pdf-operators/graphics/graphics-state/M';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`M`, () => {
  it(`requires a String to be constucted`, () => {
    expect(() => new M()).toThrowError();
    expect(() => new M([])).toThrowError(
      'M operator arg "miterLimit" must be a number.',
    );
    expect(new M(0)).toBeInstanceOf(M);
    expect(new M(270)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => M.of()).toThrowError();
    expect(() => M.of([])).toThrowError(
      'M operator arg "miterLimit" must be a number.',
    );
    expect(M.of(0)).toBeInstanceOf(M);
    expect(M.of(270)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the M instance as a string`, () => {
      const instance = M.of(0);
      expect(instance.toString()).toEqual('0 M\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = M.of(90);
      expect(instance.bytesSize()).toEqual(5);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = M.of(180);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('180 M\n'));
    });
  });
});
