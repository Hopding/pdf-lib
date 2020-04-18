import { PrivateConstructorError } from 'src/core/errors';
import PDFObject from 'src/core/objects/PDFObject';
import { copyStringIntoBuffer } from 'src/utils';

const ENFORCER = {};
const pool = new Map<string, PDFRef>();

class PDFRef extends PDFObject {
  static of = (objectNumber: number, generationNumber = 0) => {
    const tag = `${objectNumber} ${generationNumber} R`;

    let instance = pool.get(tag);
    if (!instance) {
      instance = new PDFRef(ENFORCER, objectNumber, generationNumber);
      pool.set(tag, instance);
    }

    return instance;
  };

  readonly objectNumber: number;
  readonly generationNumber: number;
  readonly tag: string;

  private constructor(
    enforcer: any,
    objectNumber: number,
    generationNumber: number,
  ) {
    if (enforcer !== ENFORCER) throw new PrivateConstructorError('PDFRef');
    super();
    this.objectNumber = objectNumber;
    this.generationNumber = generationNumber;
    this.tag = `${objectNumber} ${generationNumber} R`;
  }

  clone(): PDFRef {
    return this;
  }

  toString(): string {
    return this.tag;
  }

  sizeInBytes(): number {
    return this.tag.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    offset += copyStringIntoBuffer(this.tag, buffer, offset);
    return this.tag.length;
  }
}

export default PDFRef;
