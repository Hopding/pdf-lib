import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer, padStart, utf16Decode } from 'src/utils';
import { PDFDocEncoding } from 'src/utils/PDFDocEncoding';

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

  decodeText(): string {
    if (!this.value.includes(PDFString.escapeChar)) {
      // No escaped sequences means no decoding needed.
      return this.value;
    }
    // \376\377 is the bom (254,255) in octal.
    if (this.value.startsWith('\\376\\377')) {
      // decode with UTF16-BE
      return this.decodeTextWithEscapings(
        this.value,
        (escapedStringPart: string) =>
          utf16Decode(
            new Uint16Array(this.convertOctalToBytes(escapedStringPart)),
            true,
          ),
      );
    }
    // decode with PDFDocEncoding
    return this.decodeTextWithEscapings(
      this.value,
      (escapedStringPart: string) =>
        PDFDocEncoding.decode(this.convertOctalToBytes(escapedStringPart)),
    );
  }

  decodeDate(): Date {
    return PDFString.toDate(this.value);
  }

  private decodeTextWithEscapings(
    valueWithEscapings: string,
    decodingFunction: (escapedStringPart: string) => string,
  ): string {
    let result = '';
    for (let i = 0; i < valueWithEscapings.length; i++) {
      const char: string = valueWithEscapings.charAt(i);
      if (char === PDFString.escapeChar) {
        const sequenceResult = this.handleEscapedSequence(
          valueWithEscapings,
          i,
          decodingFunction,
        );
        result += sequenceResult.result;
        i = sequenceResult.newIndex;
      } else {
        result += char;
      }
    }
    return result;
  }

  private convertOctalToBytes(value: string): number[] {
    return (
      value
        .split(PDFString.escapeChar)
        // ignore emptry string
        .filter((octaclNumber) => octaclNumber)
        .map((octalNumber) => parseInt(octalNumber, 8))
    );
  }

  private handleEscapedSequence(
    valueWithEscapings: string,
    i: number,
    decodingFunction: (escapedStringPart: string) => string,
  ) {
    const start = i;
    while (i < valueWithEscapings.length) {
      i += 4;
      const char: string = valueWithEscapings.charAt(i);
      if (char !== PDFString.escapeChar) {
        return {
          newIndex: i,
          result: decodingFunction(valueWithEscapings.substring(start, i)),
        };
      }
    }
    // Should not happen since after a backslash there should be at least 3 chars.
    throw new Error();
  }
}

export default PDFString;
