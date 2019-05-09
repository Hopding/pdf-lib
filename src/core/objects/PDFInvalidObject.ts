import PDFObject from 'src/core/objects/PDFObject';

class PDFInvalidObject extends PDFObject {
  static of = (data: Uint8Array) => new PDFInvalidObject(data);

  private readonly data: Uint8Array;

  private constructor(data: Uint8Array) {
    super();
    this.data = data;
  }

  clone(): PDFInvalidObject {
    return PDFInvalidObject.of(this.data.slice());
  }

  toString(): string {
    return `PDFInvalidObject(${this.data.length} bytes)`;
  }

  sizeInBytes(): number {
    return this.data.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const length = this.data.length;
    for (let idx = 0; idx < length; idx++) {
      buffer[offset++] = this.data[idx];
    }
    return length;
  }
}

export default PDFInvalidObject;
