import PDFCrossRefSection from 'src/core/document/PDFCrossRefSection';
import PDFHeader from 'src/core/document/PDFHeader';
import PDFTrailer from 'src/core/document/PDFTrailer';
import {
  MissingKeywordError,
  MissingPDFHeaderError,
  PDFInvalidObjectParsingError,
  ReparseError,
  StalledParserError,
} from 'src/core/errors';
import PDFDict from 'src/core/objects/PDFDict';
import PDFInvalidObject from 'src/core/objects/PDFInvalidObject';
import PDFName from 'src/core/objects/PDFName';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import ByteStream from 'src/core/parser/ByteStream';
import PDFObjectParser from 'src/core/parser/PDFObjectParser';
import PDFObjectStreamParser from 'src/core/parser/PDFObjectStreamParser';
import PDFXRefStreamParser from 'src/core/parser/PDFXRefStreamParser';
import PDFContext from 'src/core/PDFContext';
import CharCodes from 'src/core/syntax/CharCodes';
import { Keywords } from 'src/core/syntax/Keywords';
import { IsDigit } from 'src/core/syntax/Numeric';
import { waitForTick } from 'src/utils';

class PDFParser extends PDFObjectParser {
  static forBytesWithOptions = (
    pdfBytes: Uint8Array,
    objectsPerTick?: number,
    throwOnInvalidObject?: boolean,
  ) => new PDFParser(pdfBytes, objectsPerTick, throwOnInvalidObject);

  private readonly objectsPerTick: number;
  private readonly throwOnInvalidObject: boolean;
  private alreadyParsed = false;
  private parsedObjects = 0;

  constructor(
    pdfBytes: Uint8Array,
    objectsPerTick: number = Infinity,
    throwOnInvalidObject = false,
  ) {
    super(ByteStream.of(pdfBytes), PDFContext.create());
    this.objectsPerTick = objectsPerTick;
    this.throwOnInvalidObject = throwOnInvalidObject;
  }

  async parseDocument(): Promise<PDFContext> {
    if (this.alreadyParsed) {
      throw new ReparseError('PDFParser', 'parseDocument');
    }
    this.alreadyParsed = true;

    this.context.header = this.parseHeader();

    let prevOffset;
    while (!this.bytes.done()) {
      await this.parseDocumentSection();
      const offset = this.bytes.offset();
      if (offset === prevOffset) {
        throw new StalledParserError(this.bytes.position());
      }
      prevOffset = offset;
    }

    this.maybeRecoverRoot();

    return this.context;
  }

  private maybeRecoverRoot(): void {
    const isValidCatalog = (obj?: PDFObject) =>
      obj instanceof PDFDict &&
      obj.lookup(PDFName.of('Type')) === PDFName.of('Catalog');

    const catalog = this.context.lookup(this.context.trailerInfo.Root);

    if (!isValidCatalog(catalog)) {
      const indirectObjects = this.context.enumerateIndirectObjects();
      for (let idx = 0, len = indirectObjects.length; idx < len; idx++) {
        const [ref, object] = indirectObjects[idx];
        if (isValidCatalog(object)) {
          this.context.trailerInfo.Root = ref;
        }
      }
    }
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

  private matchIndirectObjectHeader(): boolean {
    const initialOffset = this.bytes.offset();
    try {
      this.parseIndirectObjectHeader();
      return true;
    } catch (e) {
      this.bytes.moveTo(initialOffset);
      return false;
    }
  }

  private shouldWaitForTick = () => {
    this.parsedObjects += 1;
    return this.parsedObjects % this.objectsPerTick === 0;
  };

  private async parseIndirectObject(): Promise<PDFRef> {
    const ref = this.parseIndirectObjectHeader();

    this.skipWhitespaceAndComments();
    const object = this.parseObject();

    this.skipWhitespaceAndComments();
    // if (!this.matchKeyword(Keywords.endobj)) {
    // throw new MissingKeywordError(this.bytes.position(), Keywords.endobj);
    // }

    // TODO: Log a warning if this fails...
    this.matchKeyword(Keywords.endobj);

    if (
      object instanceof PDFRawStream &&
      object.dict.lookup(PDFName.of('Type')) === PDFName.of('ObjStm')
    ) {
      await PDFObjectStreamParser.forStream(
        object,
        this.shouldWaitForTick,
      ).parseIntoContext();
    } else if (
      object instanceof PDFRawStream &&
      object.dict.lookup(PDFName.of('Type')) === PDFName.of('XRef')
    ) {
      PDFXRefStreamParser.forStream(object).parseIntoContext();
    } else {
      this.context.assign(ref, object);
    }

    return ref;
  }

  // TODO: Improve and clean this up
  private tryToParseInvalidIndirectObject() {
    const startPos = this.bytes.position();

    const msg = `Trying to parse invalid object: ${JSON.stringify(startPos)})`;
    if (this.throwOnInvalidObject) throw new Error(msg);
    console.warn(msg);

    const ref = this.parseIndirectObjectHeader();

    console.warn(`Invalid object ref: ${ref}`);

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

    if (failed) throw new PDFInvalidObjectParsingError(startPos);

    const end = this.bytes.offset() - Keywords.endobj.length;

    const object = PDFInvalidObject.of(this.bytes.slice(start, end));
    this.context.assign(ref, object);

    return ref;
  }

  private async parseIndirectObjects(): Promise<void> {
    this.skipWhitespaceAndComments();

    while (!this.bytes.done() && IsDigit[this.bytes.peek()]) {
      const initialOffset = this.bytes.offset();

      try {
        await this.parseIndirectObject();
      } catch (e) {
        // TODO: Add tracing/logging mechanism to track when this happens!
        this.bytes.moveTo(initialOffset);
        this.tryToParseInvalidIndirectObject();
      }
      this.skipWhitespaceAndComments();

      // TODO: Can this be done only when needed, to avoid harming performance?
      this.skipJibberish();

      if (this.shouldWaitForTick()) await waitForTick();
    }
  }

  private maybeParseCrossRefSection(): PDFCrossRefSection | void {
    this.skipWhitespaceAndComments();
    if (!this.matchKeyword(Keywords.xref)) return;
    this.skipWhitespaceAndComments();

    let objectNumber = -1;
    const xref = PDFCrossRefSection.createEmpty();

    while (!this.bytes.done() && IsDigit[this.bytes.peek()]) {
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
          // this.context.delete(ref);
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

    const dict = this.parseDict();

    const { context } = this;
    context.trailerInfo = {
      Root: dict.get(PDFName.of('Root')) || context.trailerInfo.Root,
      Encrypt: dict.get(PDFName.of('Encrypt')) || context.trailerInfo.Encrypt,
      Info: dict.get(PDFName.of('Info')) || context.trailerInfo.Info,
      ID: dict.get(PDFName.of('ID')) || context.trailerInfo.ID,
    };
  }

  private maybeParseTrailer(): PDFTrailer | void {
    this.skipWhitespaceAndComments();
    if (!this.matchKeyword(Keywords.startxref)) return;
    this.skipWhitespaceAndComments();

    const offset = this.parseRawInt();

    this.skipWhitespace();
    this.matchKeyword(Keywords.eof);
    this.skipWhitespaceAndComments();
    this.matchKeyword(Keywords.eof);
    this.skipWhitespaceAndComments();

    return PDFTrailer.forLastCrossRefSectionOffset(offset);
  }

  private async parseDocumentSection(): Promise<void> {
    await this.parseIndirectObjects();
    this.maybeParseCrossRefSection();
    this.maybeParseTrailerDict();
    this.maybeParseTrailer();

    // TODO: Can this be done only when needed, to avoid harming performance?
    this.skipJibberish();
  }

  /**
   * This operation is not necessary for valid PDF files. But some invalid PDFs
   * contain jibberish in between indirect objects. This method is designed to
   * skip past that jibberish, should it exist, until it reaches the next
   * indirect object header, an xref table section, or the file trailer.
   */
  private skipJibberish(): void {
    this.skipWhitespaceAndComments();
    while (!this.bytes.done()) {
      const initialOffset = this.bytes.offset();
      const byte = this.bytes.peek();
      const isAlphaNumeric = byte >= CharCodes.Space && byte <= CharCodes.Tilde;
      if (isAlphaNumeric) {
        if (
          this.matchKeyword(Keywords.xref) ||
          this.matchKeyword(Keywords.trailer) ||
          this.matchKeyword(Keywords.startxref) ||
          this.matchIndirectObjectHeader()
        ) {
          this.bytes.moveTo(initialOffset);
          break;
        }
      }
      this.bytes.next();
    }
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
      this.bytes.next();
      this.skipWhitespaceAndComments();
    }
  }
}

export default PDFParser;
