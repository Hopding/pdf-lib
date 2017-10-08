/* @flow */

class PDFObject {
  toString = (): string => {
    throw new Error(
      `toString() is not implemented on ${this.constructor.name}`,
    );
  };
}

export default PDFObject;
