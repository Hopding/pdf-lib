// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import * as SCNOps from 'core/pdf-operators/graphics/color/SCNOps';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`SCNOps.SCN`, () => {
  it(`requires a Number[] and optionally a String to be constucted`, () => {
    expect(() => new SCNOps.SCN()).toThrowError();
    expect(() => new SCNOps.SCN(21)).toThrowError(
      `validateArr.value must be an array.`,
    );
    expect(() => new SCNOps.SCN(['21'])).toThrowError(
      `SCN operator args "c" must be all be numbers.`,
    );
    expect(() => new SCNOps.SCN(['21'])).toThrowError(
      `SCN operator args "c" must be all be numbers.`,
    );
    expect(() => new SCNOps.SCN([21], 99)).toThrowError(
      'SCN operator arg "name" must be a string or PDFName.',
    );
    expect(new SCNOps.SCN([21], 'FooBar')).toBeInstanceOf(SCNOps.SCN);
    expect(new SCNOps.SCN([21], 'FooBar')).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => SCNOps.SCN.of()).toThrowError();
    expect(() => SCNOps.SCN.of(21)).toThrowError(
      `validateArr.value must be an array.`,
    );
    expect(() => SCNOps.SCN.of(['21'])).toThrowError(
      `SCN operator args "c" must be all be numbers.`,
    );
    expect(() => SCNOps.SCN.of(['21'])).toThrowError(
      `SCN operator args "c" must be all be numbers.`,
    );
    expect(() => SCNOps.SCN.of([21], 99)).toThrowError(
      'SCN operator arg "name" must be a string or PDFName.',
    );
    expect(SCNOps.SCN.of([21], 'FooBar')).toBeInstanceOf(SCNOps.SCN);
    expect(SCNOps.SCN.of([21], 'FooBar')).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the SCNOps.SCN instance as a string`, () => {
      const instance1 = SCNOps.SCN.of([21], 'FooBar');
      expect(instance1.toString()).toEqual('21 /FooBar SCN\n');

      const instance2 = SCNOps.SCN.of([21]);
      expect(instance2.toString()).toEqual('21 SCN\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance1 = SCNOps.SCN.of([21], 'FooBar');
      expect(instance1.bytesSize()).toEqual(15);

      const instance2 = SCNOps.SCN.of([21]);
      expect(instance2.bytesSize()).toEqual(7);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance1 = SCNOps.SCN.of([21], 'FooBar');
      const buffer1 = new Uint8Array(instance1.bytesSize());
      instance1.copyBytesInto(buffer1);
      expect(buffer1).toEqual(typedArrayFor('21 /FooBar SCN\n'));

      const instance2 = SCNOps.SCN.of([21]);
      const buffer2 = new Uint8Array(instance2.bytesSize());
      instance2.copyBytesInto(buffer2);
      expect(buffer2).toEqual(typedArrayFor('21 SCN\n'));
    });
  });
});

describe(`SCNOps.scn`, () => {
  it(`requires a Number[] and optionally a String to be constucted`, () => {
    expect(() => new SCNOps.scn()).toThrowError();
    expect(() => new SCNOps.scn(21)).toThrowError(
      `validateArr.value must be an array.`,
    );
    expect(() => new SCNOps.scn(['21'])).toThrowError(
      `scn operator args "c" must be all be numbers.`,
    );
    expect(() => new SCNOps.scn(['21'])).toThrowError(
      `scn operator args "c" must be all be numbers.`,
    );
    expect(() => new SCNOps.scn([21], 99)).toThrowError(
      'scn operator arg "name" must be a string or PDFName.',
    );
    expect(new SCNOps.scn([21], 'FooBar')).toBeInstanceOf(SCNOps.scn);
    expect(new SCNOps.scn([21], 'FooBar')).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => SCNOps.scn.of()).toThrowError();
    expect(() => SCNOps.scn.of(21)).toThrowError(
      `validateArr.value must be an array.`,
    );
    expect(() => SCNOps.scn.of(['21'])).toThrowError(
      `scn operator args "c" must be all be numbers.`,
    );
    expect(() => SCNOps.scn.of(['21'])).toThrowError(
      `scn operator args "c" must be all be numbers.`,
    );
    expect(() => SCNOps.scn.of([21], 99)).toThrowError(
      'scn operator arg "name" must be a string or PDFName.',
    );
    expect(SCNOps.scn.of([21], 'FooBar')).toBeInstanceOf(SCNOps.scn);
    expect(SCNOps.scn.of([21], 'FooBar')).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the SCNOps.scn instance as a string`, () => {
      const instance1 = SCNOps.scn.of([21], 'FooBar');
      expect(instance1.toString()).toEqual('21 /FooBar scn\n');

      const instance2 = SCNOps.scn.of([21]);
      expect(instance2.toString()).toEqual('21 scn\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance1 = SCNOps.scn.of([21], 'FooBar');
      expect(instance1.bytesSize()).toEqual(15);

      const instance2 = SCNOps.scn.of([21]);
      expect(instance2.bytesSize()).toEqual(7);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance1 = SCNOps.scn.of([21], 'FooBar');
      const buffer1 = new Uint8Array(instance1.bytesSize());
      instance1.copyBytesInto(buffer1);
      expect(buffer1).toEqual(typedArrayFor('21 /FooBar scn\n'));

      const instance2 = SCNOps.scn.of([21]);
      const buffer2 = new Uint8Array(instance2.bytesSize());
      instance2.copyBytesInto(buffer2);
      expect(buffer2).toEqual(typedArrayFor('21 scn\n'));
    });
  });
});
