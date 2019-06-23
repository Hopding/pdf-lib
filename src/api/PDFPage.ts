import { Color, rgb } from 'src/api/colors';
import { drawImage, drawLinesOfText } from 'src/api/operations';
import PDFDocument from 'src/api/PDFDocument';
import PDFFont from 'src/api/PDFFont';
import PDFImage from 'src/api/PDFImage';
import { degrees, Rotation } from 'src/api/rotations';
import {
  PDFContentStream,
  PDFHexString,
  PDFName,
  PDFNumber,
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
  private lineHeight = 24;
  private x = 0;
  private y = 0;
  private fillingColor = rgb(0, 0, 0);
  private contentStream?: PDFContentStream;
  private contentStreamRef?: PDFRef;

  private constructor(leafNode: PDFPageLeaf, ref: PDFRef, doc: PDFDocument) {
    this.node = leafNode;
    this.ref = ref;
    this.doc = doc;

    leafNode.normalize();
  }

  // TODO: Reuse image Font name if we've already added this image to Resources.Fonts
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

  drawText(
    text: string,
    options: {
      color?: Color;
      font?: PDFFont;
      size?: number | PDFNumber;
      rotate?: Rotation;
      xSkew?: Rotation;
      ySkew?: Rotation;
      x?: number | PDFNumber;
      y?: number | PDFNumber;
      lineHeight?: number | PDFNumber;
    } = {},
  ): void {
    const [originalFont] = this.getFont();
    if (options.font) this.setFont(options.font);
    const [font, fontKey] = this.getFont();

    const preprocessedLines = this.preprocessText(text);
    const encodedLines = new Array(preprocessedLines.length) as PDFHexString[];
    for (let idx = 0, len = preprocessedLines.length; idx < len; idx++) {
      encodedLines[idx] = font.encodeText(preprocessedLines[idx]);
    }

    const contentStream = this.getContentStream();
    contentStream.push(
      ...drawLinesOfText(encodedLines, {
        color: options.color || this.fillingColor,
        font: fontKey,
        size: options.size || this.fontSize,
        rotate: options.rotate || degrees(0),
        xSkew: options.xSkew || degrees(0),
        ySkew: options.ySkew || degrees(0),
        x: options.x || this.x,
        y: options.y || this.y,
        lineHeight: options.lineHeight || this.lineHeight,
      }),
    );

    if (options.font) this.setFont(originalFont);
  }

  // TODO: Reuse image XObject name if we've already added this image to Resources.XObjects
  drawImage(
    image: PDFImage,
    options: {
      x?: number | PDFNumber;
      y?: number | PDFNumber;
      width?: number | PDFNumber;
      height?: number | PDFNumber;
      rotate?: Rotation;
      xSkew?: Rotation;
      ySkew?: Rotation;
    } = {},
  ): void {
    // if (!size) size = image.scale(1);
    const contentStream = this.getContentStream();
    const xObjectKey = addRandomSuffix('Image', 4);
    this.node.setXObject(PDFName.of(xObjectKey), image.ref);

    // contentStream.push(
    //   pushGraphicsState(),
    //   translate(this.x, this.y),
    //   scale(size.width, size.height),
    //   drawObject(xObjectKey),
    //   popGraphicsState(),
    // );
    contentStream.push(
      ...drawImage(xObjectKey, {
        x: options.x || this.x,
        y: options.y || this.y,
        width: options.width || image.size().width,
        height: options.height || image.size().height,
        rotate: options.rotate || degrees(0),
        xSkew: options.xSkew || degrees(0),
        ySkew: options.ySkew || degrees(0),
      }),
    );
  }

  // x: number | PDFNumber;
  // y: number | PDFNumber;
  // width: number | PDFNumber;
  // height: number | PDFNumber;
  // rotate: Rotation;
  // xSkew: Rotation;
  // ySkew: Rotation;

  private preprocessText(text: string): string[] {
    return text
      .replace(/\t/g, '    ')
      .replace(/[\b\v]/g, '')
      .split(/[\r\n\f]/);
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
