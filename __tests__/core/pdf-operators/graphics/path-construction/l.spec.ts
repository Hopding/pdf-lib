// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import l from 'core/pdf-operators/graphics/path-construction/l';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`l`, () => {
  it(`it requires two numbers to be constructed`, () => {
    expect(() => new l()).toThrowError('l operator arg "x" must be a number.');
    expect(() => new l('1')).toThrowError(
      'l operator arg "x" must be a number.',
    );
    expect(() => new l(1, '2')).toThrowError(
      'l operator arg "y" must be a number.',
    );
    expect(new l(1, 2)).toBeInstanceOf(PDFOperator);
    expect(new l(1, 2)).toBeInstanceOf(l);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => l.of()).toThrowError('l operator arg "x" must be a number.');
    expect(() => l.of('1')).toThrowError(
      'l operator arg "x" must be a number.',
    );
    expect(() => l.of(1, '2')).toThrowError(
      'l operator arg "y" must be a number.',
    );
    expect(l.of(1, 2)).toBeInstanceOf(PDFOperator);
    expect(l.of(1, 2)).toBeInstanceOf(l);
  });

  describe(`"toString" method`, () => {
    it(`returns the l instance as a string`, () => {
      const instance = l.of(1, 2);
      expect(instance.toString()).toEqual(`1 2 l\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the l instance in bytes`, () => {
      const instance = l.of(1, 2);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the l instance into the buffer as bytes`, () => {
      const instance = l.of(1, 2);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`1 2 l\n`));
    });
  });
});
