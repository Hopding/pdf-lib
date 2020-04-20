import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import {
  copyStringIntoBuffer,
  padStart,
  utf16Decode,
  pdfDocEncodingDecode,
  toCharCode,
} from 'src/utils';

class PDFString extends PDFObject {
  /**
   * Escape Char \ used with octal numbers in literal strings.
   */
  static escapeChar: string = '\\';

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

  /**
   * Converts the given string into a date object.
   * The specification of dates is found in the pdf spec in 7.9.4.
   */
  static toDate = (dateString: string) => {
    // Regex find and replace with capturing groups
    // From the most specified date to the least specified.

    // The default time zone is GMT which is UTC/Z in javascript
    // The default values for MM and DD are 01 the rest is 00. See spec.

    // D:YYYYMMDDHHmmSSOHH'mm (with optional last ' in the regex)
    const tillMinuteOffset: RegExp = /^D:(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)([+\-Z])(\d\d)'(\d\d)'?$/;
    const tillMinuteOffsetMatch = dateString.match(tillMinuteOffset);
    if (tillMinuteOffsetMatch) {
      const date = new Date(
        dateString.replace(tillMinuteOffset, '$1-$2-$3T$4:$5:$6Z'),
      );
      PDFString.takeOffsetIntoAccount(
        date,
        tillMinuteOffsetMatch[7],
        tillMinuteOffsetMatch[8],
        tillMinuteOffsetMatch[9],
      );
      return date;
    }
    // D:YYYYMMDDHHmmSSOHH
    const tillHourOffset: RegExp = /^D:(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)([+\-Z])(\d\d)$/;
    const tillHourOffsetMatch: RegExpMatchArray | null = dateString.match(
      tillHourOffset,
    );
    if (tillHourOffsetMatch) {
      const date = new Date(
        dateString.replace(tillHourOffset, '$1-$2-$3T$4:$5:$6Z'),
      );
      PDFString.takeOffsetIntoAccount(
        date,
        tillHourOffsetMatch[7],
        tillHourOffsetMatch[8],
        '0',
      );
      return date;
    }
    // D:YYYYMMDDHHmmSSO makes no sense since there is no offset.
    // D:YYYYMMDDHHmmSS
    const tillSeconds: RegExp = /^D:(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)Z?$/;
    if (dateString.match(tillSeconds)) {
      return new Date(dateString.replace(tillSeconds, '$1-$2-$3T$4:$5:$6Z'));
    }
    // D:YYYYMMDDHHmm
    const tillMinutes: RegExp = /^D:(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)$/;
    if (dateString.match(tillMinutes)) {
      return new Date(dateString.replace(tillMinutes, '$1-$2-$3T$4:$5:00Z'));
    }
    // D:YYYYMMDDHH
    const tillHours: RegExp = /^D:(\d{4})(\d\d)(\d\d)(\d\d)$/;
    if (dateString.match(tillHours)) {
      return new Date(dateString.replace(tillHours, '$1-$2-$3T$4:00:00Z'));
    }
    // D:YYYYMMDD
    const tillDay: RegExp = /^D:(\d{4})(\d\d)(\d\d)$/;
    if (dateString.match(tillDay)) {
      return new Date(dateString.replace(tillDay, '$1-$2-$3T00:00:00Z'));
    }
    // D:YYYYMM
    const tillMonth: RegExp = /^D:(\d{4})(\d\d)$/;
    if (dateString.match(tillMonth)) {
      return new Date(dateString.replace(tillMonth, '$1-$2-01T00:00:00Z'));
    }
    // D:YYYY
    const justYear: RegExp = /^D:(\d{4})$/;
    if (dateString.match(justYear)) {
      return new Date(dateString.replace(justYear, '$1-01-01T00:00:00Z'));
    }
    // Should not get here. String is not conform to specification!
    throw new Error(
      'The given date string does not conform to the pdf spec. The string was: ' +
        dateString,
    );
  };

  static takeOffsetIntoAccount = (
    date: Date,
    relation: string,
    hourOffset: string,
    minuteOffset: string,
  ) => {
    // The relation to UTC, can be either +, - or Z.
    // Javascript Date supports only UTC so offsets are added or subtracted.
    switch (relation) {
      case '+': // time is after UTC, so we offsets are subtracted
        date.setHours(date.getHours() - parseInt(hourOffset, 10));
        date.setMinutes(date.getMinutes() - parseInt(minuteOffset, 10));
        break;
      case '-': // time is before UTC, so we offsets are added
        date.setHours(date.getHours() + parseInt(hourOffset, 10));
        date.setMinutes(date.getMinutes() + parseInt(minuteOffset, 10));
        break;
      case 'Z':
        break;
    }
  };

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

  asBytes(): Uint8Array {
    const bytes: number[] = [];

    let octal = '';
    let escaped = false;

    const pushByte = (byte?: number) => {
      if (byte !== undefined) bytes.push(byte);
      escaped = false;
    };

    for (let idx = 0, len = this.value.length; idx < len; idx++) {
      const char = this.value[idx];
      const byte = toCharCode(char);
      const nextChar = this.value[idx + 1];
      if (!escaped) {
        if (byte === CharCodes.BackSlash) escaped = true;
        else pushByte(byte);
      } else {
        if (byte === CharCodes.Newline) pushByte();
        else if (byte === CharCodes.CarriageReturn) pushByte();
        else if (byte === CharCodes.n) pushByte(CharCodes.Newline);
        else if (byte === CharCodes.r) pushByte(CharCodes.CarriageReturn);
        else if (byte === CharCodes.t) pushByte(CharCodes.Tab);
        else if (byte === CharCodes.b) pushByte(CharCodes.Backspace);
        else if (byte === CharCodes.f) pushByte(CharCodes.FormFeed);
        else if (byte === CharCodes.LeftParen) pushByte(CharCodes.LeftParen);
        else if (byte === CharCodes.RightParen) pushByte(CharCodes.RightParen);
        else if (byte === CharCodes.Backspace) pushByte(CharCodes.BackSlash);
        else if (byte >= CharCodes.Zero && byte <= CharCodes.Seven) {
          octal += char;
          if (octal.length === 3 || !(nextChar >= '0' && nextChar <= '7')) {
            pushByte(parseInt(octal, 8));
            octal = '';
          }
        } else {
          pushByte(byte);
        }
      }
    }

    return new Uint8Array(bytes);
  }

  decodeText(): string {
    const bytes = this.asBytes();

    // Leading Byte Order Mark means it is a UTF-16BE encoded string.
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      return utf16Decode(bytes);
    }

    return pdfDocEncodingDecode(bytes);
  }

  decodeDate(): Date {
    return PDFString.toDate(this.value);
  }
}

export default PDFString;
