import PDFDocument from 'src/api/PDFDocument';
import {
  CustomFontEmbedder,
  PDFHexString,
  PDFRef,
  StandardFontEmbedder,
} from 'src/core';

export type FontEmbedder = CustomFontEmbedder | StandardFontEmbedder;

class PDFFont {
  static of = (ref: PDFRef, doc: PDFDocument, embedder: FontEmbedder) =>
    new PDFFont(ref, doc, embedder);

  readonly ref: PDFRef;
  readonly doc: PDFDocument;
  readonly name: string;

  private modified = true;
  private readonly embedder: FontEmbedder;

  private constructor(ref: PDFRef, doc: PDFDocument, embedder: FontEmbedder) {
    this.ref = ref;
    this.doc = doc;
    this.name = embedder.fontName;

    this.embedder = embedder;
  }

  encodeText(text: string): PDFHexString {
    this.modified = true;
    return this.embedder.encodeText(text);
  }

  widthOfTextAtSize(text: string, size: number): number {
    return this.embedder.widthOfTextAtSize(text, size);
  }

  heightAtSize(size: number): number {
    return this.embedder.heightOfFontAtSize(size);
  }

  sizeAtHeight(height: number): number {
    return this.embedder.sizeOfFontAtHeight(height);
  }

  // TODO: Cleanup orphan embedded objects if a font is embedded multiple times...
  async embed(): Promise<void> {
    if (this.modified) {
      await this.embedder.embedIntoContext(this.doc.context, this.ref);
      this.modified = false;
    }
  }
}

export default PDFFont;
