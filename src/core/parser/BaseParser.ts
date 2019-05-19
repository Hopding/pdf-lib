import ByteStream from 'src/core/parser/ByteStream';
import CharCodes from 'src/core/syntax/CharCodes';
import { DigitChars, NumericChars } from 'src/core/syntax/Numeric';
import { WhitespaceChars } from 'src/core/syntax/Whitespace';
import { charFromCode } from 'src/utils';

const { Newline, CarriageReturn } = CharCodes;

// TODO: Skip comments!
// TODO: Throw error if eof is reached before finishing object parse...
class BaseParser {
  protected readonly bytes: ByteStream;

  constructor(pdfBytes: Uint8Array) {
    this.bytes = ByteStream.of(pdfBytes);
  }

  protected parseRawInt(): number {
    let value = '';

    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (!DigitChars.includes(byte)) break;
      value += charFromCode(this.bytes.next());
    }

    return Number(value);
  }

  // TODO: Maybe handle exponential format?
  // TODO: Compare performance of string concatenation to charFromCode(...bytes)
  protected parseRawNumber(): number {
    let value = '';

    // Parse integer-part, the leading (+ | - | . | 0-9)
    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (!NumericChars.includes(byte)) break;
      value += charFromCode(this.bytes.next());
      if (byte === CharCodes.Period) break;
    }

    // Parse decimal-part, the trailing (0-9)
    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (!DigitChars.includes(byte)) break;
      value += charFromCode(this.bytes.next());
    }

    return Number(value);
  }

  protected skipWhitespace(): void {
    while (!this.bytes.done() && WhitespaceChars.includes(this.bytes.peek())) {
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
