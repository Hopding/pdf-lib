// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import * as JOps from 'core/pdf-operators/graphics/graphics-state/JOps';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { typedArrayFor } from 'utils';

describe(`JOps.J`, () => {
  it(`requires a Number of 0, 1, or 2 to be constucted`, () => {
    expect(() => new JOps.J()).toThrowError();
    expect(() => new JOps.J(-1)).toThrowError(
      'J operator arg "lineCap" must be 0, 1, or 2.',
    );
    expect(() => new JOps.J(3)).toThrowError(
      'J operator arg "lineCap" must be 0, 1, or 2.',
    );
    expect(new JOps.J(0)).toBeInstanceOf(JOps.J);
    expect(new JOps.J(1)).toBeInstanceOf(JOps.J);
    expect(new JOps.J(2)).toBeInstanceOf(JOps.J);
    expect(new JOps.J(2)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => JOps.J.of()).toThrowError();
    expect(() => JOps.J.of(-1)).toThrowError(
      'J operator arg "lineCap" must be 0, 1, or 2.',
    );
    expect(() => JOps.J.of(3)).toThrowError(
      'J operator arg "lineCap" must be 0, 1, or 2.',
    );
    expect(JOps.J.of(0)).toBeInstanceOf(JOps.J);
    expect(JOps.J.of(1)).toBeInstanceOf(JOps.J);
    expect(JOps.J.of(2)).toBeInstanceOf(JOps.J);
    expect(JOps.J.of(2)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the JOps.J instance as a string`, () => {
      const instance = JOps.J.of(0);
      expect(instance.toString()).toEqual('0 J\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = JOps.J.of(1);
      expect(instance.bytesSize()).toEqual(4);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = JOps.J.of(2);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('2 J\n'));
    });
  });
});

describe(`JOps.j`, () => {
  it(`requires a Number of 0, 1, or 2 to be constucted`, () => {
    expect(() => new JOps.j()).toThrowError();
    expect(() => new JOps.j(-1)).toThrowError(
      'j operator arg "lineJoin" must be 0, 1, or 2.',
    );
    expect(() => new JOps.j(3)).toThrowError(
      'j operator arg "lineJoin" must be 0, 1, or 2.',
    );
    expect(new JOps.j(0)).toBeInstanceOf(JOps.j);
    expect(new JOps.j(1)).toBeInstanceOf(JOps.j);
    expect(new JOps.j(2)).toBeInstanceOf(JOps.j);
    expect(new JOps.j(2)).toBeInstanceOf(PDFOperator);
  });

  it(`has a static "of" method`, () => {
    expect(() => JOps.j.of()).toThrowError();
    expect(() => JOps.j.of(-1)).toThrowError(
      'j operator arg "lineJoin" must be 0, 1, or 2.',
    );
    expect(() => JOps.j.of(3)).toThrowError(
      'j operator arg "lineJoin" must be 0, 1, or 2.',
    );
    expect(JOps.j.of(0)).toBeInstanceOf(JOps.j);
    expect(JOps.j.of(1)).toBeInstanceOf(JOps.j);
    expect(JOps.j.of(2)).toBeInstanceOf(JOps.j);
    expect(JOps.j.of(2)).toBeInstanceOf(PDFOperator);
  });

  describe(`"toString" method`, () => {
    it(`returns the JOps.j instance as a string`, () => {
      const instance = JOps.j.of(0);
      expect(instance.toString()).toEqual('0 j\n');
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the Singleton in bytes`, () => {
      const instance = JOps.j.of(1);
      expect(instance.bytesSize()).toEqual(4);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the Singleton into the buffer as bytes`, () => {
      const instance = JOps.j.of(2);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor('2 j\n'));
    });
  });
});
