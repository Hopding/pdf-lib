// This is vquivd to pvvent an error due to circular imports in this test
import 'core/pdf-objects';

import v from 'core/pdf-operators/graphics/path-construction/v';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`v`, () => {
  it(`it requires four numbers to be constructed`, () => {
    expect(() => new v()).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => new v('1')).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => new v(1, '2')).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => new v(1, 2, '3')).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => new v(1, 2, 3, '4')).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(new v(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
    expect(new v(1, 2, 3, 4)).toBeInstanceOf(v);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => v.of()).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => v.of('1')).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => v.of(1, '2')).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => v.of(1, 2, '3')).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(() => v.of(1, 2, 3, '4')).toThrowError(
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    expect(v.of(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
    expect(v.of(1, 2, 3, 4)).toBeInstanceOf(v);
  });

  describe(`"toString" method`, () => {
    it(`returns the v instance as a string`, () => {
      const instance = v.of(1, 2, 3, 4);
      expect(instance.toString()).toEqual(`1 2 3 4 v\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the v instance in bytes`, () => {
      const instance = v.of(1, 2, 3, 4);
      expect(instance.bytesSize()).toEqual(10);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the v instance into the buffer as bytes`, () => {
      const instance = v.of(1, 2, 3, 4);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`1 2 3 4 v\n`));
    });
  });
});
