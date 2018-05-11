import { PDFNull } from 'core/pdf-objects';
import { typedArrayFor } from 'utils';

describe(`PDFNull`, () => {
  it(`prevents its constructor from being called`, () => {
    expect(() => new PDFNull()).toThrowError();
  });

  it(`has a static "instance" member`, () => {
    expect(PDFNull.instance).toBeInstanceOf(PDFNull);
  });

  it(`can be turned into a string`, () => {
    expect(PDFNull.instance.toString()).toEqual('null');
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFNull.instance.bytesSize()).toEqual(4);
  });

  it(`can copy itself into a buffer as bytes`, () => {
    const buffer = new Uint8Array(PDFNull.instance.bytesSize());
    PDFNull.instance.copyBytesInto(buffer);
    expect(buffer).toEqual(typedArrayFor('null'));
  });
});
