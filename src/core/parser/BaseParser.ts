import { NumberParsingError } from 'src/core/errors';
import ByteStream from 'src/core/parser/ByteStream';
import CharCodes from 'src/core/syntax/CharCodes';
import { IsDigit, IsNumeric } from 'src/core/syntax/Numeric';
import { IsWhitespace } from 'src/core/syntax/Whitespace';
import { charFromCode } from 'src/utils';

const { Newline, CarriageReturn } = CharCodes;

// TODO: Throw error if eof is reached before finishing object parse...
class BaseParser {
  protected readonly bytes: ByteStream;
  protected readonly capNumbers: boolean;

  constructor(bytes: ByteStream, capNumbers = false) {
    this.bytes = bytes;
    this.capNumbers = capNumbers;
  }

  protected parseRawInt(): number {
    let value = '';

    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (!IsDigit[byte]) break;
      value += charFromCode(this.bytes.next());
    }

    const numberValue = Number(value);

    if (!value || !isFinite(numberValue)) {
      throw new NumberParsingError(this.bytes.position(), value);
    }

    return numberValue;
  }

  // TODO: Maybe handle exponential format?
  // TODO: Compare performance of string concatenation to charFromCode(...bytes)
  protected parseRawNumber(): number {
    let value = '';

    // Parse integer-part, the leading (+ | - | . | 0-9)
    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (!IsNumeric[byte]) break;
      value += charFromCode(this.bytes.next());
      if (byte === CharCodes.Period) break;
    }

    // Parse decimal-part, the trailing (0-9)
    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (!IsDigit[byte]) break;
      value += charFromCode(this.bytes.next());
    }

    const numberValue = Number(value);

    if (!value || !isFinite(numberValue)) {
      throw new NumberParsingError(this.bytes.position(), value);
    }

    if (numberValue > Number.MAX_SAFE_INTEGER) {
      if (this.capNumbers) {
        const msg = `Parsed number that is too large for some PDF readers: ${value}, using Number.MAX_SAFE_INTEGER instead.`;
        console.warn(msg);
        return Number.MAX_SAFE_INTEGER;
      } else {
        const msg = `Parsed number that is too large for some PDF readers: ${value}, not capping.`;
        console.warn(msg);
      }
    }

    return numberValue;
  }

  protected skipWhitespace(): void {
    while (!this.bytes.done() && IsWhitespace[this.bytes.peek()]) {
      this.bytes.next();
    }
  }

  protected skipLine(): void {
    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (byte === Newline || byte === CarriageReturn) return;
      this.bytes.next();
    }
  }

  protected skipComment(): boolean {
    if (this.bytes.peek() !== CharCodes.Percent) return false;
    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (byte === Newline || byte === CarriageReturn) return true;
      this.bytes.next();
    }
    return true;
  }

  protected skipWhitespaceAndComments(): void {
    this.skipWhitespace();
    while (this.skipComment()) this.skipWhitespace();
  }

  protected matchKeyword(keyword: number[]): boolean {
    const initialOffset = this.bytes.offset();
    for (let idx = 0, len = keyword.length; idx < len; idx++) {
      if (this.bytes.done() || this.bytes.next() !== keyword[idx]) {
        this.bytes.moveTo(initialOffset);
        return false;
      }
    }
    return true;
  }
}

export default BaseParser;
