import {
  PDFArray,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFString,
} from '..';

class PDFBlock {
  private name: PDFName;

  private pageIndex: number;

  private dict: PDFDict;

  constructor(dict: PDFDict, name: PDFName, pageIndex: number) {
    this.dict = dict;
    this.name = name;
    this.pageIndex = pageIndex;
  }

  lookup(key: PDFName) {
    return this.dict.lookup(key);
  }

  isRectangleBlock(): boolean {
    return Boolean(this.getRect() && this.getType() === 'Block');
  }

  getName(): PDFName {
    return this.name;
  }

  getPageIndex(): number {
    return this.pageIndex;
  }

  getType(): string | null | undefined {
    return (this.lookup(PDFName.of('Type')) as PDFName)?.decodeText();
  }

  getRect(): [number, number, number, number] {
    const rectObj = this.lookup(PDFName.of('Rect')) as PDFArray;
    return rectObj
      .asArray()
      .map((value: PDFObject) => (value as PDFNumber).asNumber()) as [
      number,
      number,
      number,
      number,
    ];
  }

  getId(): number | null | undefined {
    return (this.lookup(PDFName.of('ID')) as PDFNumber)?.asNumber();
  }

  getSubType(): string | null | undefined {
    return (this.lookup(PDFName.of('Subtype')) as PDFName)?.decodeText();
  }

  getFontSize(): number | null | undefined {
    return (this.lookup(PDFName.of('fontsize')) as PDFNumber)?.asNumber();
  }

  getFontName(): string | null | undefined {
    return (this.lookup(PDFName.of('fontname')) as PDFString)?.decodeText();
  }

  getX(): number {
    return this.getRect()[0];
  }

  getY(): number {
    return this.getRect()[1] + this.getHeight();
  }

  getPaddingPosition(): [number, number] {
    const positionObj = this.lookup(PDFName.of('position')) as
      | PDFArray
      | undefined;
    return this._getPaddingPosition(positionObj);
  }

  getSize(): { width: number; height: number } {
    const [x1, y1, x2, y2] = this.getRect();
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    return { width, height };
  }

  getWidth(): number {
    return this.getSize().width;
  }

  getHeight(): number {
    return this.getSize().height;
  }

  private _getPaddingPosition(positionObj?: PDFArray): [number, number] {
    if (positionObj && positionObj.asArray().length === 2) {
      return positionObj
        .asArray()
        .map((p: PDFObject) => (p as PDFNumber).asNumber()) as [number, number];
    }

    if (positionObj && positionObj.asArray().length === 1) {
      const x = (positionObj.asArray()[0] as PDFNumber).asNumber();
      const y = x;
      return [x, y];
    }

    return [0, 0];
  }
}

export default PDFBlock;
