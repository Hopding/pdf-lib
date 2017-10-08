/* @flow */

class PDFObject {
  toString = (): string => {
    throw new Error(
      `toString() is not implemented on ${this.constructor.name}`,
    );
  };

  toBytes = (): Uint8Array => {
    throw new Error(`toBytes() is not implemented on ${this.constructor.name}`);
  };
}

export default PDFObject;
