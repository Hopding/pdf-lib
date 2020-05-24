import Embeddable from 'src/api/Embeddable';
import PDFDocument from 'src/api/PDFDocument';
import PDFAttachmentEmbedder from 'src/core/embedders/PDFAttachmentEmbedder';
import { PDFName, PDFArray, PDFDict, PDFHexString } from 'src/core';

export default class PDFEmbeddedFile implements Embeddable {
  static of = (doc: PDFDocument, embedder: PDFAttachmentEmbedder) =>
    new PDFEmbeddedFile(doc, embedder);

  /** The document to which this embedded page belongs. */
  readonly doc: PDFDocument;

  private alreadyEmbedded = false;
  private readonly embedder: PDFAttachmentEmbedder;

  private constructor(doc: PDFDocument, embedder: PDFAttachmentEmbedder) {
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
      const ref = await this.embedder.embedIntoContext(this.doc.context);

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
