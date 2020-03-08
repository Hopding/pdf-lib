import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer, padStart } from 'src/utils';

class PDFString extends PDFObject {
  // The PDF spec allows newlines and parens to appear directly within a literal
  // string. These character _may_ be escaped. But they do not _have_ to be. So
  // for simplicity, we will not bother escaping them.
  static of = (value: string) => new PDFString(value);

  static fromDate = (date: Date) => {
    const year = padStart(String(date.getUTCFullYear()), 4, '0');
    const month = padStart(String(date.getUTCMonth() + 1), 2, '0');
    const day = padStart(String(date.getUTCDate()), 2, '0');
    const hours = padStart(String(date.getUTCHours()), 2, '0');
    const mins = padStart(String(date.getUTCMinutes()), 2, '0');
    const secs = padStart(String(date.getUTCSeconds()), 2, '0');
    return new PDFString(`D:${year}${month}${day}${hours}${mins}${secs}Z`);
  };

  static toDate = (dateString: string) =>
    // Regex find and replace with capturing groups
    // For Example: (D:20180624015837Z) --> 2018-06-24T01:58:37Z
    // TODO not all possible variations from the spec are supported yet (see 7.9.4)
    new Date(
      dateString.replace(
        /^D:(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)Z$/,
        '$1-$2-$3T$4:$5:$6Z',
      ),
    );

  private readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  clone(): PDFString {
    return PDFString.of(this.value);
  }

  toString(): string {
    return `(${this.value})`;
  }

  sizeInBytes(): number {
    return this.value.length + 2;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    buffer[offset++] = CharCodes.LeftParen;
    offset += copyStringIntoBuffer(this.value, buffer, offset);
    buffer[offset++] = CharCodes.RightParen;
    return this.value.length + 2;
  }

  decodeText(): string {
    console.log('Literal text pdf object found: ', this.value);
    // þÿ is the bom (254,255) i.e. FEFF in hex as literal text.
    if (this.value.startsWith('þÿ')) {
      // TODO add testcase for this scenario
      // TODO decode utf-16 string if needed (use codePointAt for each char and call utf-16 decode)
      throw new Error('Literal Text encoded as utf-16 found');
    }
    // TODO check if any decoding is needed. The current testcase seems fine.
    return this.value;
  }

  decodeDate(): Date {
    return PDFString.toDate(this.value);
  }
}

export default PDFString;
