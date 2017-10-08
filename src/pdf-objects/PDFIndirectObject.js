/* @flow */
import PDFObject from './PDFObject';

class PDFIndirectObject extends PDFObject {
  objectNumber: ?string = null;
  generationNumber: ?string = null;

  toReference = () =>
    this.objectNumber && this.generationNumber
      ? `${this.objectNumber} ${this.generationNumber} R`
      : null;
}

export default PDFIndirectObject;
