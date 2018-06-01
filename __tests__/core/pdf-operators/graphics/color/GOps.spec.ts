// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import * as GOps from 'core/pdf-operators/graphics/color/GOps';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`GOps.G`, () => {
  it(`requires a Number between 0.0 and 1.0 to be constucted`, () => {
    expect(() => new GOps.G()).toThrowError();
    expect(() => new GOps.G([])).toThrowError(
      'G operator arg "gray" must be a number between 0.0 and 1.0.',
    );
    expect(() => new GOps.G(-0.1)).toThrowError(
      'G operator arg "gray" must be a number between 0.0 and 1.0.',
    );
    expect(() => new GOps.G(1.1)).toThrowError(
      'G operator arg "gray" must be a number between 0.0 and 1.0.',
    );
    expect(new GOps.G(1.0)).toBeInstanceOf(GOps.G);
    expect(new GOps.G(0.5)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => GOps.G.of()).toThrowError();
    expect(() => GOps.G.of([])).toThrowError(
      'G operator arg "gray" must be a number between 0.0 and 1.0.',
    );
    expect(GOps.G.of(0.5)).toBeInstanceOf(GOps.G);
    expect(GOps.G.of(0.5)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the GOps.G instance as a string`, () => {
      const instance = GOps.G.of(0.5);
      expect(instance.toString()).toEqual('0.5 G\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = GOps.G.of(0.5);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = GOps.G.of(0.5);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('0.5 G\n'));
    });
  });
});

describe(`GOps.g`, () => {
  it(`requires a Number to be constucted`, () => {
    expect(() => new GOps.g()).toThrowError();
    expect(() => new GOps.g([])).toThrowError(
      'g operator arg "gray" must be a number between 0.0 and 1.0.',
    );
    expect(() => new GOps.g(-0.1)).toThrowError(
      'g operator arg "gray" must be a number between 0.0 and 1.0.',
    );
    expect(() => new GOps.g(1.1)).toThrowError(
      'g operator arg "gray" must be a number between 0.0 and 1.0.',
    );

    expect(new GOps.g(1.0)).toBeInstanceOf(GOps.g);
    expect(new GOps.g(0.5)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => GOps.g.of()).toThrowError();
    expect(() => GOps.g.of([])).toThrowError(
      'g operator arg "gray" must be a number between 0.0 and 1.0.',
    );
    expect(GOps.g.of(0.5)).toBeInstanceOf(GOps.g);
    expect(GOps.g.of(0.5)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the GOps.g instance as a string`, () => {
      const instance = GOps.g.of(0.5);
      expect(instance.toString()).toEqual('0.5 g\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = GOps.g.of(0.5);
      expect(instance.bytesSize()).toEqual(6);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = GOps.g.of(0.5);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('0.5 g\n'));
    });
  });
});
