// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import * as SCOps from 'core/pdf-operators/graphics/color/SCOps';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`SCOps.SC`, () => {
  it(`requires four Numbers to be constucted`, () => {
    expect(() => new SCOps.SC()).toThrowError();
    expect(() => new SCOps.SC('1')).toThrowError(
      'SC operator args "c" must be a number.',
    );
    expect(() => new SCOps.SC(1, '2')).toThrowError(
      'SC operator args "c" must be a number.',
    );
    expect(() => new SCOps.SC(1, 2, '3')).toThrowError(
      'SC operator args "c" must be a number.',
    );
    expect(() => new SCOps.SC(1, 2, 3, '4')).toThrowError(
      'SC operator args "c" must be a number.',
    );
    expect(new SCOps.SC(1, 2, 3, 4)).toBeInstanceOf(SCOps.SC);
    expect(new SCOps.SC(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => SCOps.SC.of()).toThrowError();
    expect(() => SCOps.SC.of('1')).toThrowError(
      'SC operator args "c" must be a number.',
    );
    expect(() => SCOps.SC.of(1, '2')).toThrowError(
      'SC operator args "c" must be a number.',
    );
    expect(() => SCOps.SC.of(1, 2, '3')).toThrowError(
      'SC operator args "c" must be a number.',
    );
    expect(() => SCOps.SC.of(1, 2, 3, '4')).toThrowError(
      'SC operator args "c" must be a number.',
    );
    expect(SCOps.SC.of(1, 2, 3, 4)).toBeInstanceOf(SCOps.SC);
    expect(SCOps.SC.of(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the SCOps.SC instance as a string`, () => {
      const instance = SCOps.SC.of(1, 2, 3, 4);
      expect(instance.toString()).toEqual('1 2 3 4 SC\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = SCOps.SC.of(1, 2, 3, 4);
      expect(instance.bytesSize()).toEqual(11);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = SCOps.SC.of(1, 2, 3, 4);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('1 2 3 4 SC\n'));
    });
  });
});

describe(`SCOps.sc`, () => {
  it(`requires four Numbers to be constucted`, () => {
    expect(() => new SCOps.sc()).toThrowError();
    expect(() => new SCOps.sc('1')).toThrowError(
      'sc operator args "c" must be a number.',
    );
    expect(() => new SCOps.sc(1, '2')).toThrowError(
      'sc operator args "c" must be a number.',
    );
    expect(() => new SCOps.sc(1, 2, '3')).toThrowError(
      'sc operator args "c" must be a number.',
    );
    expect(() => new SCOps.sc(1, 2, 3, '4')).toThrowError(
      'sc operator args "c" must be a number.',
    );
    expect(new SCOps.sc(1, 2, 3, 4)).toBeInstanceOf(SCOps.sc);
    expect(new SCOps.sc(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => SCOps.sc.of()).toThrowError();
    expect(() => SCOps.sc.of('1')).toThrowError(
      'sc operator args "c" must be a number.',
    );
    expect(() => SCOps.sc.of(1, '2')).toThrowError(
      'sc operator args "c" must be a number.',
    );
    expect(() => SCOps.sc.of(1, 2, '3')).toThrowError(
      'sc operator args "c" must be a number.',
    );
    expect(() => SCOps.sc.of(1, 2, 3, '4')).toThrowError(
      'sc operator args "c" must be a number.',
    );
    expect(SCOps.sc.of(1, 2, 3, 4)).toBeInstanceOf(SCOps.sc);
    expect(SCOps.sc.of(1, 2, 3, 4)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the SCOps.sc instance as a string`, () => {
      const instance = SCOps.sc.of(1, 2, 3, 4);
      expect(instance.toString()).toEqual('1 2 3 4 sc\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = SCOps.sc.of(1, 2, 3, 4);
      expect(instance.bytesSize()).toEqual(11);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = SCOps.sc.of(1, 2, 3, 4);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('1 2 3 4 sc\n'));
    });
  });
});
