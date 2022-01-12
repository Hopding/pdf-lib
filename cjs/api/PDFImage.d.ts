import Embeddable from "./Embeddable";
import PDFDocument from "./PDFDocument";
import { JpegEmbedder, PDFRef, PngEmbedder } from "../core";
export declare type ImageEmbedder = JpegEmbedder | PngEmbedder;
/**
 * Represents an image that has been embedded in a [[PDFDocument]].
 */
export default class PDFImage implements Embeddable {
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.embedPng]] and [[PDFDocument.embedJpg]]
     * > methods, which will create instances of [[PDFImage]] for you.
     *
     * Create an instance of [[PDFImage]] from an existing ref and embedder
     *
     * @param ref The unique reference for this image.
     * @param doc The document to which the image will belong.
     * @param embedder The embedder that will be used to embed the image.
     */
    static of: (ref: PDFRef, doc: PDFDocument, embedder: ImageEmbedder) => PDFImage;
    /** The unique reference assigned to this image within the document. */
    readonly ref: PDFRef;
    /** The document to which this image belongs. */
    readonly doc: PDFDocument;
    /** The width of this image in pixels. */
    readonly width: number;
    /** The height of this image in pixels. */
    readonly height: number;
    private embedder;
    private embedTask;
    private constructor();
    /**
     * Compute the width and height of this image after being scaled by the
     * given `factor`. For example:
     * ```js
     * image.width  // => 500
     * image.height // => 250
     *
     * const scaled = image.scale(0.5)
     * scaled.width  // => 250
     * scaled.height // => 125
     * ```
     * This operation is often useful before drawing an image with
     * [[PDFPage.drawImage]] to compute the `width` and `height` options.
     * @param factor The factor by which this image should be scaled.
     * @returns The width and height of the image after being scaled.
     */
    scale(factor: number): {
        width: number;
        height: number;
    };
    /**
     * Get the width and height of this image after scaling it as large as
     * possible while maintaining its aspect ratio and not exceeding the
     * specified `width` and `height`. For example:
     * ```
     * image.width  // => 500
     * image.height // => 250
     *
     * const scaled = image.scaleToFit(750, 1000)
     * scaled.width  // => 750
     * scaled.height // => 375
     * ```
     * The `width` and `height` parameters can also be thought of as the width
     * and height of a box that the scaled image must fit within.
     * @param width The bounding box's width.
     * @param height The bounding box's height.
     * @returns The width and height of the image after being scaled.
     */
    scaleToFit(width: number, height: number): {
        width: number;
        height: number;
    };
    /**
     * Get the width and height of this image. For example:
     * ```js
     * const { width, height } = image.size()
     * ```
     * @returns The width and height of the image.
     */
    size(): {
        width: number;
        height: number;
    };
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all images get embedded.
     *
     * Embed this image in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    embed(): Promise<void>;
}
//# sourceMappingURL=PDFImage.d.ts.map