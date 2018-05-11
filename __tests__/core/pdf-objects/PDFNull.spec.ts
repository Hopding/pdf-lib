import { PDFNull } from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFNull`, () => {
  it(`prevents its constructor from being called`, () => {
    expect(() => new PDFNull()).toThrowError();
  });

  it(`has a static "instance" member`, () => {
    expect(PDFNull.instance).toBeInstanceOf(PDFNull);
  });

  describe(`"toString" method`, () => {
    it(`returns PDFNull as a string`, () => {
      expect(PDFNull.instance.toString()).toEqual('null');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of PDFNull in bytes`, () => {
      expect(PDFNull.instance.bytesSize()).toEqual(4);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies PDFNull into the buffer as bytes`, () => {
      const buffer = new Uint8Array(PDFNull.instance.bytesSize());
      PDFNull.instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('null'));
    });
  });
});
