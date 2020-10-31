import Embeddable from 'src/api/Embeddable';
import PDFDocument from 'src/api/PDFDocument';
import JavaScriptEmbedder from 'src/core/embedders/JavaScriptEmbedder';
import { PDFName, PDFArray, PDFDict, PDFHexString, PDFRef } from 'src/core';

/**
 * Represents JavaScript that has been embedded in a [[PDFDocument]].
 */
export default class PDFJavaScript implements Embeddable {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.addJavaScript]] method, which will
   * create instances of [[PDFJavaScript]] for you.
   *
   * Create an instance of [[PDFJavaScript]] from an existing ref and script
   *
   * @param ref The unique reference for this script.
   * @param doc The document to which the script will belong.
   * @param embedder The embedder that will be used to embed the script.
   */
  static of = (ref: PDFRef, doc: PDFDocument, embedder: JavaScriptEmbedder) =>
    new PDFJavaScript(ref, doc, embedder);

  /** The unique reference assigned to this embedded script within the document. */
  readonly ref: PDFRef;

  /** The document to which this embedded script belongs. */
  readonly doc: PDFDocument;

  private alreadyEmbedded = false;
  private readonly embedder: JavaScriptEmbedder;

  private constructor(
    ref: PDFRef,
    doc: PDFDocument,
    embedder: JavaScriptEmbedder,
  ) {
    this.ref = ref;
    this.doc = doc;
    this.embedder = embedder;
  }

  /**
   * > **NOTE:** You probably don't need to call this method directly. The
   * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
   * > automatically ensure all JavaScripts get embedded.
   *
   * Embed this JavaScript in its document.
   *
   * @returns Resolves when the embedding is complete.
   */
  async embed(): Promise<void> {
    if (!this.alreadyEmbedded) {
      const { catalog, context } = this.doc;

      const ref = await this.embedder.embedIntoContext(
        this.doc.context,
        this.ref,
      );

      if (!catalog.has(PDFName.of('Names'))) {
        catalog.set(PDFName.of('Names'), context.obj({}));
      }
      const Names = catalog.lookup(PDFName.of('Names'), PDFDict);

      if (!Names.has(PDFName.of('JavaScript'))) {
        Names.set(PDFName.of('JavaScript'), context.obj({}));
      }
      const Javascript = Names.lookup(PDFName.of('JavaScript'), PDFDict);

      if (!Javascript.has(PDFName.of('Names'))) {
        Javascript.set(PDFName.of('Names'), context.obj([]));
      }
      const JSNames = Javascript.lookup(PDFName.of('Names'), PDFArray);

      JSNames.push(PDFHexString.fromText(this.embedder.scriptName));
      JSNames.push(ref);

      this.alreadyEmbedded = true;
    }
  }
}
