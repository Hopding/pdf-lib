class PDFObject {
  public toString = (): string => {
    throw new Error(
      `toString() is not implemented on ${this.constructor.name}`,
    );
  };

  public bytesSize = (): number => {
    throw new Error(
      `bytesSize() is not implemented on ${this.constructor.name}`,
    );
  };

  public copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    throw new Error(
      `copyBytesInto() is not implemented on ${this.constructor.name}`,
    );
  };
}

export default PDFObject;
