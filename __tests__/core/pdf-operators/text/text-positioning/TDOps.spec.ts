// This is required to prevent an error due to circular imports in this test
import 'core/pdf-objects';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import * as TDOps from 'core/pdf-operators/text/text-positioning/TDOps';
import { typedArrayFor } from 'utils';

describe(`TDOps.Td`, () => {
  it(`it requires two numbers to be constructed`, () => {
    expect(() => new TDOps.Td()).toThrowError(
      `Td operator arg "tx" must be a number.`,
    );
    expect(() => new TDOps.Td('1')).toThrowError(
      `Td operator arg "tx" must be a number.`,
    );
    expect(() => new TDOps.Td(1)).toThrowError(
      `Td operator arg "ty" must be a number.`,
    );
    expect(() => new TDOps.Td(1, '2')).toThrowError(
      `Td operator arg "ty" must be a number.`,
    );
    expect(new TDOps.Td(1, 2)).toBeInstanceOf(PDFOperator);
    expect(new TDOps.Td(1, 2)).toBeInstanceOf(TDOps.Td);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => new TDOps.Td()).toThrowError(
      `Td operator arg "tx" must be a number.`,
    );
    expect(() => new TDOps.Td('1')).toThrowError(
      `Td operator arg "tx" must be a number.`,
    );
    expect(() => new TDOps.Td(1)).toThrowError(
      `Td operator arg "ty" must be a number.`,
    );
    expect(() => new TDOps.Td(1, '2')).toThrowError(
      `Td operator arg "ty" must be a number.`,
    );
    expect(new TDOps.Td(1, 2)).toBeInstanceOf(PDFOperator);
    expect(new TDOps.Td(1, 2)).toBeInstanceOf(TDOps.Td);
  });

  describe(`"toString" method`, () => {
    it(`returns the TDOps.Td instance as a string`, () => {
      const instance = TDOps.Td.of(99, 21);
      expect(instance.toString()).toEqual(`99 21 Td\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the TDOps.Td instance in bytes`, () => {
      const instance = TDOps.Td.of(99, 21);
      expect(instance.bytesSize()).toEqual(9);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the TDOps.Td instance into the buffer as bytes`, () => {
      const instance = TDOps.Td.of(99, 21);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`99 21 Td\n`));
    });
  });
});

describe(`TDOps.TD`, () => {
  it(`it requires two numbers as its arguments`, () => {
    expect(() => new TDOps.TD()).toThrowError(
      `TD operator arg "tx" must be a number.`,
    );
    expect(() => new TDOps.TD('1')).toThrowError(
      `TD operator arg "tx" must be a number.`,
    );
    expect(() => new TDOps.TD(1)).toThrowError(
      `TD operator arg "ty" must be a number.`,
    );
    expect(() => new TDOps.TD(1, '2')).toThrowError(
      `TD operator arg "ty" must be a number.`,
    );
    expect(new TDOps.TD(1, 2)).toBeInstanceOf(PDFOperator);
    expect(new TDOps.TD(1, 2)).toBeInstanceOf(TDOps.TD);
  });

  it(`has a static "of" factory method`, () => {
    expect(() => new TDOps.TD()).toThrowError(
      `TD operator arg "tx" must be a number.`,
    );
    expect(() => new TDOps.TD('1')).toThrowError(
      `TD operator arg "tx" must be a number.`,
    );
    expect(() => new TDOps.TD(1)).toThrowError(
      `TD operator arg "ty" must be a number.`,
    );
    expect(() => new TDOps.TD(1, '2')).toThrowError(
      `TD operator arg "ty" must be a number.`,
    );
    expect(new TDOps.TD(1, 2)).toBeInstanceOf(PDFOperator);
    expect(new TDOps.TD(1, 2)).toBeInstanceOf(TDOps.TD);
  });

  describe(`"toString" method`, () => {
    it(`returns the TDOps.TD instance as a string`, () => {
      const instance = TDOps.TD.of(99, 21);
      expect(instance.toString()).toEqual(`99 21 TD\n`);
    });
  });

  describe(`"bytesSize" method`, () => {
    it(`returns the size of the TDOps.TD instance in bytes`, () => {
      const instance = TDOps.TD.of(99, 21);
      expect(instance.bytesSize()).toEqual(9);
    });
  });

  describe(`"copyBytesInto" method`, () => {
    it(`copies the TDOps.TD instance into the buffer as bytes`, () => {
      const instance = TDOps.TD.of(99, 21);
      const buffer = new Uint8Array(instance.bytesSize());
      instance.copyBytesInto(buffer);
      expect(buffer).toEqual(typedArrayFor(`99 21 TD\n`));
    });
  });
});
