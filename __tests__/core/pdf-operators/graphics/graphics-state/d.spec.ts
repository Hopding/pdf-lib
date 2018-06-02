// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import d from 'core/pdf-operators/graphics/graphics-state/d';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`d`, () => {
  it(`it requires a Number[] and a Number to be constructed`, () => {
    expect(() => new d(['1'])).toThrowError(
      'dashArray[0] must be a number or undefined.',
    );
    expect(() => new d([1, '2'])).toThrowError(
      'dashArray[1] must be a number or undefined.',
    );
    expect(() => new d([1, 2], '3')).toThrowError(
      'd operator arg "dashPhase" must be a number.',
    );
    expect(new d([1, 2], 3)).toBeInstanceOf(PDFOperator);
    expect(new d([], 3)).toBeInstanceOf(d);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => d.of(['1'])).toThrowError(
      'dashArray[0] must be a number or undefined.',
    );
    expect(() => d.of([1, '2'])).toThrowError(
      'dashArray[1] must be a number or undefined.',
    );
    expect(() => d.of([1, 2], '3')).toThrowError(
      'd operator arg "dashPhase" must be a number.',
    );
    expect(d.of([1, 2], 3)).toBeInstanceOf(PDFOperator);
    expect(d.of([], 3)).toBeInstanceOf(d);
  });

  describe(`"toString" method`, () => {
    it(`returns the d instance as a string`, () => {
      const instance1 = d.of([1, 2], 3);
      expect(instance1.toString()).toEqual(`[1 2] 3 d\n`);

      const instance2 = d.of([], 3);
      expect(instance2.toString()).toEqual(`[] 3 d\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the d instance in bytes`, () => {
      const instance = d.of([1, 2], 3);
      expect(instance.bytesSize()).toEqual(10);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the d instance into the buffer as bytes`, () => {
      const instance = d.of([1, 2], 3);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`[1 2] 3 d\n`));
    });
  });
});
