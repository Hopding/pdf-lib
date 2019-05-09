import PDFObject from 'src/core/objects/PDFObject';
import PDFContext from 'src/core/PDFContext';
import { CharCodes } from '../enums';

class PDFArray extends PDFObject {
  static withContext = (context: PDFContext) => new PDFArray(context);

  private readonly array: PDFObject[];
  private readonly context: PDFContext;

  private constructor(context: PDFContext) {
    super();
    this.array = [];
    this.context = context;
  }

  // TODO: Remove this
  dummy = () => this.context;

  size(): number {
    return this.array.length;
  }

  push(object: PDFObject): void {
    this.array.push(object);
  }

  get(index: number): PDFObject {
    return this.array[index];
  }

  clone(): PDFArray {
    const clone = PDFArray.withContext(this.context);
    for (let idx = 0, len = this.size(); idx < len; idx++) {
      clone.push(this.array[idx]);
    }
    return clone;
  }

  toString(): string {
    let arrayString = '[ ';
    for (let idx = 0, len = this.size(); idx < len; idx++) {
      arrayString += this.get(idx).toString();
      arrayString += ' ';
    }
    arrayString += ']';
    return arrayString;
  }

  sizeInBytes(): number {
    let size = 3;
    for (let idx = 0, len = this.size(); idx < len; idx++) {
      size += this.get(idx).sizeInBytes() + 1;
    }
    return size;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const initialOffset = offset;

    buffer[offset++] = CharCodes.LeftSquareBracket;
    buffer[offset++] = CharCodes.Space;
    for (let idx = 0, len = this.size(); idx < len; idx++) {
      offset += this.get(idx).copyBytesInto(buffer, offset);
      buffer[offset++] = CharCodes.Space;
    }
    buffer[offset++] = CharCodes.RightSquareBracket;

    return offset - initialOffset;
  }
}

export default PDFArray;
