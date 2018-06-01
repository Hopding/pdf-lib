// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import Tm from 'core/pdf-operators/text/text-positioning/Tm';
import { typedArrayFor } from 'utils';

describe(`Tm`, () => {
  it(`it requires six numbers to be constructed`, () => {
    expect(() => new Tm()).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(() => new Tm(1, 2)).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(() => new Tm(1, 2, 3)).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(() => new Tm(1, 2, 3, 4)).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(() => new Tm(1, 2, 3, 4, 5)).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(new Tm(1, 2, 3, 4, 5, 6)).toBeInstanceOf(PDFOperator);
    expect(new Tm(1, 2, 3, 4, 5, 6)).toBeInstanceOf(Tm);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => Tm.of()).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(() => Tm.of(1, 2)).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(() => Tm.of(1, 2, 3)).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(() => Tm.of(1, 2, 3, 4)).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(() => Tm.of(1, 2, 3, 4, 5)).toThrowError(
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    expect(Tm.of(1, 2, 3, 4, 5, 6)).toBeInstanceOf(PDFOperator);
    expect(Tm.of(1, 2, 3, 4, 5, 6)).toBeInstanceOf(Tm);
  });

  describe(`"toString" method`, () => {
    it(`returns the Tm instance as a string`, () => {
      const instance = Tm.of(1, 2, 3, 4, 5, 6);
      expect(instance.toString()).toEqual(`1 2 3 4 5 6 Tm\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the TDOps.Td instance in bytes`, () => {
      const instance = Tm.of(1, 2, 3, 4, 5, 6);
      expect(instance.bytesSize()).toEqual(15);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the TDOps.Td instance into the buffer as bytes`, () => {
      const instance = Tm.of(1, 2, 3, 4, 5, 6);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`1 2 3 4 5 6 Tm\n`));
    });
  });
});
