import Embeddable from 'src/api/Embeddable';
import PDFDocument from 'src/api/PDFDocument';
import FileEmbedder from 'src/core/embedders/FileEmbedder';
import { PDFName, PDFArray, PDFDict, PDFHexString, PDFRef } from 'src/core';

export default class PDFEmbeddedFile implements Embeddable {
  static of = (ref: PDFRef, doc: PDFDocument, embedder: FileEmbedder) =>
    new PDFEmbeddedFile(ref, doc, embedder);

  /** The unique reference assigned to this embedded file within the document. */
  readonly ref: PDFRef;

  /** The document to which this embedded file belongs. */
  readonly doc: PDFDocument;

  private alreadyEmbedded = false;
  private readonly embedder: FileEmbedder;

  private constructor(ref: PDFRef, doc: PDFDocument, embedder: FileEmbedder) {
    this.ref = ref;
    this.doc = doc;
    this.embedder = embedder;
  }

  /**
   * > **NOTE:** You probably don't need to call this method directly. The
   * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
   * > automatically ensure all embeddable files get embedded.
   *
   * Embed this embeddable file in its document.
   *
   * @returns Resolves when the embedding is complete.
   */
  async embed(): Promise<void> {
    if (!this.alreadyEmbedded) {
      const ref = await this.embedder.embedIntoContext(
        this.doc.context,
        this.ref,
      );

      if (!this.doc.catalog.has(PDFName.of('Names'))) {
        this.doc.catalog.set(PDFName.of('Names'), this.doc.context.obj({}));
      }
      const Names = this.doc.catalog.lookup(PDFName.of('Names'), PDFDict);

      if (!Names.has(PDFName.of('EmbeddedFiles'))) {
        Names.set(PDFName.of('EmbeddedFiles'), this.doc.context.obj({}));
      }
      const EmbeddedFiles = Names.lookup(PDFName.of('EmbeddedFiles'), PDFDict);

      if (!EmbeddedFiles.has(PDFName.of('Names'))) {
        EmbeddedFiles.set(PDFName.of('Names'), this.doc.context.obj([]));
      }
      const EFNames = EmbeddedFiles.lookup(PDFName.of('Names'), PDFArray);

      EFNames.push(PDFHexString.fromText(this.embedder.fileName));
      EFNames.push(ref);

      this.alreadyEmbedded = true;
    }
  }
}
