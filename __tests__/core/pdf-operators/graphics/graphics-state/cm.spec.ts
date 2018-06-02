// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import cm from 'core/pdf-operators/graphics/graphics-state/cm';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`cm`, () => {
  it(`it requires six numbers to be constructed`, () => {
    expect(() => new cm()).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(() => new cm(1, 2)).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(() => new cm(1, 2, 3)).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(() => new cm(1, 2, 3, 4)).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(() => new cm(1, 2, 3, 4, 5)).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(new cm(1, 2, 3, 4, 5, 6)).toBeInstanceOf(PDFOperator);
    expect(new cm(1, 2, 3, 4, 5, 6)).toBeInstanceOf(cm);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => cm.of()).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(() => cm.of(1, 2)).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(() => cm.of(1, 2, 3)).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(() => cm.of(1, 2, 3, 4)).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(() => cm.of(1, 2, 3, 4, 5)).toThrowError(
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    expect(cm.of(1, 2, 3, 4, 5, 6)).toBeInstanceOf(PDFOperator);
    expect(cm.of(1, 2, 3, 4, 5, 6)).toBeInstanceOf(cm);
  });

  describe(`"toString" method`, () => {
    it(`returns the cm instance as a string`, () => {
      const instance = cm.of(1, 2, 3, 4, 5, 6);
      expect(instance.toString()).toEqual(`1 2 3 4 5 6 cm\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the cm instance in bytes`, () => {
      const instance = cm.of(1, 2, 3, 4, 5, 6);
      expect(instance.bytesSize()).toEqual(15);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the cm instance into the buffer as bytes`, () => {
      const instance = cm.of(1, 2, 3, 4, 5, 6);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`1 2 3 4 5 6 cm\n`));
    });
  });
});
