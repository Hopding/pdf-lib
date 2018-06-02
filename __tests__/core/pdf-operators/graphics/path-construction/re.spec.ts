// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import re from 'core/pdf-operators/graphics/path-construction/re';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`re`, () => {
  it(`it requires four numbers to be constructed`, () => {
    expect(() => new re()).toThrowError(
      're operator arg "x" must be a number.',
    );
    expect(() => new re('1')).toThrowError(
      're operator arg "x" must be a number.',
    );
    expect(() => new re(1, '2')).toThrowError(
      're operator arg "y" must be a number.',
    );
    expect(() => new re(1, 2, '3')).toThrowError(
      're operator arg "width" must be a number.',
    );
    expect(() => new re(1, 2, 3, '4')).toThrowError(
      're operator arg "height" must be a number.',
    );
    expect(new re(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
    expect(new re(1, 2, 3, 4)).toBeInstanceOf(re);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => re.of()).toThrowError('re operator arg "x" must be a number.');
    expect(() => re.of('1')).toThrowError(
      're operator arg "x" must be a number.',
    );
    expect(() => re.of(1, '2')).toThrowError(
      're operator arg "y" must be a number.',
    );
    expect(() => re.of(1, 2, '3')).toThrowError(
      're operator arg "width" must be a number.',
    );
    expect(() => re.of(1, 2, 3, '4')).toThrowError(
      're operator arg "height" must be a number.',
    );
    expect(re.of(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
    expect(re.of(1, 2, 3, 4)).toBeInstanceOf(re);
  });

  describe(`"toString" method`, () => {
    it(`returns the re instance as a string`, () => {
      const instance = re.of(1, 2, 3, 4);
      expect(instance.toString()).toEqual(`1 2 3 4 re\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the re instance in bytes`, () => {
      const instance = re.of(1, 2, 3, 4);
      expect(instance.bytesSize()).toEqual(11);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the re instance into the buffer as bytes`, () => {
      const instance = re.of(1, 2, 3, 4);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`1 2 3 4 re\n`));
    });
  });
});
