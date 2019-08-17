import PDFObject from 'src/core/objects/PDFObject';
import { copyStringIntoBuffer, toHexStringOfMinLength } from 'src/utils';
import utfx = require('utfx');

class PDFString extends PDFObject {
  // The PDF spec allows newlines and parens to appear directly within a literal
  // string. These character _may_ be escaped. But they do not _have_ to be. So
  // for simplicity, we will not bother escaping them.
  static of = (value: string) => new PDFString(value, false);

  private readonly value: string;

  private constructor(value: string, encoded: boolean) {
    super();
    this.value = encoded ? value : PDFString.encode(value);
  }

  clone(): PDFString {
    return new PDFString(this.value, true);
  }

  toString(): string {
    return this.value;
  }

  sizeInBytes(): number {
    return this.value.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    return copyStringIntoBuffer(this.value, buffer, offset);
  }

  private static encode(s: string): string {
    for (var i = 0; i < s.length; i++) {
      if (s.charCodeAt(i) > 127) {
        return PDFString.hexEncode(s);
      }
    }
    return `(${s})`;
  }

  private static hexEncode(s: string): string {
    var text = "<FEFF";
    utfx.UTF8toUTF16(utfx.stringSource(s), (cp: number) => {
        text += toHexStringOfMinLength(cp, 4);
    });
    return text + ">";
  }
}

export default PDFString;
