import Embeddable from 'src/api/Embeddable';
import PDFDocument from 'src/api/PDFDocument';
import { PDFRef } from 'src/core';
import SeparationEmbedder from 'src/core/embedders/SeparationEmbedder';
import { assertIs } from 'src/utils';

/**
 * Represents a file that has been embedded in a [[PDFDocument]].
 */
export default class PDFSeparation implements Embeddable {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.embedSeparation]] method which will
   * > create instances of [[PDFSeparation]] for you.
   *
   * Create an instance of [[PDFSeparation]] from an existing ref and embedder
   *
   * @param ref The unique reference for this file.
   * @param doc The document to which the file will belong.
   * @param embedder The embedder that will be used to embed the file.
   */
  static of = (ref: PDFRef, doc: PDFDocument, embedder: SeparationEmbedder) =>
    new PDFSeparation(ref, doc, embedder);

  /** The unique reference assigned to this separation within the document. */
  readonly ref: PDFRef;

  /** The document to which this separation belongs. */
  readonly doc: PDFDocument;

  /** The name of this separation. */
  readonly name: string;

  private alreadyEmbedded = false;
  private readonly embedder: SeparationEmbedder;

  private constructor(
    ref: PDFRef,
    doc: PDFDocument,
    embedder: SeparationEmbedder,
  ) {
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
    assertIs(embedder, 'embedder', [
      [SeparationEmbedder, 'SeparationEmbedder'],
    ]);
    this.ref = ref;
    this.doc = doc;
    this.name = embedder.separationName;

    this.embedder = embedder;
  }

  /**
   * > **NOTE:** You probably don't need to call this method directly. The
   * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
   * > automatically ensure all separations get embedded.
   *
   * Embed this separation in its document.
   *
   * @returns Resolves when the embedding is complete.
   */
  async embed(): Promise<void> {
    if (!this.embedder) return;

    // The separation should only be embedded once. If there's a pending embed
    // operation then wait on it. Otherwise we need to start the embed.
    if (this.alreadyEmbedded) return;
    this.alreadyEmbedded = true;

    await this.embedder.embedIntoContext(this.doc.context, this.ref);
  }
}
