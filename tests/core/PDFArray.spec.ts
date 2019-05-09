import {
  PDFArray,
  PDFBool,
  PDFContext,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFString,
} from 'src/core';
import { toCharCode, typedArrayFor } from 'src/utils';

describe(`PDFArray`, () => {
  const context = new PDFContext();

  it(`can be constructed with PDFArray.withContext(...)`, () => {
    expect(PDFArray.withContext(context)).toBeInstanceOf(PDFArray);
  });

  const pdfArray = PDFArray.withContext(context);

  const pdfBool = PDFBool.True;
  const pdfHexString = PDFHexString.of('ABC123');
  const pdfName = PDFName.of('Foo#Bar!');
  const pdfNull = PDFNull;
  const pdfNumber = PDFNumber.of(-24.179);
  const pdfString = PDFString.of('foobar');

  const pdfSubArray = PDFArray.withContext(context);
  pdfSubArray.push(PDFBool.True);

  pdfArray.push(pdfBool);
  pdfArray.push(pdfHexString);
  pdfArray.push(pdfName);
  pdfArray.push(pdfNull);
  pdfArray.push(pdfNumber);
  pdfArray.push(pdfString);
  pdfArray.push(pdfSubArray);

  it(`retains pushed objects`, () => {
    expect(pdfArray.size()).toBe(7);

    expect(pdfArray.get(0)).toBe(pdfBool);
    expect(pdfArray.get(1)).toBe(pdfHexString);
    expect(pdfArray.get(2)).toBe(pdfName);
    expect(pdfArray.get(3)).toBe(pdfNull);
    expect(pdfArray.get(4)).toBe(pdfNumber);
    expect(pdfArray.get(5)).toBe(pdfString);
    expect(pdfArray.get(6)).toBe(pdfSubArray);
  });

  it(`can be cloned`, () => {
    const original = pdfArray;
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.toString()).toBe(original.toString());
  });

  it(`can be converted to a string`, () => {
    expect(String(pdfArray)).toBe(
      '[ true <ABC123> /Foo#23Bar! null -24.179 (foobar) [ true ] ]',
    );
  });

  it(`can provide its size in bytes`, () => {
    expect(pdfArray.sizeInBytes()).toBe(60);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(64).fill(toCharCode(' '));
    pdfArray.copyBytesInto(buffer, 3);

    expect(buffer).toEqual(
      typedArrayFor(
        '   [ true <ABC123> /Foo#23Bar! null -24.179 (foobar) [ true ] ] ',
      ),
    );
  });
});
