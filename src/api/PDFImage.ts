import PDFDocument from 'src/api/PDFDocument';
import { JpegEmbedder, PDFRef, PngEmbedder } from 'src/core';
import { assertIs } from 'src/utils';

export type ImageEmbedder = JpegEmbedder | PngEmbedder;

class PDFImage {
  static of = (ref: PDFRef, doc: PDFDocument, embedder: ImageEmbedder) =>
    new PDFImage(ref, doc, embedder);

  readonly ref: PDFRef;
  readonly doc: PDFDocument;
  readonly width: number;
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

  scale(factor: number) {
    assertIs(factor, 'factor', ['number']);
    return { width: this.width * factor, height: this.height * factor };
  }

  size() {
    return this.scale(1);
  }

  async embed(): Promise<void> {
    if (!this.alreadyEmbedded) {
      await this.embedder.embedIntoContext(this.doc.context, this.ref);
      this.alreadyEmbedded = true;
    }
  }
}

export default PDFImage;
