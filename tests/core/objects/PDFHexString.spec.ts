import { PDFHexString } from 'src/core';
import { toCharCode, typedArrayFor } from 'src/utils';

describe(`PDFHexString`, () => {
  it(`can be constructed from PDFHexString.of(...)`, () => {
    expect(PDFHexString.of('4E6F762073686D6F7A2')).toBeInstanceOf(PDFHexString);
    expect(PDFHexString.of('901FA3')).toBeInstanceOf(PDFHexString);
    expect(PDFHexString.of('901FA')).toBeInstanceOf(PDFHexString);
  });

  it(`can be cloned`, () => {
    const original = PDFHexString.of('901FA');
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.toString()).toBe(original.toString());
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFHexString.of('4E6F762073686D6F7A2'))).toBe(
      '<4E6F762073686D6F7A2>',
    );
    expect(String(PDFHexString.of('901FA3'))).toBe('<901FA3>');
    expect(String(PDFHexString.of('901FA'))).toBe('<901FA>');
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFHexString.of('4E6F762073686D6F7A2').sizeInBytes()).toBe(21);
    expect(PDFHexString.of('901FA3').sizeInBytes()).toBe(8);
    expect(PDFHexString.of('901FA').sizeInBytes()).toBe(7);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(11).fill(toCharCode(' '));
    expect(PDFHexString.of('901FA').copyBytesInto(buffer, 3)).toBe(7);
    expect(buffer).toEqual(typedArrayFor('   <901FA> '));
  });
});
