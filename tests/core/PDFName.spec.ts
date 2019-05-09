import { PDFName, PrivateConstructorError } from 'src/core';
import { toCharCode, typedArrayFor } from 'src/utils';

describe(`PDFName`, () => {
  it(`can be constructed from PDFName.of(...)`, () => {
    expect(PDFName.of('foobar')).toBeInstanceOf(PDFName);
    expect(PDFName.of('A;Name_With-***Characters?')).toBeInstanceOf(PDFName);
    expect(PDFName.of('paired#28#29parentheses')).toBeInstanceOf(PDFName);
  });

  it(`cannot be publicly constructed`, () => {
    expect(() => new (PDFName as any)({}, 'stuff')).toThrow(
      new PrivateConstructorError(PDFName.name),
    );
  });

  it(`returns the same instance when given the same value`, () => {
    expect(PDFName.of('foobar')).toBe(PDFName.of('foobar'));
    expect(PDFName.of('A;Name_With-***Characters?')).toBe(
      PDFName.of('A;Name_With-***Characters?'),
    );
    expect(PDFName.of('paired#28#29parentheses')).toBe(
      PDFName.of('paired#28#29parentheses'),
    );
  });

  it(`decodes hex codes in the values`, () => {
    expect(PDFName.of('Lime#20Green')).toBe(PDFName.of('Lime Green'));
    expect(PDFName.of('paired#28#29parentheses')).toBe(
      PDFName.of('paired()parentheses'),
    );
    expect(PDFName.of('The_Key_of_F#23_Minor')).toBe(
      PDFName.of('The_Key_of_F#_Minor'),
    );
    expect(PDFName.of('A#42')).toBe(PDFName.of('AB'));
  });

  it(`can be cloned`, () => {
    expect(PDFName.of('foobar').clone()).toBe(PDFName.of('foobar'));
    expect(PDFName.of('Lime#20Green').clone()).toBe(PDFName.of('Lime Green'));
  });

  it(`can be converted to a string`, () => {
    expect(String(PDFName.of('foobar'))).toBe('/foobar');
    expect(String(PDFName.of('Lime Green'))).toBe('/Lime#20Green');
    expect(String(PDFName.of('\0\t\n\f\r '))).toBe('/#00#09#0A#0C#0D#20');
    expect(String(PDFName.of('Foo#Bar'))).toBe('/Foo#23Bar');
    expect(String(PDFName.of('paired()parentheses'))).toBe(
      '/paired()parentheses',
    );
    expect(String(PDFName.of('The_Key_of_F#23_Minor'))).toBe(
      '/The_Key_of_F#23_Minor',
    );
    expect(String(PDFName.of('A#42'))).toBe('/AB');
  });

  it(`can provide its size in bytes`, () => {
    expect(PDFName.of('foobar').sizeInBytes()).toBe(7);
    expect(PDFName.of('Lime Green').sizeInBytes()).toBe(13);
    expect(PDFName.of('\0\t\n\f\r ').sizeInBytes()).toBe(19);
    expect(PDFName.of('Foo#Bar').sizeInBytes()).toBe(10);
    expect(PDFName.of('paired()parentheses').sizeInBytes()).toBe(20);
    expect(PDFName.of('The_Key_of_F#23_Minor').sizeInBytes()).toBe(22);
    expect(PDFName.of('A#42').sizeInBytes()).toBe(3);
  });

  it(`can be serialized`, () => {
    const buffer1 = new Uint8Array(23).fill(toCharCode(' '));
    PDFName.of('\0\t\n\f\r ').copyBytesInto(buffer1, 3);
    expect(buffer1).toEqual(typedArrayFor('   /#00#09#0A#0C#0D#20 '));

    const buffer2 = new Uint8Array(17).fill(toCharCode(' '));
    PDFName.of('Lime Green').copyBytesInto(buffer2, 1);
    expect(buffer2).toEqual(typedArrayFor(' /Lime#20Green   '));

    const buffer3 = new Uint8Array(7).fill(toCharCode(' '));
    PDFName.of('A#42').copyBytesInto(buffer3, 4);
    expect(buffer3).toEqual(typedArrayFor('    /AB'));
  });
});
