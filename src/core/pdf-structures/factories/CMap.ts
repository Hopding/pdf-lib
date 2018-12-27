import { toHexStringOfMinLength } from 'utils';

export const cmapCodePointFormat = (codePoint: number) => {
  if (isUtf8CodePoint(codePoint)) {
    return toHexStringOfMinLength(codePoint, 4);
  }

  if (isUtf16CodePoint(codePoint)) {
    const hs = highSurrogate(codePoint);
    const ls = lowSurrogate(codePoint);
    const hsStr = toHexStringOfMinLength(hs, 4);
    const lsStr = toHexStringOfMinLength(ls, 4);
    return `${hsStr}${lsStr}`;
  }

  const hex = codePoint.toString(16);
  const msg = `0x${hex} is not a valid UTF-8 or UTF-16 codepoint.`;
  throw new Error(msg);
};

// From: https://en.wikipedia.org/wiki/UTF-16#Description
const isUtf8CodePoint = (codePoint: number) =>
  codePoint >= 0 && codePoint <= 0xffff;

// From: https://en.wikipedia.org/wiki/UTF-16#Description
const isUtf16CodePoint = (codePoint: number) =>
  codePoint >= 0x010000 && codePoint <= 0x10ffff;

// From Unicode 3.0 spec, section 3.7:
//   http://unicode.org/versions/Unicode3.0.0/ch03.pdf
const highSurrogate = (codePoint: number) =>
  Math.floor((codePoint - 0x10000) / 0x400) + 0xd800;

// From Unicode 3.0 spec, section 3.7:
//   http://unicode.org/versions/Unicode3.0.0/ch03.pdf
const lowSurrogate = (codePoint: number) =>
  ((codePoint - 0x10000) % 0x400) + 0xdc00;
