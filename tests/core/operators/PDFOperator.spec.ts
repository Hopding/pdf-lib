import {
  PDFNumber,
  PDFOperator,
  PDFOperatorNames as Ops,
  PDFString,
  toCharCode,
  typedArrayFor,
} from '../../../src/index';

describe(`PDFOperator`, () => {
  it(`can be constructed with args`, () => {
    const str = PDFString.of('FooBar');
    expect(PDFOperator.of(Ops.ShowText, [str])).toBeInstanceOf(PDFOperator);
  });

  it(`can be constructed without args`, () => {
    expect(PDFOperator.of(Ops.BeginText)).toBeInstanceOf(PDFOperator);
  });

  it(`can be cloned without args`, () => {
    const original = PDFOperator.of(Ops.ClipNonZero);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(String(clone)).toBe(String(original));
  });

  it(`can be cloned with args`, () => {
    const original = PDFOperator.of(Ops.MoveText, [
      PDFNumber.of(25),
      PDFNumber.of(50),
    ]);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(String(clone)).toBe(String(original));
  });

  it(`can be converted to a string without args`, () => {
    expect(String(PDFOperator.of(Ops.ClosePath))).toBe('h');
  });

  it(`can be converted to a string with args`, () => {
    const op = PDFOperator.of(Ops.MoveText, [
      PDFNumber.of(25.43),
      PDFNumber.of(-50),
    ]);
    expect(String(op)).toBe('25.43 -50 Td');
  });

  it(`can provide its size in bytes without args`, () => {
    expect(PDFOperator.of(Ops.ClosePath).sizeInBytes()).toBe(1);
  });

  it(`can provide its size in bytes with args`, () => {
    const op = PDFOperator.of(Ops.MoveText, [
      PDFNumber.of(25.43),
      PDFNumber.of(-50),
    ]);
    expect(op.sizeInBytes()).toBe(12);
  });

  it(`can be serialized without args`, () => {
    const op = PDFOperator.of(Ops.ClosePath);
    const buffer = new Uint8Array(op.sizeInBytes() + 3).fill(toCharCode(' '));
    expect(op.copyBytesInto(buffer, 2)).toBe(1);
    expect(buffer).toEqual(typedArrayFor('  h '));
  });

  it(`can be serialized with args`, () => {
    const op = PDFOperator.of(Ops.MoveText, [
      PDFNumber.of(25.43),
      PDFNumber.of(-50),
    ]);
    const buffer = new Uint8Array(op.sizeInBytes() + 3).fill(toCharCode(' '));
    expect(op.copyBytesInto(buffer, 2)).toBe(12);
    expect(buffer).toEqual(typedArrayFor('  25.43 -50 Td '));
  });
});
