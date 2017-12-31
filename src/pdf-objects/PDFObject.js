/* @flow */

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

  addBytes = (buffer: Uint8Array): Uint8Array => {
    throw new Error(
      `addBytes() is not implemented on ${this.constructor.name}`,
    );
  };

  toBytes = (): Uint8Array => {
    throw new Error(`toBytes() is not implemented on ${this.constructor.name}`);
  };
}

export default PDFObject;
