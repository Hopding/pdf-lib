import CharCodes from 'src/core/CharCodes';
import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFDict from 'src/core/objects/PDFDict';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import PDFStream from 'src/core/objects/PDFStream';
import PDFString from 'src/core/objects/PDFString';
import BaseParser from 'src/core/parser/BaseParser';
import PDFContext from 'src/core/PDFContext';
import { EndstreamEolChars, Keywords } from 'src/core/syntax/Keywords';
import { DigitChars, NumericChars } from 'src/core/syntax/Numeric';
import { charFromCode } from 'src/utils';

// TODO: Skip comments!
// TODO: Throw error if eof is reached before finishing object parse...
class PDFObjectParser extends BaseParser {
  static forBytes = (pdfBytes: Uint8Array, context = PDFContext.create()) =>
    new PDFObjectParser(pdfBytes, context);

  protected readonly context: PDFContext;

  constructor(pdfBytes: Uint8Array, context: PDFContext) {
    super(pdfBytes);
    this.context = context;
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
      return this.parseDictOrStream();
    }
    if (byte === CharCodes.LessThan) return this.parseHexString();
    if (byte === CharCodes.LeftParen) return this.parseString();
    if (byte === CharCodes.ForwardSlash) return this.parseName();
    if (byte === CharCodes.LeftSquareBracket) return this.parseArray();
    if (NumericChars.includes(byte)) return this.parseNumberOrRef();

    throw new Error('FIX ME!' + JSON.stringify(this.bytes.position()));
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
  // TODO: Handle all termination chars: https://github.com/Hopding/pdf-lib/blob/master/__tests__/core/pdf-parser/parseName.spec.ts#L36
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

    // Actually, "null" names (Just "/") are allowed
    // if (name.length === 0) throw new Error('FIX ME!');

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

  private parseDict(): PDFDict {
    this.bytes.next(); // Skip the first '<'
    this.bytes.next(); // Skip the second '<'

    const pdfDict = PDFDict.withContext(this.context);

    while (
      !this.bytes.done() &&
      this.bytes.peek() !== CharCodes.GreaterThan &&
      this.bytes.peekAhead(1) !== CharCodes.GreaterThan
    ) {
      this.skipWhitespace();
      const key = this.parseName();
      const value = this.parseObject();
      pdfDict.set(key, value);
      this.skipWhitespace();
    }

    this.skipWhitespace();
    this.bytes.next(); // Skip the first '>'
    this.bytes.next(); // Skip the second '>'

    return pdfDict;
  }

  private parseDictOrStream(): PDFDict | PDFStream {
    const dict = this.parseDict();

    this.skipWhitespace();
    if (this.matchKeyword(Keywords.stream)) {
      // Move past EOL markers
      const byte = this.bytes.peek();
      if (byte === CharCodes.Newline) this.bytes.next();
      if (byte === CharCodes.CarriageReturn) {
        this.bytes.next();
        if (this.bytes.peek() === CharCodes.Newline) this.bytes.next();
      }

      // this.matchKeyword([CharCodes.Newline]) ||
      //   this.matchKeyword([CharCodes.CarriageReturn, CharCodes.Newline]) ||
      //   this.matchKeyword(CharCodes.CarriageReturn);

      const contentsStart = this.bytes.offset();

      // TODO: Try to use dict's `Length` entry, but use this as backup...

      // Move to end of stream, while handling nested streams
      let nestingLvl = 1;
      while (!this.bytes.done()) {
        if (this.matchKeyword(Keywords.stream)) nestingLvl += 1;
        if (this.matchKeyword(Keywords.endstream)) nestingLvl -= 1;
        if (nestingLvl === 0) break;
        this.bytes.next();
      }

      let contentsEnd = this.bytes.offset() - Keywords.endstream.length;

      // `endstream` should be prefixed with \n or \r, so let's account for that
      if (EndstreamEolChars.includes(this.bytes.peekAt(contentsEnd - 1))) {
        contentsEnd -= 1;
      }

      const contents = this.bytes.slice(contentsStart, contentsEnd);

      return PDFRawStream.of(dict, contents);
    }

    return dict;
  }
}

export default PDFObjectParser;
