import { PDFName, PrivateConstructorError } from '../../../src/core';
import { toCharCode, typedArrayFor } from '../../../src/utils';

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
    expect(PDFName.of('Identity#2DH')).toBe(PDFName.of('Identity-H'));

    expect(PDFName.of('#40')).toBe(PDFName.of('@'));
    expect(PDFName.of('#41')).toBe(PDFName.of('A'));
    expect(PDFName.of('#42')).toBe(PDFName.of('B'));
    expect(PDFName.of('#43')).toBe(PDFName.of('C'));
    expect(PDFName.of('#44')).toBe(PDFName.of('D'));
    expect(PDFName.of('#45')).toBe(PDFName.of('E'));
    expect(PDFName.of('#46')).toBe(PDFName.of('F'));
    expect(PDFName.of('#47')).toBe(PDFName.of('G'));
    expect(PDFName.of('#48')).toBe(PDFName.of('H'));
    expect(PDFName.of('#49')).toBe(PDFName.of('I'));
    expect(PDFName.of('#4A')).toBe(PDFName.of('J'));
    expect(PDFName.of('#4B')).toBe(PDFName.of('K'));
    expect(PDFName.of('#4C')).toBe(PDFName.of('L'));
    expect(PDFName.of('#4D')).toBe(PDFName.of('M'));
    expect(PDFName.of('#4E')).toBe(PDFName.of('N'));
    expect(PDFName.of('#4F')).toBe(PDFName.of('O'));
  });

  it(`encodes hashes, whitespace, and delimiters when serialized`, () => {
    expect(PDFName.of('Foo#').toString()).toBe('/Foo#23');

    // Note that the \0 shouldn't ever be written into a name,
    // but we'll support it for parsing flexibility sake
    expect(PDFName.of('Foo\0').toString()).toBe('/Foo#00');
    expect(PDFName.of('Foo\t').toString()).toBe('/Foo#09');
    expect(PDFName.of('Foo\n').toString()).toBe('/Foo#0A');
    expect(PDFName.of('Foo\f').toString()).toBe('/Foo#0C');
    expect(PDFName.of('Foo\r').toString()).toBe('/Foo#0D');
    expect(PDFName.of('Foo ').toString()).toBe('/Foo#20');

    expect(PDFName.of('Foo(').toString()).toBe('/Foo#28');
    expect(PDFName.of('Foo)').toString()).toBe('/Foo#29');
    expect(PDFName.of('Foo<').toString()).toBe('/Foo#3C');
    expect(PDFName.of('Foo>').toString()).toBe('/Foo#3E');
    expect(PDFName.of('Foo[').toString()).toBe('/Foo#5B');
    expect(PDFName.of('Foo]').toString()).toBe('/Foo#5D');
    expect(PDFName.of('Foo{').toString()).toBe('/Foo#7B');
    expect(PDFName.of('Foo}').toString()).toBe('/Foo#7D');
    expect(PDFName.of('Foo/').toString()).toBe('/Foo#2F');
    expect(PDFName.of('Foo%').toString()).toBe('/Foo#25');
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
      '/paired#28#29parentheses',
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
    expect(PDFName.of('paired()parentheses').sizeInBytes()).toBe(24);
    expect(PDFName.of('The_Key_of_F#23_Minor').sizeInBytes()).toBe(22);
    expect(PDFName.of('A#42').sizeInBytes()).toBe(3);
  });

  it(`can be serialized`, () => {
    const buffer1 = new Uint8Array(23).fill(toCharCode(' '));
    expect(PDFName.of('\0\t\n\f\r ').copyBytesInto(buffer1, 3)).toBe(19);
    expect(buffer1).toEqual(typedArrayFor('   /#00#09#0A#0C#0D#20 '));

    const buffer2 = new Uint8Array(17).fill(toCharCode(' '));
    expect(PDFName.of('Lime Green').copyBytesInto(buffer2, 1)).toBe(13);
    expect(buffer2).toEqual(typedArrayFor(' /Lime#20Green   '));

    const buffer3 = new Uint8Array(7).fill(toCharCode(' '));
    expect(PDFName.of('A#42').copyBytesInto(buffer3, 4)).toBe(3);
    expect(buffer3).toEqual(typedArrayFor('    /AB'));
  });
});
