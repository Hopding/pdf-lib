import Embeddable from 'src/api/Embeddable';
import PDFDocument from 'src/api/PDFDocument';
import { JpegEmbedder, PDFRef, PngEmbedder } from 'src/core';
import { assertIs } from 'src/utils';

export type ImageEmbedder = JpegEmbedder | PngEmbedder;

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
  static of = (ref: PDFRef, doc: PDFDocument, embedder: ImageEmbedder) =>
    new PDFImage(ref, doc, embedder);

  /** The unique reference assigned to this image within the document. */
  readonly ref: PDFRef;

  /** The document to which this image belongs. */
  readonly doc: PDFDocument;

  /** The width of this image in pixels. */
  readonly width: number;

  /** The height of this image in pixels. */
  readonly height: number;

  private alreadyEmbedded = false;
  private readonly embedder: ImageEmbedder;

  private constructor(ref: PDFRef, doc: PDFDocument, embedder: ImageEmbedder) {
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
    assertIs(embedder, 'embedder', [
      [JpegEmbedder, 'JpegEmbedder'],
      [PngEmbedder, 'PngEmbedder'],
    ]);

    this.ref = ref;
    this.doc = doc;
    this.width = embedder.width;
    this.height = embedder.height;

    this.embedder = embedder;
  }

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
  scale(factor: number) {
    assertIs(factor, 'factor', ['number']);
    return { width: this.width * factor, height: this.height * factor };
  }

  /**
   * Get the width and height of this image. For example:
   * ```js
   * const { width, height } = image.size()
   * ```
   * @returns The width and height of the image.
   */
  size() {
    return this.scale(1);
  }

  /**
   * > **NOTE:** You probably don't need to call this method directly. The
   * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
   * > automatically ensure all images get embedded.
   *
   * Embed this image in its document.
   *
   * @returns Resolves when the embedding is complete.
   */
  async embed(): Promise<void> {
    if (!this.alreadyEmbedded) {
      await this.embedder.embedIntoContext(this.doc.context, this.ref);
      this.alreadyEmbedded = true;
    }
  }
}
