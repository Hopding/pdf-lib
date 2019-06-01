import { MethodNotImplementedError } from 'src/core/errors';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFContext from 'src/core/PDFContext';
import CharCodes from 'src/core/syntax/CharCodes';

class PDFStream extends PDFObject {
  readonly dict: PDFDict;

  constructor(dict: PDFDict) {
    super();
    this.dict = dict;
  }

  clone(_context?: PDFContext): PDFStream {
    throw new MethodNotImplementedError(this.constructor.name, 'clone');
  }

  getContentsString(): string {
    throw new MethodNotImplementedError(
      this.constructor.name,
      'getContentsString',
    );
  }

  getContents(): Uint8Array {
    throw new MethodNotImplementedError(this.constructor.name, 'getContents');
  }

  getContentsSize(): number {
    throw new MethodNotImplementedError(
      this.constructor.name,
      'getContentsSize',
    );
  }

  updateDict(): void {
    const contentsSize = this.getContentsSize();
    this.dict.set(PDFName.Length, PDFNumber.of(contentsSize));
  }

  sizeInBytes(): number {
    this.updateDict();
    return this.dict.sizeInBytes() + this.getContentsSize() + 18;
  }

  toString(): string {
    this.updateDict();
    let streamString = this.dict.toString();
    streamString += '\nstream\n';
    streamString += this.getContentsString();
    streamString += '\nendstream';
    return streamString;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    this.updateDict();
    const initialOffset = offset;

    offset += this.dict.copyBytesInto(buffer, offset);
    buffer[offset++] = CharCodes.Newline;

    buffer[offset++] = CharCodes.s;
    buffer[offset++] = CharCodes.t;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.a;
    buffer[offset++] = CharCodes.m;
    buffer[offset++] = CharCodes.Newline;

    const contents = this.getContents();
    for (let idx = 0, len = contents.length; idx < len; idx++) {
      buffer[offset++] = contents[idx];
    }

    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.n;
    buffer[offset++] = CharCodes.d;
    buffer[offset++] = CharCodes.s;
    buffer[offset++] = CharCodes.t;
    buffer[offset++] = CharCodes.r;
    buffer[offset++] = CharCodes.e;
    buffer[offset++] = CharCodes.a;
    buffer[offset++] = CharCodes.m;

    return offset - initialOffset;
  }
}

export default PDFStream;
