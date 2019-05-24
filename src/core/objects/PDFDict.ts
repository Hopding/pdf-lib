import PDFName from 'src/core/objects/PDFName';
import PDFObject from 'src/core/objects/PDFObject';
import PDFContext from 'src/core/PDFContext';
import CharCodes from 'src/core/syntax/CharCodes';
import PDFArray from 'src/core/objects/PDFArray';
import PDFNull from 'src/core/objects/PDFNull';
import PDFBool from 'src/core/objects/PDFBool';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFRef from 'src/core/objects/PDFRef';
import PDFString from 'src/core/objects/PDFString';
import PDFStream from 'src/core/objects/PDFStream';

class PDFDict extends PDFObject {
  static withContext = (context: PDFContext) => new PDFDict(context);

  readonly context: PDFContext;

  private readonly dict: Map<PDFName, PDFObject>;

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

  lookup(key: PDFName): PDFObject | undefined;
  lookup(key: PDFName, type: typeof PDFArray): PDFArray;
  lookup(key: PDFName, type: typeof PDFBool): PDFBool;
  lookup(key: PDFName, type: typeof PDFDict): PDFDict;
  lookup(key: PDFName, type: typeof PDFHexString): PDFHexString;
  lookup(key: PDFName, type: typeof PDFName): PDFName;
  lookup(key: PDFName, type: typeof PDFNull): typeof PDFNull;
  lookup(key: PDFName, type: typeof PDFNumber): PDFNumber;
  lookup(key: PDFName, type: typeof PDFStream): PDFStream;
  lookup(key: PDFName, type: typeof PDFRef): PDFRef;
  lookup(key: PDFName, type: typeof PDFString): PDFString;

  lookup(key: PDFName, type?: any) {
    return this.context.lookup(this.get(key), type) as any;
  }

  delete(key: PDFName): boolean {
    return this.dict.delete(key);
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
