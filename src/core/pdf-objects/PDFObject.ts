class PDFObject {
  toString = (): string => {
    throw new Error(
      `toString() is not implemented on ${this.constructor.name}`,
    );
  };

  bytesSize = (): number => {
    throw new Error(
      `bytesSize() is not implemented on ${this.constructor.name}`,
    );
  };

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    throw new Error(
      `copyBytesInto() is not implemented on ${this.constructor.name}`,
    );
  };
}

export default PDFObject;
