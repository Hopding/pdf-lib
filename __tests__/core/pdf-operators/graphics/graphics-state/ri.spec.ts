// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import ri from 'core/pdf-operators/graphics/graphics-state/ri';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`ri`, () => {
  it(`requires one of "/AbsoluteColorimetric", "/RelativeColorimetric", "/Saturation", or "/Perceptual" to be constucted`, () => {
    expect(() => new ri()).toThrowError();
    expect(() => new ri(-1)).toThrowError(
      `ri operator arg "intent" must be one of: "AbsoluteColorimetric", "RelativeColorimetric", "Saturation", "Perceptual"`,
    );
    expect(() => new ri('Foo')).toThrowError(
      `ri operator arg "intent" must be one of: "AbsoluteColorimetric", "RelativeColorimetric", "Saturation", "Perceptual"`,
    );
    expect(new ri('/AbsoluteColorimetric')).toBeInstanceOf(ri);
    expect(new ri('/RelativeColorimetric')).toBeInstanceOf(ri);
    expect(new ri('/Saturation')).toBeInstanceOf(ri);
    expect(new ri('/Perceptual')).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => ri.of()).toThrowError();
    expect(() => ri.of(-1)).toThrowError(
      `ri operator arg "intent" must be one of: "AbsoluteColorimetric", "RelativeColorimetric", "Saturation", "Perceptual"`,
    );
    expect(() => ri.of('Foo')).toThrowError(
      `ri operator arg "intent" must be one of: "AbsoluteColorimetric", "RelativeColorimetric", "Saturation", "Perceptual"`,
    );
    expect(ri.of('/AbsoluteColorimetric')).toBeInstanceOf(ri);
    expect(ri.of('/RelativeColorimetric')).toBeInstanceOf(ri);
    expect(ri.of('/Saturation')).toBeInstanceOf(ri);
    expect(ri.of('/Perceptual')).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the ri instance as a string`, () => {
      const instance = ri.of('/AbsoluteColorimetric');
      expect(instance.toString()).toEqual('/AbsoluteColorimetric ri\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the ri instance in bytes`, () => {
      const instance = ri.of('/RelativeColorimetric');
      expect(instance.bytesSize()).toEqual(25);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the ri instance into the buffer as bytes`, () => {
      const instance = ri.of('/Saturation');
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('/Saturation ri\n'));
    });
  });
});
