import CharCodes from 'src/core/CharCodes';
import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
// import PDFDict from 'src/core/objects/PDFDict';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRef from 'src/core/objects/PDFRef';
// import PDFStream from 'src/core/objects/PDFStream';
import PDFString from 'src/core/objects/PDFString';
import ByteStream from 'src/core/parser/ByteStream';
import PDFContext from 'src/core/PDFContext';
import { charFromCode } from 'src/utils';

const WhitespaceChars = [
  CharCodes.Null,
  CharCodes.Tab,
  CharCodes.Newline,
  CharCodes.FormFeed,
  CharCodes.CarriageReturn,
  CharCodes.Space,
];

const DigitChars = [
  CharCodes.Zero,
  CharCodes.One,
  CharCodes.Two,
  CharCodes.Three,
  CharCodes.Four,
  CharCodes.Five,
  CharCodes.Six,
  CharCodes.Seven,
  CharCodes.Eight,
  CharCodes.Nine,
];

const NumericPrefixChars = [CharCodes.Period, CharCodes.Plus, CharCodes.Minus];

const NumericChars = [...NumericPrefixChars, ...DigitChars];

const Keywords = {
  true: [CharCodes.t, CharCodes.r, CharCodes.u, CharCodes.e],
  false: [CharCodes.f, CharCodes.a, CharCodes.l, CharCodes.s, CharCodes.e],
  null: [CharCodes.n, CharCodes.u, CharCodes.l, CharCodes.l],
};

// TODO: Skip comments!
class PDFParser {
  static forBytes = (pdfBytes: Uint8Array) => new PDFParser(pdfBytes);

  private readonly context: PDFContext;
  private readonly bytes: ByteStream;

  constructor(pdfBytes: Uint8Array) {
    this.context = PDFContext.create();
    this.bytes = ByteStream.of(pdfBytes);
  }

  // TODO: Is it possible to reduce duplicate parsing for ref lookaheads?
  // TODO: Maybe throw parsing error
  parseObject(): PDFObject {
    this.skipWhitespace();

    if (this.matchKeyword(Keywords.true)) return PDFBool.True;
    if (this.matchKeyword(Keywords.false)) return PDFBool.False;
    if (this.matchKeyword(Keywords.null)) return PDFNull;

    const byte = this.bytes.peek();

    if (
      byte === CharCodes.LessThan &&
      this.bytes.peekAhead(1) === CharCodes.LessThan
    ) {
      // return this.parseDictOrStream();
    }
    if (byte === CharCodes.LessThan) return this.parseHexString();
    if (byte === CharCodes.LeftParen) return this.parseString();
    if (byte === CharCodes.ForwardSlash) return this.parseName();
    if (byte === CharCodes.LeftSquareBracket) return this.parseArray();
    if (NumericChars.includes(byte)) return this.parseNumberOrRef();

    throw new Error('FIX ME!' + JSON.stringify(this.bytes.position()));
  }

  // TODO: Maybe handle exponential format?
  // TODO: Compare performance of string concatenation to charFromCode(...bytes)
  private parseRawNumber(): number {
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

  private parseNumberOrRef(): PDFNumber | PDFRef {
    const firstNum = this.parseRawNumber();
    this.skipWhitespace();

    const lookaheadStart = this.bytes.offset();
    if (DigitChars.includes(this.bytes.peek())) {
      const secondNum = this.parseRawNumber();
      this.skipWhitespace();
      if (this.bytes.peek() === CharCodes.R) {
        this.bytes.next();
        return PDFRef.of(firstNum, secondNum);
      }
    }

    this.bytes.moveTo(lookaheadStart);
    return PDFNumber.of(firstNum);
  }

  // TODO: Maybe update PDFHexString.of() logic to remove whitespace and validate input?
  private parseHexString(): PDFHexString {
    this.bytes.next(); // Move past the leading '<'

    let value = '';

    while (!this.bytes.done() && this.bytes.peek() !== CharCodes.GreaterThan) {
      value += charFromCode(this.bytes.next());
    }

    // TODO: Assert presence of '>' here, throw error if not present
    this.bytes.next(); // Move past the ending '>'

    return PDFHexString.of(value);
  }

  private parseString(): PDFString {
    let nestingLvl = 0;
    let isEscaped = false;
    let value = '';

    while (!this.bytes.done()) {
      const byte = this.bytes.next();
      value += charFromCode(byte);

      // Check for unescaped parenthesis
      if (!isEscaped) {
        if (byte === CharCodes.LeftParen) nestingLvl += 1;
        if (byte === CharCodes.RightParen) nestingLvl -= 1;
      }

      // Track whether current character is being escaped or not
      if (byte === CharCodes.BackSlash) {
        isEscaped = !isEscaped;
      } else if (isEscaped) {
        isEscaped = false;
      }

      // Once (if) the unescaped parenthesis balance out, return their contents
      if (nestingLvl === 0) {
        // Remove the outer parens so they aren't part of the contents
        return PDFString.of(value.substring(1, value.length - 1));
      }
    }

    throw new Error('FIX ME!');
  }

  // TODO: Compare performance of string concatenation to charFromCode(...bytes)
  private parseName(): PDFName {
    this.bytes.next(); // Skip the leading '/'

    let name = '';
    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (
        byte === CharCodes.ForwardSlash ||
        byte < CharCodes.ExclamationPoint ||
        byte > CharCodes.Tilde
      ) {
        break;
      }
      name += charFromCode(byte);
      this.bytes.next();
    }
    if (name.length === 0) throw new Error('FIX ME!');
    return PDFName.of(name);
  }

  private parseArray(): PDFArray {
    this.bytes.next(); // Move past the leading '['

    const pdfArray = PDFArray.withContext(this.context);
    while (this.bytes.peek() !== CharCodes.RightSquareBracket) {
      const element = this.parseObject();
      pdfArray.push(element);
      this.skipWhitespace();
    }
    this.bytes.next();
    return pdfArray;
  }

  // private parseDict(): PDFDict {}

  // private parseDictOrStream(): PDFDict | PDFStream {}

  private skipWhitespace(): void {
    while (!this.bytes.done() && WhitespaceChars.includes(this.bytes.peek())) {
      this.bytes.next();
    }
  }

  private matchKeyword(keyword: number[]): boolean {
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

export default PDFParser;
