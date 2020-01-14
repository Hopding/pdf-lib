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

  describe('can return a normalized PDFRectangle', () => {
    it('when it is already normalized', () => {
      expect(rectangle).toEqual(rectangle.getNormalized());
    });

    it.only('when it is not normalized', () => {
      const newArray = PDFArray.withContext(context);
      newArray.push(PDFNumber.of(3));
      newArray.push(PDFNumber.of(4));
      newArray.push(PDFNumber.of(1));
      newArray.push(PDFNumber.of(2));
      const unnormalizedRectangle = PDFRectangle.fromArray(newArray);
      expect(unnormalizedRectangle.getNormalized()).toEqual(rectangle);
    });
  });
});
