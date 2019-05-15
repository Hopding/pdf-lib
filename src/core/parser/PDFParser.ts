import CharCodes from 'src/core/CharCodes';
import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRef from 'src/core/objects/PDFRef';
import ByteStream from 'src/core/parser/ByteStream';
import PDFContext from 'src/core/PDFContext';

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

const NumericChars = [
  CharCodes.Plus,
  CharCodes.Minus,
  CharCodes.Period,
  ...DigitChars,
];

const Keywords = {
  true: [CharCodes.t, CharCodes.r, CharCodes.u, CharCodes.e],
  false: [CharCodes.f, CharCodes.a, CharCodes.l, CharCodes.s, CharCodes.e],
  null: [CharCodes.n, CharCodes.u, CharCodes.l, CharCodes.l],
};

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

    if (NumericChars.includes(byte)) return this.parseNumberOrRef();

    // if (NumericChars.includes(byte)) return this.parseNumber();

    this.bytes.next();
    if (byte === CharCodes.ForwardSlash) return this.parseName();
    if (byte === CharCodes.LeftSquareBracket) return this.parseArray();

    throw new Error('FIX ME!' + JSON.stringify(this.bytes.position()));
  }

  private parseRawNumber(): number {
    let value = '';
    while (!this.bytes.done() && NumericChars.includes(this.bytes.peek())) {
      value += String.fromCharCode(this.bytes.next());
    }
    return Number(value);
  }

  // TODO: Handle smashed numbers: 0.01.123 => [0.01, 0.0123]
  // TODO: Maybe handle exponential format?
  // TODO: Compare performance of string concatenation to String.fromCharCode(...bytes)
  // private parseNumber(): PDFNumber {
  //   let value = '';
  //   while (!this.bytes.done() && NumericChars.includes(this.bytes.peek())) {
  //     value += String.fromCharCode(this.bytes.next());
  //   }
  //   return PDFNumber.of(Number(value));
  // }

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

  // TODO: Compare performance of string concatenation to String.fromCharCode(...bytes)
  private parseName(): PDFName {
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
      name += String.fromCharCode(byte);
      this.bytes.next();
    }
    if (name.length === 0) throw new Error('FIX ME!');
    return PDFName.of(name);
  }

  private parseArray(): PDFArray {
    const pdfArray = PDFArray.withContext(this.context);
    while (this.bytes.peek() !== CharCodes.RightSquareBracket) {
      const element = this.parseObject();
      pdfArray.push(element);
      this.skipWhitespace();
    }
    this.bytes.next();
    return pdfArray;
  }

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
