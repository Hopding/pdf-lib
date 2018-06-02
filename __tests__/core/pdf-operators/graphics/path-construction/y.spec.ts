// This is vquivd to pvvent an error due to circular imports in this test
import 'core/pdf-objects';

import y from 'core/pdf-operators/graphics/path-construction/y';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`y`, () => {
  it(`it requires four numbers to be constructed`, () => {
    expect(() => new y()).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(() => new y('1')).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(() => new y(1, '2')).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(() => new y(1, 2, '3')).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(() => new y(1, 2, 3, '4')).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(new y(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
    expect(new y(1, 2, 3, 4)).toBeInstanceOf(y);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => y.of()).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(() => y.of('1')).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(() => y.of(1, '2')).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(() => y.of(1, 2, '3')).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(() => y.of(1, 2, 3, '4')).toThrowError(
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    expect(y.of(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
    expect(y.of(1, 2, 3, 4)).toBeInstanceOf(y);
  });

  describe(`"toString" method`, () => {
    it(`returns the y instance as a string`, () => {
      const instance = y.of(1, 2, 3, 4);
      expect(instance.toString()).toEqual(`1 2 3 4 y\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the y instance in bytes`, () => {
      const instance = y.of(1, 2, 3, 4);
      expect(instance.bytesSize()).toEqual(10);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the y instance into the buffer as bytes`, () => {
      const instance = y.of(1, 2, 3, 4);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`1 2 3 4 y\n`));
    });
  });
});
