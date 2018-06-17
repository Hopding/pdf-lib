// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import * as KOps from 'core/pdf-operators/graphics/color/KOps';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`KOps.K`, () => {
  it(`requires four Numbers between 0.0 and 1.0 to be constucted`, () => {
    expect(() => new KOps.K()).toThrowError();
    expect(() => new KOps.K(-0.1)).toThrowError(
      'K operator arg "c" must be a number between 0.0 and 1.0.',
    );
    expect(() => new KOps.K(0.1, 1.1)).toThrowError(
      'K operator arg "m" must be a number between 0.0 and 1.0.',
    );
    expect(() => new KOps.K(0.1, 1.0, 1.1)).toThrowError(
      'K operator arg "y" must be a number between 0.0 and 1.0.',
    );
    expect(() => new KOps.K(0.1, 1.0, 0.9, 2)).toThrowError(
      'K operator arg "k" must be a number between 0.0 and 1.0.',
    );
    expect(new KOps.K(0.1, 1.0, 0.8, 0.5)).toBeInstanceOf(KOps.K);
    expect(new KOps.K(0.1, 1.0, 0.9, 0.5)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => KOps.K.of()).toThrowError();
    expect(() => KOps.K.of(-0.1)).toThrowError(
      'K operator arg "c" must be a number between 0.0 and 1.0.',
    );
    expect(() => KOps.K.of(0.1, 1.1)).toThrowError(
      'K operator arg "m" must be a number between 0.0 and 1.0.',
    );
    expect(() => KOps.K.of(0.1, 1.0, 1.1)).toThrowError(
      'K operator arg "y" must be a number between 0.0 and 1.0.',
    );
    expect(() => KOps.K.of(0.1, 1.0, 0.9, 2)).toThrowError(
      'K operator arg "k" must be a number between 0.0 and 1.0.',
    );
    expect(KOps.K.of(0.1, 1.0, 0.8, 0.5)).toBeInstanceOf(KOps.K);
    expect(KOps.K.of(0.1, 1.0, 0.9, 0.5)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the KOps.K instance as a string`, () => {
      const instance = KOps.K.of(0.1, 1.0, 0.8, 0.5);
      expect(instance.toString()).toEqual('0.1 1 0.8 0.5 K\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = KOps.K.of(0.1, 1.0, 0.8, 0.5);
      expect(instance.bytesSize()).toEqual(16);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = KOps.K.of(0.1, 1.0, 0.8, 0.5);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('0.1 1 0.8 0.5 K\n'));
    });
  });
});

describe(`KOps.k`, () => {
  it(`requires four Numbers between 0.0 and 1.0 to be constucted`, () => {
    expect(() => new KOps.k()).toThrowError();
    expect(() => new KOps.k(-0.1)).toThrowError(
      'k operator arg "c" must be a number between 0.0 and 1.0.',
    );
    expect(() => new KOps.k(0.1, 1.1)).toThrowError(
      'k operator arg "m" must be a number between 0.0 and 1.0.',
    );
    expect(() => new KOps.k(0.1, 1.0, 1.1)).toThrowError(
      'k operator arg "y" must be a number between 0.0 and 1.0.',
    );
    expect(() => new KOps.k(0.1, 1.0, 0.9, 2)).toThrowError(
      'k operator arg "k" must be a number between 0.0 and 1.0.',
    );
    expect(new KOps.k(0.1, 1.0, 0.8, 0.5)).toBeInstanceOf(KOps.k);
    expect(new KOps.k(0.1, 1.0, 0.9, 0.5)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => KOps.k.of()).toThrowError();
    expect(() => KOps.k.of(-0.1)).toThrowError(
      'k operator arg "c" must be a number between 0.0 and 1.0.',
    );
    expect(() => KOps.k.of(0.1, 1.1)).toThrowError(
      'k operator arg "m" must be a number between 0.0 and 1.0.',
    );
    expect(() => KOps.k.of(0.1, 1.0, 1.1)).toThrowError(
      'k operator arg "y" must be a number between 0.0 and 1.0.',
    );
    expect(() => KOps.k.of(0.1, 1.0, 0.9, 2)).toThrowError(
      'k operator arg "k" must be a number between 0.0 and 1.0.',
    );
    expect(KOps.k.of(0.1, 1.0, 0.8, 0.5)).toBeInstanceOf(KOps.k);
    expect(KOps.k.of(0.1, 1.0, 0.9, 0.5)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the KOps.k instance as a string`, () => {
      const instance = KOps.k.of(0.1, 1.0, 0.8, 0.5);
      expect(instance.toString()).toEqual('0.1 1 0.8 0.5 k\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = KOps.k.of(0.1, 1.0, 0.8, 0.5);
      expect(instance.bytesSize()).toEqual(16);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = KOps.k.of(0.1, 1.0, 0.8, 0.5);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('0.1 1 0.8 0.5 k\n'));
    });
  });
});
