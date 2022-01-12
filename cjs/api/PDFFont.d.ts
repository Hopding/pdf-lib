import Embeddable from "./Embeddable";
import PDFDocument from "./PDFDocument";
import { CustomFontEmbedder, PDFHexString, PDFRef, StandardFontEmbedder } from "../core";
export declare type FontEmbedder = CustomFontEmbedder | StandardFontEmbedder;
/**
 * Represents a font that has been embedded in a [[PDFDocument]].
 */
export default class PDFFont implements Embeddable {
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.embedFont]] and
     * > [[PDFDocument.embedStandardFont]] methods, which will create instances
     * > of [[PDFFont]] for you.
     *
     * Create an instance of [[PDFFont]] from an existing ref and embedder
     *
     * @param ref The unique reference for this font.
     * @param doc The document to which the font will belong.
     * @param embedder The embedder that will be used to embed the font.
     */
    static of: (ref: PDFRef, doc: PDFDocument, embedder: FontEmbedder) => PDFFont;
    /** The unique reference assigned to this font within the document. */
    readonly ref: PDFRef;
    /** The document to which this font belongs. */
    readonly doc: PDFDocument;
    /** The name of this font. */
    readonly name: string;
    private modified;
    private readonly embedder;
    private constructor();
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFPage.drawText]] method will automatically encode the text it is
     * > given.
     *
     * Encodes a string of text in this font.
     *
     * @param text The text to be encoded.
     * @returns The encoded text as a hex string.
     */
    encodeText(text: string): PDFHexString;
    /**
     * Measure the width of a string of text drawn in this font at a given size.
     * For example:
     * ```js
     * const width = font.widthOfTextAtSize('Foo Bar Qux Baz', 36)
     * ```
     * @param text The string of text to be measured.
     * @param size The font size to be used for this measurement.
     * @returns The width of the string of text when drawn in this font at the
     *          given size.
     */
    widthOfTextAtSize(text: string, size: number): number;
    /**
     * Measure the height of this font at a given size. For example:
     * ```js
     * const height = font.heightAtSize(24)
     * ```
     *
     * The `options.descender` value controls whether or not the font's
     * descender is included in the height calculation.
     *
     * @param size The font size to be used for this measurement.
     * @param options The options to be used when computing this measurement.
     * @returns The height of this font at the given size.
     */
    heightAtSize(size: number, options?: {
        descender?: boolean;
    }): number;
    /**
     * Compute the font size at which this font is a given height. For example:
     * ```js
     * const fontSize = font.sizeAtHeight(12)
     * ```
     * @param height The height to be used for this calculation.
     * @returns The font size at which this font is the given height.
     */
    sizeAtHeight(height: number): number;
    /**
     * Get the set of unicode code points that can be represented by this font.
     * @returns The set of unicode code points supported by this font.
     */
    getCharacterSet(): number[];
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all fonts get embedded.
     *
     * Embed this font in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    embed(): Promise<void>;
}
//# sourceMappingURL=PDFFont.d.ts.map