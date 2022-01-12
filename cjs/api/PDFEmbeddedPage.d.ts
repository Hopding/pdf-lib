import Embeddable from "./Embeddable";
import PDFDocument from "./PDFDocument";
import { PDFPageEmbedder, PDFRef } from "../core";
/**
 * Represents a PDF page that has been embedded in a [[PDFDocument]].
 */
export default class PDFEmbeddedPage implements Embeddable {
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.embedPdf]] and
     * > [[PDFDocument.embedPage]] methods, which will create instances of
     * > [[PDFEmbeddedPage]] for you.
     *
     * Create an instance of [[PDFEmbeddedPage]] from an existing ref and embedder
     *
     * @param ref The unique reference for this embedded page.
     * @param doc The document to which the embedded page will belong.
     * @param embedder The embedder that will be used to embed the page.
     */
    static of: (ref: PDFRef, doc: PDFDocument, embedder: PDFPageEmbedder) => PDFEmbeddedPage;
    /** The unique reference assigned to this embedded page within the document. */
    readonly ref: PDFRef;
    /** The document to which this embedded page belongs. */
    readonly doc: PDFDocument;
    /** The width of this page in pixels. */
    readonly width: number;
    /** The height of this page in pixels. */
    readonly height: number;
    private alreadyEmbedded;
    private readonly embedder;
    private constructor();
    /**
     * Compute the width and height of this page after being scaled by the
     * given `factor`. For example:
     * ```js
     * embeddedPage.width  // => 500
     * embeddedPage.height // => 250
     *
     * const scaled = embeddedPage.scale(0.5)
     * scaled.width  // => 250
     * scaled.height // => 125
     * ```
     * This operation is often useful before drawing a page with
     * [[PDFPage.drawPage]] to compute the `width` and `height` options.
     * @param factor The factor by which this page should be scaled.
     * @returns The width and height of the page after being scaled.
     */
    scale(factor: number): {
        width: number;
        height: number;
    };
    /**
     * Get the width and height of this page. For example:
     * ```js
     * const { width, height } = embeddedPage.size()
     * ```
     * @returns The width and height of the page.
     */
    size(): {
        width: number;
        height: number;
    };
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all embeddable pages get embedded.
     *
     * Embed this embeddable page in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    embed(): Promise<void>;
}
//# sourceMappingURL=PDFEmbeddedPage.d.ts.map