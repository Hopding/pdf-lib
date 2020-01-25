import {
  PDFAnnotationAppearance,
  PDFArray,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFRectangle,
  PDFString,
} from 'src/core';

const annotationTypes = [
  PDFName.Text,
  PDFName.Link,
  PDFName.FreeText,
  PDFName.Line,
  PDFName.Square,
  PDFName.Circle,
  PDFName.Polygon,
  PDFName.PolyLine,
  PDFName.Highlight,
  PDFName.Underline,
  PDFName.Squiggly,
  PDFName.StrikeOut,
  PDFName.Stamp,
  PDFName.Caret,
  PDFName.Ink,
  PDFName.Popup,
  PDFName.FileAttachment,
  PDFName.Sound,
  PDFName.Movie,
  PDFName.Widget,
  PDFName.Screen,
  PDFName.PrinterMark,
  PDFName.TrapNet,
  PDFName.Watermark,
  PDFName.ThreeD,
  PDFName.Redact,
];

class PDFAnnotation {
  static fromDict(dict: PDFDict): PDFAnnotation {
    return new PDFAnnotation(dict);
  }

  readonly dict: PDFDict;

  protected constructor(dict: PDFDict) {
    this.dict = dict;
    if (!annotationTypes.includes(this.Subtype())) {
      throw new Error('Invalid annotation type');
    }
  }

  Type(): PDFName | undefined {
    return this.dict.lookupMaybe(PDFName.Type, PDFName);
  }

  Subtype(): PDFName {
    return this.dict.lookup(PDFName.Subtype, PDFName);
  }

  Rect(): PDFArray {
    return this.dict.lookup(PDFName.Rect, PDFArray);
  }

  getRectangle(): PDFRectangle {
    return PDFRectangle.fromArray(this.Rect());
  }

  Contents(): PDFString | undefined {
    return this.dict.lookupMaybe(PDFName.Contents, PDFString);
  }

  P(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.P, PDFDict);
  }

  NM(): PDFString | undefined {
    return this.dict.lookupMaybe(PDFName.NM, PDFString);
  }

  M(): PDFString | undefined {
    return this.dict.lookupMaybe(PDFName.M, PDFString);
  }

  F(): PDFNumber | undefined {
    return this.dict.lookupMaybe(PDFName.F, PDFNumber);
  }

  getFlags(): number {
    return this.F()?.value() || 0;
  }

  isInvisible(): boolean {
    return !!(this.getFlags() & 1);
  }

  isHidden(): boolean {
    return !!(this.getFlags() & (1 << 1));
  }

  shouldPrint(): boolean {
    return !!(this.getFlags() & (1 << 2));
  }

  isNoZoom(): boolean {
    return !!(this.getFlags() & (1 << 3));
  }

  isNoRotate(): boolean {
    return !!(this.getFlags() & (1 << 4));
  }

  isNoView(): boolean {
    return !!(this.getFlags() & (1 << 5));
  }

  isReadOnly(): boolean {
    return !!(this.getFlags() & (1 << 6));
  }

  isLocked(): boolean {
    return !!(this.getFlags() & (1 << 7));
  }

  isNoViewTogglable(): boolean {
    return !!(this.getFlags() & (1 << 8));
  }

  isLockedContent(): boolean {
    return !!(this.getFlags() & (1 << 9));
  }

  AP(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.AP, PDFDict);
  }

  getAppearance(): PDFAnnotationAppearance | undefined {
    const appearanceDict = this.AP();
    if (!appearanceDict) {
      return appearanceDict;
    }
    return PDFAnnotationAppearance.fromDict(appearanceDict);
  }

  AS(): PDFName | undefined {
    return this.dict.lookupMaybe(PDFName.AS, PDFName);
  }

  Border(): PDFArray | undefined {
    return this.dict.lookupMaybe(PDFName.Border, PDFArray);
  }

  C(): PDFArray | undefined {
    return this.dict.lookupMaybe(PDFName.C, PDFArray);
  }

  StructParent(): PDFNumber | undefined {
    return this.dict.lookupMaybe(PDFName.StructParent, PDFNumber);
  }

  OC(): PDFDict | undefined {
    return this.dict.lookupMaybe(PDFName.OC, PDFDict);
  }
}

export default PDFAnnotation;
