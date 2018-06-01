// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import Tr from 'core/pdf-operators/text/text-state/Tr';
import { typedArrayFor } from 'utils';

describe(`Tr`, () => {
  it(`requires a Number to be constucted`, () => {
    expect(() => new Tr()).toThrowError();
    expect(() => new Tr([])).toThrowError(
      'Tr operator arg "render" must be a number.',
    );
    expect(new Tr(21)).toBeInstanceOf(Tr);
    expect(new Tr(21)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => Tr.of()).toThrowError();
    expect(() => Tr.of([])).toThrowError(
      'Tr operator arg "render" must be a number.',
    );
    expect(Tr.of(21)).toBeInstanceOf(Tr);
    expect(Tr.of(21)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the Tr instance as a string`, () => {
      const instance = Tr.of(21);
      expect(instance.toString()).toEqual('21 Tr\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = Tr.of(21);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = Tr.of(21);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('21 Tr\n'));
    });
  });
});
