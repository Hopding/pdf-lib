import CharCodes from 'src/core/syntax/CharCodes';
import PDFCrossRefSection from 'src/core/document/PDFCrossRefSection';
import PDFHeader from 'src/core/document/PDFHeader';
import PDFTrailer from 'src/core/document/PDFTrailer';
import PDFRef from 'src/core/objects/PDFRef';
import PDFObjectParser from 'src/core/parser/PDFObjectParser';
import PDFContext from 'src/core/PDFContext';
import { Keywords } from 'src/core/syntax/Keywords';
import { DigitChars } from 'src/core/syntax/Numeric';

class PDFParser extends PDFObjectParser {
  static forBytes = (pdfBytes: Uint8Array, context: PDFContext) =>
    new PDFParser(pdfBytes, context);

  alreadyParsed = false;

  constructor(pdfBytes: Uint8Array, context: PDFContext) {
    super(pdfBytes, context);
  }

  parseDocumentIntoContext(): PDFHeader {
    if (this.alreadyParsed) throw new Error('PDF already parsed! FIX ME!');
    this.alreadyParsed = true;

    const header = this.parseHeader();
    while (!this.bytes.done()) {
      this.parseDocumentSection();
    }

    return header;
  }

  private parseHeader(): PDFHeader {
    while (!this.bytes.done()) {
      if (this.matchKeyword(Keywords.header)) {
        const major = this.parseRawInt();

        // TODO: Assert this is a '.'
        this.bytes.next(); // Skip the '.' separator

        const minor = this.parseRawInt();
        const header = PDFHeader.forVersion(major, minor);
        this.skipBinaryHeaderComment();
        return header;
      }
    }

    throw new Error('FIX ME!');
  }

  private parseIndirectObject(): PDFRef {
    this.skipWhitespace();
    const objectNumber = this.parseRawInt();

    this.skipWhitespace();
    const generationNumber = this.parseRawInt();

    this.skipWhitespace();
    if (!this.matchKeyword(Keywords.obj)) throw new Error('FIX ME!');

    this.skipWhitespace();
    const object = this.parseObject();

    this.skipWhitespace();
    if (!this.matchKeyword(Keywords.endobj)) throw new Error('FIX ME!');

    const ref = PDFRef.of(objectNumber, generationNumber);
    this.context.assign(ref, object);

    return ref;
  }

  private parseIndirectObjects(): void {
    this.skipWhitespace();
    while (!this.bytes.done() && DigitChars.includes(this.bytes.peek())) {
      this.parseIndirectObject();
      this.skipWhitespace();
    }
  }

  private maybeParseCrossRefSection(): PDFCrossRefSection | void {
    this.skipWhitespace();
    if (!this.matchKeyword(Keywords.xref)) return;
    this.skipWhitespace();

    let objectNumber = -1;
    const xref = PDFCrossRefSection.createEmpty();

    while (DigitChars.includes(this.bytes.peek())) {
      const firstInt = this.parseRawInt();
      this.skipWhitespace();

      const secondInt = this.parseRawInt();
      this.skipWhitespace();

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
      this.skipWhitespace();
    }

    return xref;
  }

  private maybeParseTrailerDict(): void {
    this.skipWhitespace();
    if (!this.matchKeyword(Keywords.trailer)) return;
    this.skipWhitespace();
    this.context.trailer = this.parseDict();
  }

  private maybeParseTrailer(): PDFTrailer | void {
    this.skipWhitespace();
    if (!this.matchKeyword(Keywords.startxref)) return;
    this.skipWhitespace();

    const offset = this.parseRawInt();

    this.skipWhitespace();
    this.matchKeyword(Keywords.eof);
    this.skipWhitespace();

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
   * first digit. (we assume the first digit is the object number of the first
   * indirect object)
   */
  private skipBinaryHeaderComment(): void {
    while (!this.bytes.done() && !DigitChars.includes(this.bytes.peek())) {
      this.bytes.next();
    }
  }
}

export default PDFParser;
