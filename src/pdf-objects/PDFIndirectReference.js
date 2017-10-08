/* @flow */
import { charCodes } from '../utils';
import PDFObject from './PDFObject';

const pdfIndirectRefEnforcer = Symbol('PDF_INDIRECT_REF_ENFORCER');
const pdfIndirectRefPool: Map<string, PDFIndirectReference> = new Map();

class PDFIndirectReference extends PDFObject {
  objectNumber: number;
  generationNumber: number;

  constructor(
    enforcer: Symbol,
    objectNumber: number,
    generationNumber: number,
  ) {
    super();
    if (enforcer !== pdfIndirectRefEnforcer) {
      throw new Error('Cannot create PDFIndirectReference via constructor');
    }

    if (
      typeof objectNumber !== 'number' ||
      typeof generationNumber !== 'number'
    ) {
      throw new Error('objectNumber and generationNumber must be numbers');
    }
    this.objectNumber = objectNumber;
    this.generationNumber = generationNumber;
  }

  static forNumbers = (objectNumber: number, generationNumber: number) => {
    if (
      typeof objectNumber !== 'number' ||
      typeof generationNumber !== 'number'
    ) {
      throw new Error('PDFName.forNumbers() requires numbers for arguments');
    }

    const key = `${objectNumber} ${generationNumber}`;
    let indirectRef = pdfIndirectRefPool.get(key);
    if (!indirectRef) {
      indirectRef = new PDFIndirectReference(
        pdfIndirectRefEnforcer,
        objectNumber,
        generationNumber,
      );
      pdfIndirectRefPool.set(key, indirectRef);
    }
    return indirectRef;
  };

  getObjectNumber = () => this.objectNumber;
  getGenerationNumber = () => this.generationNumber;

  toString = () => `${this.objectNumber} ${this.generationNumber} R`;

  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFIndirectReference;
