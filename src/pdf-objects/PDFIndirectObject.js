/* @flow */
import dedent from 'dedent';

import PDFObject from './PDFObject';
import PDFIndirectReference from './PDFIndirectReference';

class PDFIndirectObject extends PDFObject {
  reference: PDFIndirectReference;
  pdfObject: $Subtype<PDFObject>;

  constructor(pdfObject: ?$Subtype<PDFObject>) {
    super();
    if (!(pdfObject instanceof PDFObject)) {
      throw new Error('Can only construct PDFIndirectObjects from PDFObjects');
    }
    this.pdfObject = pdfObject;
  }

  setReferenceNumbers = (objectNumber: number, generationNumber: number) => {
    if (
      typeof objectNumber !== 'number' ||
      typeof generationNumber !== 'number'
    ) {
      throw new Error(
        'PDFIndirectObject.setReferenceNumbers() requires arguments to be a numbers',
      );
    }
    this.reference = PDFIndirectReference.forNumbers(
      objectNumber,
      generationNumber,
    );
    return this;
  };

  getReference = () => this.reference;
  toReference = this.reference.toString;

  toString = () => dedent`
    ${this.reference.getObjectNumber()} ${this.reference.getGenerationNumber()} obj
      ${this.pdfObject}
    endobj
  `;
}

export default PDFIndirectObject;
