import {
  mergeIntoTypedArray,
  utf16Encode,
  utf8Encode,
  utf16Decode,
} from '../../src/utils';

const utf8BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
const utf16BOM = new Uint16Array([0xfeff]);

const withUtf8Bom = (encoding: Uint8Array) =>
  mergeIntoTypedArray(utf8BOM, encoding);

const withUtf16Bom = (encoding: Uint16Array) =>
  new Uint16Array([...Array.from(utf16BOM), ...Array.from(encoding)]);

describe(`utf8Encode`, () => {
  it(`encodes <U+004D U+0430 U+4E8C U+10302> to UTF-8`, () => {
    const input = '\u{004D}\u{0430}\u{4E8C}\u{10302}';

    // prettier-ignore
    const expected = new Uint8Array([
      /* U+004D  */ 0x4d, 
      /* U+0430  */ 0xd0, 0xb0, 
      /* U+4E8C  */ 0xe4, 0xba, 0x8c,
      /* U+10302 */ 0xf0, 0x90, 0x8c, 0x82,
    ]);

    const actual = utf8Encode(input);

    expect(actual).toEqual(withUtf8Bom(expected));
  });

  it(`encodes <U+004D U+0061 U+10000> to UTF-8`, () => {
    const input = '\u{004D}\u{0061}\u{10000}';

    // prettier-ignore
    const expected = new Uint8Array([
      /* U+004D  */ 0x4d, 
      /* U+0061  */ 0x61, 
      /* U+10000 */ 0xf0, 0x90, 0x80, 0x80,
    ]);

    const actual = utf8Encode(input);

    expect(actual).toEqual(withUtf8Bom(expected));
  });

  it(`encodes <U+1F4A9 U+1F382> to UTF-8 (without a BOM)`, () => {
    const input = '💩🎂';

    // prettier-ignore
    const expected = new Uint8Array([
      /* U+1F4A9 */ 0xf0, 0x9f, 0x92, 0xa9, 
      /* U+1F382 */ 0xf0, 0x9f, 0x8e, 0x82, 	
    ]);

    const actual = utf8Encode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`encodes "Дмитрий Козлюк (Dmitry Kozlyuk)" to UTF-8`, () => {
    const input = 'Дмитрий Козлюк (Dmitry Kozlyuk)';

    // prettier-ignore
    const expected = new Uint8Array([
      0xd0, 0x94, 0xd0, 0xbc, 0xd0, 0xb8, 0xd1, 0x82, 0xd1, 0x80, 0xd0, 0xb8,
      0xd0, 0xb9, 0x20, 0xd0, 0x9a, 0xd0, 0xbe, 0xd0, 0xb7, 0xd0, 0xbb, 0xd1,
      0x8e, 0xd0, 0xba, 0x20, 0x28, 0x44, 0x6d, 0x69, 0x74, 0x72, 0x79, 0x20,
      0x4b, 0x6f, 0x7a, 0x6c, 0x79, 0x75, 0x6b, 0x29,
    ]);

    const actual = utf8Encode(input);

    expect(actual).toEqual(withUtf8Bom(expected));
  });

  it(`encodes "ä☺𠜎️☁️" to UTF-8 (without a BOM)`, () => {
    const input = 'ä☺𠜎️☁️';

    // prettier-ignore
    const expected = new Uint8Array([
      0xc3, 0xa4, 0xe2, 0x98, 0xba, 0xf0, 0xa0, 0x9c, 0x8e, 0xef, 0xb8, 0x8f,
      0xe2, 0x98, 0x81, 0xef, 0xb8, 0x8f,
    ]);

    const actual = utf8Encode(input, false);

    expect(actual).toEqual(expected);
  });
});

describe(`utf16Encode`, () => {
  it(`encodes <U+004D U+0430 U+4E8C U+10302> to UTF-16`, () => {
    const input = '\u{004D}\u{0430}\u{4E8C}\u{10302}';

    // prettier-ignore
    const expected = new Uint16Array(new Uint8Array([
      /* U+004D  */ 0x4d, 0x00, 
      /* U+0430  */ 0x30, 0x04,
      /* U+4E8C  */ 0x8c, 0x4e,
      /* U+10302 */ 0x00, 0xd8, 0x02, 0xdf, 
    ]).buffer);

    const actual = utf16Encode(input);

    expect(actual).toEqual(withUtf16Bom(expected));
  });

  it(`encodes <U+004D U+0061 U+10000> to UTF-16`, () => {
    const input = '\u{004D}\u{0061}\u{10000}';

    // prettier-ignore
    const expected = new Uint16Array(new Uint8Array([
      /* U+004D  */ 0x4d, 0x00, 
      /* U+0061  */ 0x61, 0x00,
      /* U+10000 */ 0x00, 0xd8, 0x00, 0xdc,
    ]).buffer);

    const actual = utf16Encode(input);

    expect(actual).toEqual(withUtf16Bom(expected));
  });

  it(`encodes <U+1F4A9 U+1F382> to UTF-16 (without a BOM)`, () => {
    const input = '💩🎂';

    // prettier-ignore
    const expected = new Uint16Array(new Uint8Array([
      /* U+1F4A9 */ 0x3d, 0xd8, 0xa9, 0xdc,
      /* U+1F382 */ 0x3c, 0xd8, 0x82, 0xdf,
    ]).buffer);

    const actual = utf16Encode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`encodes "Дмитрий Козлюк (Dmitry Kozlyuk)" to UTF-16`, () => {
    const input = 'Дмитрий Козлюк (Dmitry Kozlyuk)';

    // prettier-ignore
    const expected = new Uint16Array([
      0x414, 0x43c, 0x438, 0x442, 0x440, 0x438, 0x439, 0x20, 0x41a, 0x43e, 
      0x437, 0x43b, 0x44e, 0x43a, 0x20, 0x28, 0x44, 0x6d, 0x69, 0x74, 0x72, 
      0x79, 0x20, 0x4b, 0x6f, 0x7a, 0x6c, 0x79, 0x75, 0x6b, 0x29,
    ]);

    const actual = utf16Encode(input);

    expect(actual).toEqual(withUtf16Bom(expected));
  });

  it(`encodes "ä☺𠜎️☁️" to UTF-16 (without a BOM)`, () => {
    const input = 'ä☺𠜎️☁️';

    // prettier-ignore
    const expected = new Uint16Array([
      0xe4, 0x263a, 55361, 57102, 0xfe0f, 0x2601, 0xfe0f,
    ]);

    const actual = utf16Encode(input, false);

    expect(actual).toEqual(expected);
  });
});

describe(`utf16Decode`, () => {
  it(`decodes <U+004D U+0430 U+4E8C U+10302> from UTF-16`, () => {
    // prettier-ignore
    const input = new Uint8Array([
      /* U+004D  */ 0x00, 0x4d,
      /* U+0430  */ 0x04, 0x30,
      /* U+4E8C  */ 0x4e, 0x8c,
      /* U+10302 */ 0xd8, 0x00, 0xdf, 0x02,
    ]);

    const expected = '\u{004D}\u{0430}\u{4E8C}\u{10302}';

    const actual = utf16Decode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`decodes <U+004D U+0061 U+10000> from UTF-16`, () => {
    // prettier-ignore
    const input = new Uint8Array([
      /* U+004D  */ 0x00, 0x4d, 
      /* U+0061  */ 0x00, 0x61, 
      /* U+10000 */ 0xd8, 0x00, 0xdc, 0x00,
    ]);

    const expected = '\u{004D}\u{0061}\u{10000}';

    const actual = utf16Decode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`decodes <U+1F4A9 U+1F382> from UTF-16`, () => {
    // prettier-ignore
    const input = new Uint8Array([
      /* U+1F4A9 */ 0xd8, 0x3d, 0xdc, 0xa9,
      /* U+1F382 */ 0xd8, 0x3c, 0xdf, 0x82, 
    ]);

    const expected = '💩🎂';

    const actual = utf16Decode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`decodes 'abcd' from UTF-16`, () => {
    // prettier-ignore
    const input = new Uint8Array([
      /* a */ 0, 97,
      /* b */ 0, 98,
      /* c */ 0, 99,
      /* d */ 0, 100,
    ]);

    const expected = 'abcd';

    const actual = utf16Decode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`decodes "Дмитрий Козлюк (Dmitry Kozlyuk)" from UTF-16`, () => {
    const littleEndianBOM = (0xfe << 8) | 0xff;

    // prettier-ignore
    const input = new Uint8Array(new Uint16Array([
      littleEndianBOM,
      0x414, 0x43c, 0x438, 0x442, 0x440, 0x438, 0x439, 0x020, 0x41a, 0x43e,
      0x437, 0x43b, 0x44e, 0x43a, 0x020, 0x028, 0x044, 0x06d, 0x069, 0x074, 
      0x072, 0x079, 0x020, 0x04b, 0x06f, 0x07a, 0x06c, 0x079, 0x075, 0x06b, 
      0x29,
    ]).buffer);

    const expected = 'Дмитрий Козлюк (Dmitry Kozlyuk)';

    const actual = utf16Decode(input, true);

    expect(actual).toEqual(expected);
  });

  it(`decodes "ä☺𠜎️☁️" from UTF-16 (without a BOM)`, () => {
    const littleEndianBOM = (0xfe << 8) | 0xff;

    // prettier-ignore
    const input = new Uint8Array(new Uint16Array([
      littleEndianBOM,
      0xe4, 0x263a, 55361, 57102, 0xfe0f, 0x2601, 0xfe0f,
    ]).buffer);

    const expected = 'ä☺𠜎️☁️';

    const actual = utf16Decode(input, true);

    expect(actual).toEqual(expected);
  });

  it(`injects a replacement character when the input ends prematurely`, () => {
    // prettier-ignore
    const input = new Uint8Array([
      /* U+1F4A9 */ 0xd8, 0x3d, 0xdc, 0xa9,
      /* U+1F382 */ 0xd8, 
    ]);

    const expected = '💩�';

    const actual = utf16Decode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`injects a replacement character when the input ends with a high surrogate`, () => {
    // prettier-ignore
    const input = new Uint8Array([
      /* U+1F4A9 */ 0xd8, 0x3d, 0xdc, 0xa9,
      /* U+1F382 */ 0xd8, 0x3c,
    ]);

    const expected = '💩�';

    const actual = utf16Decode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`injects a replacement character when the input ends with a low surrogate`, () => {
    // prettier-ignore
    const input = new Uint8Array([
      /* U+1F4A9 */ 0xd8, 0x3d, 0xdc, 0xa9,
      /* U+1F382 */ 0xdf, 0x82,
    ]);

    const expected = '💩�';

    const actual = utf16Decode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`injects a replacement character when low surrogates precede high surrogates`, () => {
    // prettier-ignore
    const input = new Uint8Array([
      /* U+1F4A9 */ 0xd8, 0x3d, 0xdc, 0xa9,
      /* U+1F382 */ 0xdf, 0x82, 0xd8, 0x3c,  
      /* valid a */ 0, 97,
    ]);

    const expected = '💩�a';

    const actual = utf16Decode(input, false);

    expect(actual).toEqual(expected);
  });

  it(`injects a replacement character when high surrogates are not followed by low surrogates`, () => {
    // prettier-ignore
    const input = new Uint8Array([
      /* valid U+1F4A9 */ 0xd8, 0x3d, 0xdc, 0xa9,
      /* invalid U+1F382 */ 0xd8, 0x3c, 0x82, 0xdf,
      /* valid a */ 0, 97,
    ]);

    const expected = '💩�a';

    const actual = utf16Decode(input, false);

    expect(actual).toEqual(expected);
  });
});
