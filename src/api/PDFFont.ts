import PDFDocument from 'src/api/PDFDocument';
import {
  CustomFontEmbedder,
  PDFHexString,
  PDFRef,
  StandardFontEmbedder,
} from 'src/core';
import { assertIs } from 'src/utils';

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
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
    assertIs(embedder, 'embedder', [
      [CustomFontEmbedder, 'CustomFontEmbedder'],
      [StandardFontEmbedder, 'StandardFontEmbedder'],
    ]);

    this.ref = ref;
    this.doc = doc;
    this.name = embedder.fontName;

    this.embedder = embedder;
  }

  encodeText(text: string): PDFHexString {
    assertIs(text, 'text', ['string']);
    this.modified = true;
    return this.embedder.encodeText(text);
  }

  widthOfTextAtSize(text: string, size: number): number {
    assertIs(text, 'text', ['string']);
    assertIs(size, 'size', ['number']);
    return this.embedder.widthOfTextAtSize(text, size);
  }

  heightAtSize(size: number): number {
    assertIs(size, 'size', ['number']);
    return this.embedder.heightOfFontAtSize(size);
  }

  sizeAtHeight(height: number): number {
    assertIs(height, 'height', ['number']);
    return this.embedder.sizeOfFontAtHeight(height);
  }

  getCharacterSet(): number[] {
    if (this.embedder instanceof StandardFontEmbedder) {
      // TODO: Update @pdf-lib/standard fonts to export encoding.characterSet
      return Object.keys((this.embedder.encoding as any).unicodeMappings)
        .map(Number)
        .sort((a, b) => a - b);
    } else {
      return this.embedder.font.characterSet;
    }
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
