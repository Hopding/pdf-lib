import PDFCrossRefSection from 'src/core/document/PDFCrossRefSection';
import PDFHeader from 'src/core/document/PDFHeader';
import PDFTrailer from 'src/core/document/PDFTrailer';
import {
  MissingKeywordError,
  MissingPDFHeaderError,
  ReparseError,
  StalledParserError,
} from 'src/core/errors';
import PDFInvalidObject from 'src/core/objects/PDFInvalidObject';
import PDFRef from 'src/core/objects/PDFRef';
import ByteStream from 'src/core/parser/ByteStream';
import PDFObjectParser from 'src/core/parser/PDFObjectParser';
import PDFContext from 'src/core/PDFContext';
import CharCodes from 'src/core/syntax/CharCodes';
import { Keywords } from 'src/core/syntax/Keywords';
import { DigitChars } from 'src/core/syntax/Numeric';

class PDFParser extends PDFObjectParser {
  static forBytes = (pdfBytes: Uint8Array) => new PDFParser(pdfBytes);

  alreadyParsed = false;

  constructor(pdfBytes: Uint8Array) {
    super(ByteStream.of(pdfBytes), PDFContext.create());
  }

  // TODO: Handle XRef Stream trailers!
  // TODO: Throw error if missing trailer or catalog!
  parseDocument(): PDFContext {
    if (this.alreadyParsed) throw new ReparseError();
    this.alreadyParsed = true;

    this.context.header = this.parseHeader();

    let prevOffset;
    while (!this.bytes.done()) {
      this.parseDocumentSection();
      const offset = this.bytes.offset();
      if (offset === prevOffset) {
        throw new StalledParserError(this.bytes.position());
      }
      prevOffset = offset;
    }

    return this.context;
  }

  private parseHeader(): PDFHeader {
    while (!this.bytes.done()) {
      if (this.matchKeyword(Keywords.header)) {
        const major = this.parseRawInt();
        this.bytes.assertNext(CharCodes.Period);
        const minor = this.parseRawInt();
        const header = PDFHeader.forVersion(major, minor);
        this.skipBinaryHeaderComment();
        return header;
      }
      this.bytes.next();
    }

    throw new MissingPDFHeaderError(this.bytes.position());
  }

  private parseIndirectObjectHeader(): PDFRef {
    this.skipWhitespaceAndComments();
    const objectNumber = this.parseRawInt();

    this.skipWhitespaceAndComments();
    const generationNumber = this.parseRawInt();

    this.skipWhitespaceAndComments();
    if (!this.matchKeyword(Keywords.obj)) {
      throw new MissingKeywordError(this.bytes.position(), Keywords.obj);
    }

    return PDFRef.of(objectNumber, generationNumber);
  }

  private parseIndirectObject(): PDFRef {
    const ref = this.parseIndirectObjectHeader();

    this.skipWhitespaceAndComments();
    const object = this.parseObject();

    this.skipWhitespaceAndComments();
    if (!this.matchKeyword(Keywords.endobj)) {
      throw new MissingKeywordError(this.bytes.position(), Keywords.endobj);
    }

    this.context.assign(ref, object);

    return ref;
  }

  // TODO: Improve and clean this up
  private tryToParseInvalidIndirectObject() {
    const ref = this.parseIndirectObjectHeader();

    this.skipWhitespaceAndComments();
    const start = this.bytes.offset();

    let failed = true;
    while (!this.bytes.done()) {
      if (this.matchKeyword(Keywords.endobj)) {
        failed = false;
      }
      if (!failed) break;
      this.bytes.next();
    }

    if (failed) throw new Error('FIX ME');

    const end = this.bytes.offset() - Keywords.endobj.length;

    const object = PDFInvalidObject.of(this.bytes.slice(start, end));
    this.context.assign(ref, object);

    return ref;
  }

  private parseIndirectObjects(): void {
    this.skipWhitespaceAndComments();
    while (!this.bytes.done() && DigitChars.includes(this.bytes.peek())) {
      const initialOffset = this.bytes.offset();
      try {
        this.parseIndirectObject();
      } catch (e) {
        // TODO: Add tracing/logging mechanism to track when this happens!
        this.bytes.moveTo(initialOffset);
        this.tryToParseInvalidIndirectObject();
      }
      this.skipWhitespaceAndComments();
    }
  }

  private maybeParseCrossRefSection(): PDFCrossRefSection | void {
    this.skipWhitespaceAndComments();
    if (!this.matchKeyword(Keywords.xref)) return;
    this.skipWhitespaceAndComments();

    let objectNumber = -1;
    const xref = PDFCrossRefSection.createEmpty();

    while (!this.bytes.done() && DigitChars.includes(this.bytes.peek())) {
      const firstInt = this.parseRawInt();
      this.skipWhitespaceAndComments();

      const secondInt = this.parseRawInt();
      this.skipWhitespaceAndComments();

      const byte = this.bytes.peek();
      if (byte === CharCodes.n || byte === CharCodes.f) {
        const ref = PDFRef.of(objectNumber, secondInt);
        if (this.bytes.next() === CharCodes.n) {
          xref.addEntry(ref, firstInt);
        } else {
          this.context.delete(ref);
          xref.addDeletedEntry(ref, firstInt);
        }
        objectNumber += 1;
      } else {
        objectNumber = firstInt;
      }
      this.skipWhitespaceAndComments();
    }

    return xref;
  }

  private maybeParseTrailerDict(): void {
    this.skipWhitespaceAndComments();
    if (!this.matchKeyword(Keywords.trailer)) return;
    this.skipWhitespaceAndComments();
    this.context.trailer = this.parseDict();
  }

  private maybeParseTrailer(): PDFTrailer | void {
    this.skipWhitespaceAndComments();
    if (!this.matchKeyword(Keywords.startxref)) return;
    this.skipWhitespaceAndComments();

    const offset = this.parseRawInt();

    this.skipWhitespaceAndComments();
    this.matchKeyword(Keywords.eof);
    this.skipWhitespaceAndComments();

    return PDFTrailer.forLastCrossRefSectionOffset(offset);
  }

  private parseDocumentSection(): void {
    this.parseIndirectObjects();
    this.maybeParseCrossRefSection();
    this.maybeParseTrailerDict();
    this.maybeParseTrailer();
  }

  /**
   * Skips the binary comment following a PDF header. The specification
   * defines this binary comment (section 7.5.2 File Header) as a sequence of 4
   * or more bytes that are 128 or greater, and which are preceded by a "%".
   *
   * This would imply that to strip out this binary comment, we could check for
   * a sequence of bytes starting with "%", and remove all subsequent bytes that
   * are 128 or greater. This works for many documents that properly comply with
   * the spec. But in the wild, there are PDFs that omit the leading "%", and
   * include bytes that are less than 128 (e.g. 0 or 1). So in order to parse
   * these headers correctly, we just throw out all bytes leading up to the
   * first indirect object header.
   */
  private skipBinaryHeaderComment(): void {
    this.skipWhitespaceAndComments();
    try {
      const initialOffset = this.bytes.offset();
      this.parseIndirectObjectHeader();
      this.bytes.moveTo(initialOffset);
    } catch (e) {
      this.skipLine();
      this.skipWhitespaceAndComments();
    }
  }
}

export default PDFParser;
