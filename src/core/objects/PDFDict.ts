import PDFName from 'src/core/objects/PDFName';
import PDFObject from 'src/core/objects/PDFObject';
import PDFContext from 'src/core/PDFContext';
import { CharCodes } from '../enums';

class PDFDict extends PDFObject {
  static withContext = (context: PDFContext) => new PDFDict(context);

  private readonly dict: Map<PDFName, PDFObject>;
  private readonly context: PDFContext;

  private constructor(context: PDFContext) {
    super();
    this.dict = new Map();
    this.context = context;
  }

  entries(): Array<[PDFName, PDFObject]> {
    return Array.from(this.dict.entries());
  }

  set(key: PDFName, value: PDFObject): void {
    this.dict.set(key, value);
  }

  get(key: PDFName): PDFObject | undefined {
    return this.dict.get(key);
  }

  clone(): PDFDict {
    const clone = PDFDict.withContext(this.context);
    const entries = this.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      clone.set(key, value);
    }
    return clone;
  }

  toString(): string {
    let dictString = '<<\n';
    const entries = this.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      dictString += key.toString() + ' ' + value.toString() + '\n';
    }
    dictString += '>>';
    return dictString;
  }

  sizeInBytes(): number {
    let size = 5;
    const entries = this.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      size += key.sizeInBytes() + value.sizeInBytes() + 2;
    }
    return size;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const initialOffset = offset;

    buffer[offset++] = CharCodes.LessThan;
    buffer[offset++] = CharCodes.LessThan;
    buffer[offset++] = CharCodes.Newline;

    const entries = this.entries();
    for (let idx = 0, len = entries.length; idx < len; idx++) {
      const [key, value] = entries[idx];
      offset += key.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Space;
      offset += value.copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Newline;
    }

    buffer[offset++] = CharCodes.GreaterThan;
    buffer[offset++] = CharCodes.GreaterThan;

    return offset - initialOffset;
  }
}

export default PDFDict;
