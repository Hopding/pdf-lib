import { CharCodes } from 'src/core/enums';
import { MethodNotImplementedError } from 'src/core/errors';
import PDFDict from 'src/core/objects/PDFDict';
import PDFObject from 'src/core/objects/PDFObject';

class PDFStream extends PDFObject {
  protected readonly dict: PDFDict;

  constructor(dict: PDFDict) {
    super();
    this.dict = dict;
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

  sizeInBytes(): number {
    return this.dict.sizeInBytes() + this.getContentsSize() + 18;
  }

  toString(): string {
    let streamString = this.dict.toString();
    streamString += '\nstream\n';
    streamString += this.getContentsString();
    streamString += '\nendstream';
    return streamString;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
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
