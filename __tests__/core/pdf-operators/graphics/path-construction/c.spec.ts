// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import c from 'core/pdf-operators/graphics/path-construction/c';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`c`, () => {
  it(`it requires six numbers to be constructed`, () => {
    expect(() => new c()).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => new c(1, 2)).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => new c(1, 2, 3)).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => new c(1, 2, 3, 4)).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => new c(1, 2, 3, 4, 5)).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(new c(1, 2, 3, 4, 5, 6)).toBeInstanceOf(PDFOperator);
    expect(new c(1, 2, 3, 4, 5, 6)).toBeInstanceOf(c);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => c.of()).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => c.of(1, 2)).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => c.of(1, 2, 3)).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => c.of(1, 2, 3, 4)).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => c.of(1, 2, 3, 4, 5)).toThrowError(
      'c operator args "x1 y1 x2 y2 x3 y3" must all be numbers.',
    );
    expect(c.of(1, 2, 3, 4, 5, 6)).toBeInstanceOf(PDFOperator);
    expect(c.of(1, 2, 3, 4, 5, 6)).toBeInstanceOf(c);
  });

  describe(`"toString" method`, () => {
    it(`returns the c instance as a string`, () => {
      const instance = c.of(1, 2, 3, 4, 5, 6);
      expect(instance.toString()).toEqual(`1 2 3 4 5 6 c\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the c instance in bytes`, () => {
      const instance = c.of(1, 2, 3, 4, 5, 6);
      expect(instance.bytesSize()).toEqual(14);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the c instance into the buffer as bytes`, () => {
      const instance = c.of(1, 2, 3, 4, 5, 6);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`1 2 3 4 5 6 c\n`));
    });
  });
});
