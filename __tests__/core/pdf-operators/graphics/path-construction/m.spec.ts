// This is required to prevent an error due to circumar imports in this test
import 'core/pdf-objects';

import m from 'core/pdf-operators/graphics/path-construction/m';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`m`, () => {
  it(`it requires two numbers to be constructed`, () => {
    expect(() => new m()).toThrowError('m operator arg "x" must be a number.');
    expect(() => new m('1')).toThrowError(
      'm operator arg "x" must be a number.',
    );
    expect(() => new m(1, '2')).toThrowError(
      'm operator arg "y" must be a number.',
    );
    expect(new m(1, 2)).toBeInstanceOf(PDFOperator);
    expect(new m(1, 2)).toBeInstanceOf(m);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => m.of()).toThrowError('m operator arg "x" must be a number.');
    expect(() => m.of('1')).toThrowError(
      'm operator arg "x" must be a number.',
    );
    expect(() => m.of(1, '2')).toThrowError(
      'm operator arg "y" must be a number.',
    );
    expect(m.of(1, 2)).toBeInstanceOf(PDFOperator);
    expect(m.of(1, 2)).toBeInstanceOf(m);
  });

  describe(`"toString" method`, () => {
    it(`returns the m instance as a string`, () => {
      const instance = m.of(1, 2);
      expect(instance.toString()).toEqual(`1 2 m\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the m instance in bytes`, () => {
      const instance = m.of(1, 2);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the m instance into the buffer as bytes`, () => {
      const instance = m.of(1, 2);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`1 2 m\n`));
    });
  });
});
