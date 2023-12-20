import {
  PDFObjectParsingError,
  PDFStreamParsingError,
  Position,
  UnbalancedParenthesisError,
} from '../errors';
import PDFArray from '../objects/PDFArray';
import PDFBool from '../objects/PDFBool';
import PDFDict, { DictMap } from '../objects/PDFDict';
import PDFHexString from '../objects/PDFHexString';
import PDFName from '../objects/PDFName';
import PDFNull from '../objects/PDFNull';
import PDFNumber from '../objects/PDFNumber';
import PDFObject from '../objects/PDFObject';
import PDFRawStream from '../objects/PDFRawStream';
import PDFRef from '../objects/PDFRef';
import PDFStream from '../objects/PDFStream';
import PDFString from '../objects/PDFString';
import BaseParser from './BaseParser';
import ByteStream from './ByteStream';
import PDFContext from '../PDFContext';
import PDFCatalog from '../structures/PDFCatalog';
import PDFPageLeaf from '../structures/PDFPageLeaf';
import PDFPageTree from '../structures/PDFPageTree';
import CharCodes from '../syntax/CharCodes';
import { IsDelimiter } from '../syntax/Delimiters';
import { Keywords } from '../syntax/Keywords';
import { IsDigit, IsNumeric } from '../syntax/Numeric';
import { IsWhitespace } from '../syntax/Whitespace';
import { charFromCode } from '../../utils';
import { CipherTransformFactory } from '../crypto';

// TODO: Throw error if eof is reached before finishing object parse...
class PDFObjectParser extends BaseParser {
  static forBytes = (
    bytes: Uint8Array,
    context: PDFContext,
    capNumbers?: boolean,
  ) => new PDFObjectParser(ByteStream.of(bytes), context, capNumbers);

  static forByteStream = (
    byteStream: ByteStream,
    context: PDFContext,
    capNumbers = false,
  ) => new PDFObjectParser(byteStream, context, capNumbers);

  protected readonly context: PDFContext;
  private readonly cryptoFactory?: CipherTransformFactory;

  constructor(
    byteStream: ByteStream,
    context: PDFContext,
    capNumbers = false,
    cryptoFactory?: CipherTransformFactory,
  ) {
    super(byteStream, capNumbers);
    this.context = context;
    this.cryptoFactory = cryptoFactory;
  }

  // TODO: Is it possible to reduce duplicate parsing for ref lookaheads?
  parseObject(ref?: PDFRef): PDFObject {
    this.skipWhitespaceAndComments();

    if (this.matchKeyword(Keywords.true)) return PDFBool.True;
    if (this.matchKeyword(Keywords.false)) return PDFBool.False;
    if (this.matchKeyword(Keywords.null)) return PDFNull;

    const byte = this.bytes.peek();

    if (
      byte === CharCodes.LessThan &&
      this.bytes.peekAhead(1) === CharCodes.LessThan
    ) {
      return this.parseDictOrStream(ref);
    }
    if (byte === CharCodes.LessThan) return this.parseHexString(ref);
    if (byte === CharCodes.LeftParen) return this.parseString(ref);
    if (byte === CharCodes.ForwardSlash) return this.parseName();
    if (byte === CharCodes.LeftSquareBracket) return this.parseArray(ref);
    if (IsNumeric[byte]) return this.parseNumberOrRef();

    throw new PDFObjectParsingError(this.bytes.position(), byte);
  }

  protected parseNumberOrRef(): PDFNumber | PDFRef {
    const firstNum = this.parseRawNumber();
    this.skipWhitespaceAndComments();

    const lookaheadStart = this.bytes.offset();
    if (IsDigit[this.bytes.peek()]) {
      const secondNum = this.parseRawNumber();
      this.skipWhitespaceAndComments();
      if (this.bytes.peek() === CharCodes.R) {
        this.bytes.assertNext(CharCodes.R);
        return PDFRef.of(firstNum, secondNum);
      }
    }

    this.bytes.moveTo(lookaheadStart);
    return PDFNumber.of(firstNum);
  }

  // TODO: Maybe update PDFHexString.of() logic to remove whitespace and validate input?
  protected parseHexString(ref?: PDFRef): PDFHexString {
    let value = '';

    this.bytes.assertNext(CharCodes.LessThan);
    while (!this.bytes.done() && this.bytes.peek() !== CharCodes.GreaterThan) {
      value += charFromCode(this.bytes.next());
    }
    this.bytes.assertNext(CharCodes.GreaterThan);

    if (this.cryptoFactory && ref) {
      const transformer = this.cryptoFactory.createCipherTransform(
        ref.objectNumber,
        ref.generationNumber,
      );
      const arr = transformer.decryptBytes(PDFHexString.of(value).asBytes());
      value = arr.reduce(
        (str: string, byte: number) => str + byte.toString(16).padStart(2, '0'),
        '',
      );
    }

    return PDFHexString.of(value);
  }

  protected parseString(ref?: PDFRef): PDFString {
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
        let actualValue = value.substring(1, value.length - 1);

        if (this.cryptoFactory && ref) {
          const transformer = this.cryptoFactory.createCipherTransform(
            ref.objectNumber,
            ref.generationNumber,
          );
          actualValue = transformer.decryptString(actualValue);
        }
        // Remove the outer parens so they aren't part of the contents
        return PDFString.of(actualValue);
      }
    }

    throw new UnbalancedParenthesisError(this.bytes.position());
  }

  // TODO: Compare performance of string concatenation to charFromCode(...bytes)
  // TODO: Maybe preallocate small Uint8Array if can use charFromCode?
  protected parseName(): PDFName {
    this.bytes.assertNext(CharCodes.ForwardSlash);

    let name = '';
    while (!this.bytes.done()) {
      const byte = this.bytes.peek();
      if (IsWhitespace[byte] || IsDelimiter[byte]) break;
      name += charFromCode(byte);
      this.bytes.next();
    }

    return PDFName.of(name);
  }

  protected parseArray(ref?: PDFRef): PDFArray {
    this.bytes.assertNext(CharCodes.LeftSquareBracket);
    this.skipWhitespaceAndComments();

    const pdfArray = PDFArray.withContext(this.context);
    while (this.bytes.peek() !== CharCodes.RightSquareBracket) {
      const element = this.parseObject(ref);
      pdfArray.push(element);
      this.skipWhitespaceAndComments();
    }
    this.bytes.assertNext(CharCodes.RightSquareBracket);
    return pdfArray;
  }

  protected parseDict(ref?: PDFRef): PDFDict {
    this.bytes.assertNext(CharCodes.LessThan);
    this.bytes.assertNext(CharCodes.LessThan);
    this.skipWhitespaceAndComments();

    const dict: DictMap = new Map();

    while (
      !this.bytes.done() &&
      this.bytes.peek() !== CharCodes.GreaterThan &&
      this.bytes.peekAhead(1) !== CharCodes.GreaterThan
    ) {
      const key = this.parseName();
      const value = this.parseObject(ref);
      dict.set(key, value);
      this.skipWhitespaceAndComments();
    }

    this.skipWhitespaceAndComments();
    this.bytes.assertNext(CharCodes.GreaterThan);
    this.bytes.assertNext(CharCodes.GreaterThan);

    const Type = dict.get(PDFName.of('Type'));

    if (Type === PDFName.of('Catalog')) {
      return PDFCatalog.fromMapWithContext(dict, this.context);
    } else if (Type === PDFName.of('Pages')) {
      return PDFPageTree.fromMapWithContext(dict, this.context);
    } else if (Type === PDFName.of('Page')) {
      return PDFPageLeaf.fromMapWithContext(dict, this.context);
    } else {
      return PDFDict.fromMapWithContext(dict, this.context);
    }
  }

  protected parseDictOrStream(ref?: PDFRef): PDFDict | PDFStream {
    const startPos = this.bytes.position();

    const dict = this.parseDict(ref);

    this.skipWhitespaceAndComments();

    if (
      !this.matchKeyword(Keywords.streamEOF1) &&
      !this.matchKeyword(Keywords.streamEOF2) &&
      !this.matchKeyword(Keywords.streamEOF3) &&
      !this.matchKeyword(Keywords.streamEOF4) &&
      !this.matchKeyword(Keywords.stream)
    ) {
      return dict;
    }

    const start = this.bytes.offset();
    let end: number;

    const Length = dict.get(PDFName.of('Length'));
    if (Length instanceof PDFNumber) {
      end = start + Length.asNumber();
      this.bytes.moveTo(end);
      this.skipWhitespaceAndComments();
      if (!this.matchKeyword(Keywords.endstream)) {
        this.bytes.moveTo(start);
        end = this.findEndOfStreamFallback(startPos);
      }
    } else {
      end = this.findEndOfStreamFallback(startPos);
    }

    let contents = this.bytes.slice(start, end);

    if (this.cryptoFactory && ref) {
      const transform = this.cryptoFactory.createCipherTransform(
        ref.objectNumber,
        ref.generationNumber,
      );
      contents = transform.decryptBytes(contents);
    }

    return PDFRawStream.of(dict, contents);
  }

  protected findEndOfStreamFallback(startPos: Position) {
    // Move to end of stream, while handling nested streams
    let nestingLvl = 1;
    let end = this.bytes.offset();

    while (!this.bytes.done()) {
      end = this.bytes.offset();

      if (this.matchKeyword(Keywords.stream)) {
        nestingLvl += 1;
      } else if (
        this.matchKeyword(Keywords.EOF1endstream) ||
        this.matchKeyword(Keywords.EOF2endstream) ||
        this.matchKeyword(Keywords.EOF3endstream) ||
        this.matchKeyword(Keywords.endstream)
      ) {
        nestingLvl -= 1;
      } else {
        this.bytes.next();
      }

      if (nestingLvl === 0) break;
    }

    if (nestingLvl !== 0) throw new PDFStreamParsingError(startPos);

    return end;
  }
}

export default PDFObjectParser;
