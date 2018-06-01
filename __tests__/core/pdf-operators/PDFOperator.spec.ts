// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`PDFOperator`, () => {
  describe(`createSingletonOp`, () => {
    it(`returns a Singleton class that extends PDFOperator`, () => {
      const Singleton = PDFOperator.createSingletonOp('Foo');
      expect(() => new Singleton()).toThrowError(
        `Cannot instantiate PDFOperator.Foo - use "Foo.operator" instead`,
      );
      expect(Singleton.operator).toBeInstanceOf(PDFOperator);
      expect(Singleton.operator).toBe(Singleton.operator);
    });

    describe(`"toString" method`, () => {
      it(`returns the Singleton as a string`, () => {
        const Singleton = PDFOperator.createSingletonOp('Bar');
        expect(Singleton.operator.toString()).toEqual('Bar\n');
      });
    });

    describe(`"bytesSize" method`, () => {
      it(`returns the size of the Singleton in bytes`, () => {
        const Singleton = PDFOperator.createSingletonOp('Bar');
        expect(Singleton.operator.bytesSize()).toEqual(4);
      });
    });

    describe(`"copyBytesInto" method`, () => {
      it(`copies the Singleton into the buffer as bytes`, () => {
        const Singleton = PDFOperator.createSingletonOp('Q');
        const buffer = new Uint8Array(Singleton.operator.bytesSize());
        Singleton.operator.copyBytesInto(buffer);
        expect(buffer).toEqual(typedArrayFor('Q\n'));
      });
    });
  });

  describe(`"toString" method`, () => {
    it(`throws an error`, () => {
      const operator = new PDFOperator();
      expect(() => operator.toString()).toThrowError(
        'toString() is not implemented on PDFOperator',
      );
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`throws an error`, () => {
      const operator = new PDFOperator();
      expect(() => operator.bytesSize()).toThrowError(
        'bytesSize() is not implemented on PDFOperator',
      );
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`throws an error`, () => {
      const operator = new PDFOperator();
      expect(() => operator.copyBytesInto()).toThrowError(
        'copyBytesInto() is not implemented on PDFOperator',
      );
    });
  });
});
