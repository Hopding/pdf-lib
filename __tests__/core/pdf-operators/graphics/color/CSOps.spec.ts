// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import * as CSOps from 'core/pdf-operators/graphics/color/CSOps';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`CSOps.CS`, () => {
  it(`requires a String to be constucted`, () => {
    expect(() => new CSOps.CS()).toThrowError();
    expect(() => new CSOps.CS([])).toThrowError(
      'CS operator arg "name" must be a string or PDFName.',
    );
    expect(new CSOps.CS('DeviceRGB')).toBeInstanceOf(CSOps.CS);
    expect(new CSOps.CS('DeviceRGB')).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => CSOps.CS.of()).toThrowError();
    expect(() => CSOps.CS.of([])).toThrowError(
      'CS operator arg "name" must be a string or PDFName.',
    );
    expect(CSOps.CS.of('DeviceRGB')).toBeInstanceOf(CSOps.CS);
    expect(CSOps.CS.of('DeviceRGB')).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the CSOps.CS instance as a string`, () => {
      const instance = CSOps.CS.of('DeviceRGB');
      expect(instance.toString()).toEqual('/DeviceRGB CS\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = CSOps.CS.of('DeviceRGB');
      expect(instance.bytesSize()).toEqual(14);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = CSOps.CS.of('DeviceRGB');
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('/DeviceRGB CS\n'));
    });
  });
});

describe(`CSOps.cs`, () => {
  it(`requires a String to be constucted`, () => {
    expect(() => new CSOps.cs()).toThrowError();
    expect(() => new CSOps.cs([])).toThrowError(
      'cs operator arg "name" must be a string or PDFName.',
    );
    expect(new CSOps.cs('DeviceRGB')).toBeInstanceOf(CSOps.cs);
    expect(new CSOps.cs('DeviceRGB')).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => CSOps.cs.of()).toThrowError();
    expect(() => CSOps.cs.of([])).toThrowError(
      'cs operator arg "name" must be a string or PDFName.',
    );
    expect(CSOps.cs.of('DeviceRGB')).toBeInstanceOf(CSOps.cs);
    expect(CSOps.cs.of('DeviceRGB')).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the CSOps.cs instance as a string`, () => {
      const instance = CSOps.cs.of('DeviceRGB');
      expect(instance.toString()).toEqual('/DeviceRGB cs\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = CSOps.cs.of('DeviceRGB');
      expect(instance.bytesSize()).toEqual(14);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = CSOps.cs.of('DeviceRGB');
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('/DeviceRGB cs\n'));
    });
  });
});
