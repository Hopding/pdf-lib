import PDFObjectParser from "./PDFObjectParser";
import PDFContext from "../PDFContext";
declare class PDFParser extends PDFObjectParser {
    static forBytesWithOptions: (pdfBytes: Uint8Array, objectsPerTick?: number | undefined, throwOnInvalidObject?: boolean | undefined, capNumbers?: boolean | undefined) => PDFParser;
    private readonly objectsPerTick;
    private readonly throwOnInvalidObject;
    private alreadyParsed;
    private parsedObjects;
    constructor(pdfBytes: Uint8Array, objectsPerTick?: number, throwOnInvalidObject?: boolean, capNumbers?: boolean);
    parseDocument(): Promise<PDFContext>;
    private maybeRecoverRoot;
    private parseHeader;
    private parseIndirectObjectHeader;
    private matchIndirectObjectHeader;
    private shouldWaitForTick;
    private parseIndirectObject;
    private tryToParseInvalidIndirectObject;
    private parseIndirectObjects;
    private maybeParseCrossRefSection;
    private maybeParseTrailerDict;
    private maybeParseTrailer;
    private parseDocumentSection;
    /**
     * This operation is not necessary for valid PDF files. But some invalid PDFs
     * contain jibberish in between indirect objects. This method is designed to
     * skip past that jibberish, should it exist, until it reaches the next
     * indirect object header, an xref table section, or the file trailer.
     */
    private skipJibberish;
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
    private skipBinaryHeaderComment;
}
export default PDFParser;
//# sourceMappingURL=PDFParser.d.ts.map