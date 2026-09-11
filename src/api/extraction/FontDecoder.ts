import { Encodings } from '../../packages/standard-fonts';

import PDFDict from '../../core/objects/PDFDict';
import PDFName from '../../core/objects/PDFName';
import PDFRawStream from '../../core/objects/PDFRawStream';
import PDFStream from '../../core/objects/PDFStream';
import PDFContext from '../../core/PDFContext';
import { decodePDFRawStream } from '../../core/streams/decode';
import PDFContentStream from '../../core/structures/PDFContentStream';
import { arrayAsString } from '../../utils';
import { HexStringOperand, LiteralStringOperand } from './types';
import { inferCodeByteLength, parseToUnicode } from './ToUnicode';

type StringOperand = HexStringOperand | LiteralStringOperand;

const winAnsiReverse = (() => {
  const map = new Map<number, number>();
  for (const cp of Encodings.WinAnsi.supportedCodePoints) {
    const { code } = Encodings.WinAnsi.encodeUnicodeCodePoint(cp);
    if (!map.has(code)) map.set(code, cp);
  }
  return map;
})();

export class FontDecoder {
  readonly fontFamily: string;
  private readonly toUnicode?: Map<number, string>;
  private readonly codeByteLength: number;
  private readonly simpleEncoding: Map<number, number> | undefined;

  private constructor(
    fontFamily: string,
    toUnicode: Map<number, string> | undefined,
    codeByteLength: number,
    simpleEncoding: Map<number, number> | undefined,
  ) {
    this.fontFamily = fontFamily;
    this.toUnicode = toUnicode;
    this.codeByteLength = codeByteLength;
    this.simpleEncoding = simpleEncoding;
  }

  static forFontDict(font: PDFDict, context: PDFContext): FontDecoder {
    const toUnicodeObj = font.lookup(PDFName.of('ToUnicode'));
    let toUnicode: Map<number, string> | undefined;
    let codeByteLength = 1;
    let cmapText = '';

    if (toUnicodeObj instanceof PDFStream) {
      const bytes = decodeStream(toUnicodeObj);
      cmapText = arrayAsString(bytes);
      toUnicode = parseToUnicode(cmapText);
      codeByteLength = inferCodeByteLength(cmapText, toUnicode);
    } else {
      // Type0 Identity-H without parsed cmap still uses 2-byte codes typically
      const subtype = font.lookup(PDFName.of('Subtype'));
      const encoding = font.lookup(PDFName.of('Encoding'));
      if (
        subtype === PDFName.of('Type0') ||
        encoding === PDFName.of('Identity-H')
      ) {
        codeByteLength = 2;
      }
    }

    const simpleEncoding = buildSimpleEncoding(font, context);
    const baseFont = font.lookup(PDFName.of('BaseFont'));
    const rawName =
      baseFont instanceof PDFName ? baseFont.decodeText() : 'Unknown';

    return new FontDecoder(
      stripSubsetPrefix(rawName),
      toUnicode,
      codeByteLength,
      simpleEncoding,
    );
  }

  decode(operand: StringOperand): string {
    const bytes = operand.bytes;
    let out = '';

    for (
      let i = 0;
      i + this.codeByteLength <= bytes.length;
      i += this.codeByteLength
    ) {
      let code = 0;
      for (let b = 0; b < this.codeByteLength; b++) {
        code = (code << 8) | bytes[i + b];
      }

      if (this.toUnicode) {
        const mapped = this.toUnicode.get(code);
        if (mapped !== undefined) {
          out += mapped;
          continue;
        }
      }

      if (this.simpleEncoding) {
        const cp = this.simpleEncoding.get(code);
        if (cp !== undefined) {
          out += String.fromCodePoint(cp);
          continue;
        }
      }

      // ASCII fallback for single-byte codes
      if (this.codeByteLength === 1 && code >= 0x20 && code <= 0x7e) {
        out += String.fromCharCode(code);
      }
    }

    return out;
  }
}

const decodeStream = (stream: PDFStream): Uint8Array => {
  if (stream instanceof PDFRawStream) {
    return decodePDFRawStream(stream).decode();
  }
  if (stream instanceof PDFContentStream) {
    return stream.getUnencodedContents();
  }
  return stream.getContents();
};

const buildSimpleEncoding = (
  font: PDFDict,
  _context: PDFContext,
): Map<number, number> | undefined => {
  const encoding = font.lookup(PDFName.of('Encoding'));
  if (encoding === PDFName.of('WinAnsiEncoding') || encoding === undefined) {
    // Standard 14 fonts often omit Encoding and imply WinAnsi
    const subtype = font.lookup(PDFName.of('Subtype'));
    if (
      encoding === PDFName.of('WinAnsiEncoding') ||
      subtype === PDFName.of('Type1') ||
      subtype === PDFName.of('TrueType') ||
      subtype === PDFName.of('MMType1')
    ) {
      return winAnsiReverse;
    }
  }
  if (encoding === PDFName.of('MacRomanEncoding')) {
    // Approximate with WinAnsi for v1 (close enough for common Latin)
    return winAnsiReverse;
  }
  return undefined;
};

const stripSubsetPrefix = (name: string): string => {
  const plus = name.indexOf('+');
  return plus >= 0 ? name.slice(plus + 1) : name;
};

export const isStringOperand = (value: unknown): value is StringOperand =>
  !!value &&
  typeof value === 'object' &&
  ((value as StringOperand).type === 'hexString' ||
    (value as StringOperand).type === 'string');
