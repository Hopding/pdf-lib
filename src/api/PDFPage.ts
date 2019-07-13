import { Color, rgb } from 'src/api/colors';
import {
  drawEllipse,
  drawImage,
  drawLinesOfText,
  drawRectangle,
} from 'src/api/operations';
import {
  popGraphicsState,
  pushGraphicsState,
  translate,
} from 'src/api/operators';
import PDFDocument from 'src/api/PDFDocument';
import PDFFont from 'src/api/PDFFont';
import PDFImage from 'src/api/PDFImage';
import {
  PDFPageDrawCircleOptions,
  PDFPageDrawEllipseOptions,
  PDFPageDrawImageOptions,
  PDFPageDrawRectangleOptions,
  PDFPageDrawSquareOptions,
  PDFPageDrawTextOptions,
} from 'src/api/PDFPageOptions';
import { degrees, Rotation, toDegrees } from 'src/api/rotations';
import {
  PDFContentStream,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFOperator,
  PDFPageLeaf,
  PDFRef,
  StandardFonts,
} from 'src/core';
import {
  addRandomSuffix,
  assertEachIs,
  assertIs,
  assertMultiple,
  assertOrUndefined,
} from 'src/utils';

class PDFPage {
  static of = (leafNode: PDFPageLeaf, ref: PDFRef, doc: PDFDocument) =>
    new PDFPage(leafNode, ref, doc);

  static create = (doc: PDFDocument) => {
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);
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
  private fontColor = rgb(0, 0, 0) as Color;
  private lineHeight = 24;
  private x = 0;
  private y = 0;
  private contentStream?: PDFContentStream;
  private contentStreamRef?: PDFRef;

  private constructor(leafNode: PDFPageLeaf, ref: PDFRef, doc: PDFDocument) {
    assertIs(leafNode, 'leafNode', [[PDFPageLeaf, 'PDFPageLeaf']]);
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.node = leafNode;
    this.ref = ref;
    this.doc = doc;
  }

  setRotation(angle: Rotation): void {
    const degreesAngle = toDegrees(angle);
    assertMultiple(degreesAngle, 'degreesAngle', 90);
    this.node.set(PDFName.of('Rotate'), this.doc.context.obj(degreesAngle));
  }

  getRotation(): number {
    const Rotate = this.node.Rotate();
    return Rotate ? Rotate.value() : 0;
  }

  setSize(width: number, height: number): void {
    assertIs(width, 'width', ['number']);
    assertIs(height, 'height', ['number']);
    const mediaBox = this.node.MediaBox().clone();
    mediaBox.set(2, this.doc.context.obj(width));
    mediaBox.set(3, this.doc.context.obj(height));
    this.node.set(PDFName.of('MediaBox'), mediaBox);
  }

  setWidth(width: number): void {
    assertIs(width, 'width', ['number']);
    this.setSize(width, this.getSize().height);
  }

  setHeight(height: number): void {
    assertIs(height, 'height', ['number']);
    this.setSize(this.getSize().width, height);
  }

  getSize(): { width: number; height: number } {
    const mediaBox = this.node.MediaBox();
    const width =
      mediaBox.lookup(2, PDFNumber).value() -
      mediaBox.lookup(0, PDFNumber).value();
    const height =
      mediaBox.lookup(3, PDFNumber).value() -
      mediaBox.lookup(1, PDFNumber).value();
    return { width, height };
  }

  getWidth(): number {
    return this.getSize().width;
  }

  getHeight(): number {
    return this.getSize().height;
  }

  translateContent(x: number, y: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);

    this.node.normalize();
    this.getContentStream();

    const start = this.createContentStream(
      pushGraphicsState(),
      translate(x, y),
    );
    const startRef = this.doc.context.register(start);

    const end = this.createContentStream(popGraphicsState());
    const endRef = this.doc.context.register(end);

    this.node.wrapContentStreams(startRef, endRef);
  }

  resetPosition(): void {
    this.getContentStream(false);
    this.x = 0;
    this.y = 0;
  }

  // TODO: Reuse image Font name if we've already added this image to Resources.Fonts
  setFont(font: PDFFont): void {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    this.font = font;
    this.fontKey = addRandomSuffix(this.font.name);
    this.node.setFontDictionary(PDFName.of(this.fontKey), this.font.ref);
  }

  setFontSize(fontSize: number): void {
    assertIs(fontSize, 'fontSize', ['number']);
    this.fontSize = fontSize;
  }

  setFontColor(fontColor: Color): void {
    assertIs(fontColor, 'fontColor', [[Object, 'Color']]);
    this.fontColor = fontColor;
  }

  setLineHeight(lineHeight: number): void {
    assertIs(lineHeight, 'lineHeight', ['number']);
    this.lineHeight = lineHeight;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  moveTo(x: number, y: number): void {
    assertIs(x, 'x', ['number']);
    assertIs(y, 'y', ['number']);
    this.x = x;
    this.y = y;
  }

  moveDown(yDecrease: number): void {
    assertIs(yDecrease, 'yDecrease', ['number']);
    this.y -= yDecrease;
  }

  moveUp(yIncrease: number): void {
    assertIs(yIncrease, 'yIncrease', ['number']);
    this.y += yIncrease;
  }

  moveLeft(xDecrease: number): void {
    assertIs(xDecrease, 'xDecrease', ['number']);
    this.x -= xDecrease;
  }

  moveRight(xIncrease: number): void {
    assertIs(xIncrease, 'xIncrease', ['number']);
    this.x += xIncrease;
  }

  pushOperators(...operator: PDFOperator[]): void {
    assertEachIs(operator, 'operator', [[PDFOperator, 'PDFOperator']]);
    const contentStream = this.getContentStream();
    contentStream.push(...operator);
  }

  drawText(text: string, options: PDFPageDrawTextOptions = {}): void {
    assertIs(text, 'text', ['string']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertOrUndefined(options.font, 'options.font', [[PDFFont, 'PDFFont']]);
    assertOrUndefined(options.size, 'options.size', ['number']);
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.lineHeight, 'options.lineHeight', ['number']);

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
        color: options.color || this.fontColor,
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
  drawImage(image: PDFImage, options: PDFPageDrawImageOptions = {}): void {
    assertIs(image, 'image', [[PDFImage, 'PDFImage']]);
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.width, 'options.width', ['number']);
    assertOrUndefined(options.height, 'options.height', ['number']);
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);

    const xObjectKey = addRandomSuffix('Image', 4);
    this.node.setXObject(PDFName.of(xObjectKey), image.ref);

    const contentStream = this.getContentStream();
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

  drawRectangle(options: PDFPageDrawRectangleOptions = {}): void {
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.width, 'options.width', ['number']);
    assertOrUndefined(options.height, 'options.height', ['number']);
    assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
    assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);
    assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertOrUndefined(options.borderColor, 'options.borderColor', [
      [Object, 'Color'],
    ]);

    const contentStream = this.getContentStream();
    if (!('color' in options) && !('borderColor' in options)) {
      options.color = rgb(0, 0, 0);
    }
    contentStream.push(
      ...drawRectangle({
        x: options.x || this.x,
        y: options.y || this.y,
        width: options.width || 150,
        height: options.height || 100,
        rotate: options.rotate || degrees(0),
        xSkew: options.xSkew || degrees(0),
        ySkew: options.ySkew || degrees(0),
        borderWidth: options.borderWidth || 0,
        color: options.color || undefined,
        borderColor: options.borderColor || undefined,
      }),
    );
  }

  drawSquare(options: PDFPageDrawSquareOptions = {}): void {
    const { size } = options;
    assertOrUndefined(size, 'size', ['number']);
    this.drawRectangle({ ...options, width: size, height: size });
  }

  drawEllipse(options: PDFPageDrawEllipseOptions = {}): void {
    assertOrUndefined(options.x, 'options.x', ['number']);
    assertOrUndefined(options.y, 'options.y', ['number']);
    assertOrUndefined(options.xScale, 'options.xScale', ['number']);
    assertOrUndefined(options.yScale, 'options.yScale', ['number']);
    assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
    assertOrUndefined(options.borderColor, 'options.borderColor', [
      [Object, 'Color'],
    ]);
    assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);

    const contentStream = this.getContentStream();
    if (!('color' in options) && !('borderColor' in options)) {
      options.color = rgb(0, 0, 0);
    }
    contentStream.push(
      ...drawEllipse({
        x: options.x || this.x,
        y: options.y || this.y,
        xScale: options.xScale || 100,
        yScale: options.yScale || 100,
        color: options.color || undefined,
        borderColor: options.borderColor || undefined,
        borderWidth: options.borderWidth || 0,
      }),
    );
  }

  drawCircle(options: PDFPageDrawCircleOptions = {}): void {
    const { size } = options;
    assertOrUndefined(size, 'size', ['number']);
    this.drawEllipse({ ...options, xScale: size, yScale: size });
  }

  private preprocessText(text: string): string[] {
    return text
      .replace(/\t/g, '    ')
      .replace(/[\b\v]/g, '')
      .split(/[\r\n\f]/);
  }

  private getFont(): [PDFFont, string] {
    if (!this.font || !this.fontKey) {
      const font = this.doc.embedStandardFont(StandardFonts.Helvetica);
      this.setFont(font);
    }
    return [this.font!, this.fontKey!];
  }

  private getContentStream(useExisting = true): PDFContentStream {
    if (useExisting && this.contentStream) return this.contentStream;
    this.contentStream = this.createContentStream();
    this.contentStreamRef = this.doc.context.register(this.contentStream);
    this.node.addContentStream(this.contentStreamRef);
    return this.contentStream;
  }

  private createContentStream(...operators: PDFOperator[]): PDFContentStream {
    const dict = this.doc.context.obj({});
    const contentStream = PDFContentStream.of(dict, operators);
    return contentStream;
  }
}

export default PDFPage;
