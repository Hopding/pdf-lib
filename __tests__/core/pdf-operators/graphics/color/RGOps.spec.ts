// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import * as RGOps from 'core/pdf-operators/graphics/color/RGOps';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`RGOps.RG`, () => {
  it(`requires three Numbers between 0.0 and 1.0 to be constucted`, () => {
    expect(() => new RGOps.RG()).toThrowError();
    expect(() => new RGOps.RG(-0.1)).toThrowError(
      'RG operator arg "r" must be a number between 0.0 and 1.0.',
    );
    expect(() => new RGOps.RG(0.1, 1.1)).toThrowError(
      'RG operator arg "g" must be a number between 0.0 and 1.0.',
    );
    expect(() => new RGOps.RG(0.1, 1.0, 1.1)).toThrowError(
      'RG operator arg "b" must be a number between 0.0 and 1.0.',
    );
    expect(new RGOps.RG(0.1, 1.0, 0.8)).toBeInstanceOf(RGOps.RG);
    expect(new RGOps.RG(0.1, 1.0, 0.9)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => RGOps.RG.of()).toThrowError();
    expect(() => RGOps.RG.of(-0.1)).toThrowError(
      'RG operator arg "r" must be a number between 0.0 and 1.0.',
    );
    expect(() => RGOps.RG.of(0.1, 1.1)).toThrowError(
      'RG operator arg "g" must be a number between 0.0 and 1.0.',
    );
    expect(() => RGOps.RG.of(0.1, 1.0, 1.1)).toThrowError(
      'RG operator arg "b" must be a number between 0.0 and 1.0.',
    );
    expect(RGOps.RG.of(0.1, 1.0, 0.8)).toBeInstanceOf(RGOps.RG);
    expect(RGOps.RG.of(0.1, 1.0, 0.9)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the RGOps.RG instance as a string`, () => {
      const instance = RGOps.RG.of(0.1, 1.0, 0.8);
      expect(instance.toString()).toEqual('0.1 1 0.8 RG\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = RGOps.RG.of(0.1, 1.0, 0.8);
      expect(instance.bytesSize()).toEqual(13);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = RGOps.RG.of(0.1, 1.0, 0.8);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('0.1 1 0.8 RG\n'));
    });
  });
});

describe(`RGOps.rg`, () => {
  it(`requires three Numbers between 0.0 and 1.0 to be constucted`, () => {
    expect(() => new RGOps.rg()).toThrowError();
    expect(() => new RGOps.rg(-0.1)).toThrowError(
      'rg operator arg "r" must be a number between 0.0 and 1.0.',
    );
    expect(() => new RGOps.rg(0.1, 1.1)).toThrowError(
      'rg operator arg "g" must be a number between 0.0 and 1.0.',
    );
    expect(() => new RGOps.rg(0.1, 1.0, 1.1)).toThrowError(
      'rg operator arg "b" must be a number between 0.0 and 1.0.',
    );
    expect(new RGOps.rg(0.1, 1.0, 0.8)).toBeInstanceOf(RGOps.rg);
    expect(new RGOps.rg(0.1, 1.0, 0.9)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => RGOps.rg.of()).toThrowError();
    expect(() => RGOps.rg.of(-0.1)).toThrowError(
      'rg operator arg "r" must be a number between 0.0 and 1.0.',
    );
    expect(() => RGOps.rg.of(0.1, 1.1)).toThrowError(
      'rg operator arg "g" must be a number between 0.0 and 1.0.',
    );
    expect(() => RGOps.rg.of(0.1, 1.0, 1.1)).toThrowError(
      'rg operator arg "b" must be a number between 0.0 and 1.0.',
    );
    expect(RGOps.rg.of(0.1, 1.0, 0.8)).toBeInstanceOf(RGOps.rg);
    expect(RGOps.rg.of(0.1, 1.0, 0.9)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the RGOps.rg instance as a string`, () => {
      const instance = RGOps.rg.of(0.1, 1.0, 0.8);
      expect(instance.toString()).toEqual('0.1 1 0.8 rg\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = RGOps.rg.of(0.1, 1.0, 0.8);
      expect(instance.bytesSize()).toEqual(13);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = RGOps.rg.of(0.1, 1.0, 0.8);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('0.1 1 0.8 rg\n'));
    });
  });
});
