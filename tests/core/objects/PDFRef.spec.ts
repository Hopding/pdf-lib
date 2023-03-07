import { PDFRef, PrivateConstructorError } from '../../../src/core';
import { toCharCode, typedArrayFor } from '../../../src/utils';

describe(`PDFRef`, () => {
  it(`can be constructed from PDFRef.of(...)`, () => {
    expect(PDFRef.of(0)).toBeInstanceOf(PDFRef);
    expect(PDFRef.of(0, 21)).toBeInstanceOf(PDFRef);
    expect(PDFRef.of(94, 0)).toBeInstanceOf(PDFRef);
    expect(PDFRef.of(4678, 9120)).toBeInstanceOf(PDFRef);
  });

  it(`cannot be publicly constructed`, () => {
    expect(() => new (PDFRef as any)({}, 'stuff')).toThrow(
      new PrivateConstructorError(PDFRef.name),
    );
  });

  it(`returns the same instance when given the same object and generation numbers`, () => {
    expect(PDFRef.of(0)).toBe(PDFRef.of(0));
    expect(PDFRef.of(0, 21)).toBe(PDFRef.of(0, 21));
    expect(PDFRef.of(94, 0)).toBe(PDFRef.of(94, 0));
    expect(PDFRef.of(4678, 9120)).toBe(PDFRef.of(4678, 9120));
  });

  it(`can be cloned`, () => {
    expect(PDFRef.of(4678, 9120).clone()).toBe(PDFRef.of(4678, 9120));
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFRef.of(0))).toBe(`0 0 R`);
    expect(String(PDFRef.of(0, 21))).toBe(`0 21 R`);
    expect(String(PDFRef.of(94, 0))).toBe(`94 0 R`);
    expect(String(PDFRef.of(4678, 9120))).toBe(`4678 9120 R`);
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFRef.of(0).sizeInBytes()).toBe(5);
    expect(PDFRef.of(0, 21).sizeInBytes()).toBe(6);
    expect(PDFRef.of(94, 0).sizeInBytes()).toBe(6);
    expect(PDFRef.of(4678, 9120).sizeInBytes()).toBe(11);
  });

  it(`can be serialized`, () => {
    const buffer1 = new Uint8Array(9).fill(toCharCode(' '));
    expect(PDFRef.of(0).copyBytesInto(buffer1, 3)).toBe(5);
    expect(buffer1).toEqual(typedArrayFor('   0 0 R '));

    const buffer2 = new Uint8Array(9).fill(toCharCode(' '));
    expect(PDFRef.of(0, 21).copyBytesInto(buffer2, 1)).toBe(6);
    expect(buffer2).toEqual(typedArrayFor(' 0 21 R  '));

    const buffer3 = new Uint8Array(9).fill(toCharCode(' '));
    expect(PDFRef.of(94, 0).copyBytesInto(buffer3, 2)).toBe(6);
    expect(buffer3).toEqual(typedArrayFor('  94 0 R '));

    const buffer4 = new Uint8Array(13).fill(toCharCode(' '));
    expect(PDFRef.of(4678, 9120).copyBytesInto(buffer4, 0)).toBe(11);
    expect(buffer4).toEqual(typedArrayFor('4678 9120 R  '));
  });
});
