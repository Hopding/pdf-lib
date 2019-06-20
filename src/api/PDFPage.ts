import {
  beginText,
  drawObject,
  endText,
  moveText,
  popGraphicsState,
  pushGraphicsState,
  scale,
  setFontAndSize,
  showText,
  translate,
} from 'src/api/operators';
import PDFDocument from 'src/api/PDFDocument';
import PDFFont from 'src/api/PDFFont';
import PDFImage from 'src/api/PDFImage';
import {
  PDFContentStream,
  PDFName,
  PDFPageLeaf,
  PDFRef,
  StandardFonts,
} from 'src/core';
import { addRandomSuffix } from 'src/utils';

class PDFPage {
  static of = (leafNode: PDFPageLeaf, ref: PDFRef, doc: PDFDocument) =>
    new PDFPage(leafNode, ref, doc);

  static create = (doc: PDFDocument) => {
    const dummyRef = PDFRef.of(-1);
    const pageLeaf = PDFPageLeaf.withContextAndParent(doc.context, dummyRef);
    const pageRef = doc.context.register(pageLeaf);
    return new PDFPage(pageLeaf, pageRef, doc);
  };

  readonly node: PDFPageLeaf;
  readonly ref: PDFRef;
  readonly doc: PDFDocument;

  private fontKey?: string;
  private font?: PDFFont;
  private fontSize = 24;
  private x = 0;
  private y = 0;
  private contentStream?: PDFContentStream;
  private contentStreamRef?: PDFRef;

  private constructor(leafNode: PDFPageLeaf, ref: PDFRef, doc: PDFDocument) {
    this.node = leafNode;
    this.ref = ref;
    this.doc = doc;

    leafNode.normalize();
  }

  setFont(font: PDFFont): void {
    this.font = font;
    this.fontKey = addRandomSuffix(this.font.name);
    this.node.setFontDictionary(PDFName.of(this.fontKey), this.font.ref);
  }

  setFontSize(fontSize: number): void {
    this.fontSize = fontSize;
  }

  moveTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  drawText(text: string): void {
    const contentStream = this.getContentStream();
    const [font, fontKey] = this.getFont();
    contentStream.push(
      beginText(),
      setFontAndSize(fontKey, this.fontSize),
      moveText(this.x, this.y),
      showText(font.encodeText(text)),
      endText(),
    );
  }

  // TODO: Reuse image XObject name if we've already added this image to Resources.XObjects
  drawImage(image: PDFImage, size?: { width: number; height: number }): void {
    if (!size) size = image.scale(1);
    const contentStream = this.getContentStream();
    const xObjectKey = addRandomSuffix('Image', 4);
    this.node.setXObject(PDFName.of(xObjectKey), image.ref);
    contentStream.push(
      pushGraphicsState(),
      translate(this.x, this.y),
      scale(size.width, size.height),
      drawObject(xObjectKey),
      popGraphicsState(),
    );
  }

  private getFont(): [PDFFont, string] {
    if (!this.font || !this.fontKey) {
      const font = this.doc.embedFont(StandardFonts.Helvetica);
      this.setFont(font);
    }
    return [this.font!, this.fontKey!];
  }

  private getContentStream(): PDFContentStream {
    if (this.contentStream) return this.contentStream;
    const dict = this.doc.context.obj({});
    this.contentStream = PDFContentStream.of(dict, []);
    this.contentStreamRef = this.doc.context.register(this.contentStream);
    this.node.addContentStream(this.contentStreamRef);
    return this.contentStream;
  }
}

export default PDFPage;
