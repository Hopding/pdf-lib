import { PDFArray, PDFContext, PDFNumber, PDFRectangle } from 'src/core';

describe(`PDFRectangle`, () => {
  const context = PDFContext.create();
  let array: PDFArray;
  let rectangle: PDFRectangle;

  beforeEach(() => {
    array = PDFArray.withContext(context);
    array.push(PDFNumber.of(1));
    array.push(PDFNumber.of(2));
    array.push(PDFNumber.of(3));
    array.push(PDFNumber.of(4));
    rectangle = PDFRectangle.fromArray(array);
  });

  it('can return the lower left X coordinate', () => {
    expect(rectangle.lowerLeftX()).toEqual(1);
  });

  it('can return the lower left Y coordinate', () => {
    expect(rectangle.lowerLeftY()).toEqual(2);
  });

  it('can return the upper right X coordinate', () => {
    expect(rectangle.upperRightX()).toEqual(3);
  });

  it('can return the upper right Y coordinate', () => {
    expect(rectangle.upperRightY()).toEqual(4);
  });

  it('can set the rectangle dimensions', () => {
    rectangle.setRectangle(0, 0, 1, 1);
    expect(rectangle.lowerLeftX()).toEqual(0);
    expect(rectangle.lowerLeftY()).toEqual(0);
    expect(rectangle.upperRightX()).toEqual(1);
    expect(rectangle.upperRightY()).toEqual(1);
  });
});
