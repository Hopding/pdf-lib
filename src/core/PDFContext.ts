import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRef from 'src/core/objects/PDFRef';
import PDFString from 'src/core/objects/PDFString';

interface LiteralObject {
  [name: string]: Literal | PDFObject;
}

interface LiteralArray {
  [index: number]: Literal | PDFObject;
}

type Literal = LiteralObject | LiteralArray | string | number | boolean | null;

class PDFContext {
  static create = () => new PDFContext();

  private readonly indirectObjects: Map<PDFRef, PDFObject>;
  private largestObjectNumber: number;

  private constructor() {
    this.indirectObjects = new Map();
    this.largestObjectNumber = 0;
  }

  assign(ref: PDFRef, object: PDFObject): void {
    this.indirectObjects.set(ref, object);
    if (ref.objectNumber > this.largestObjectNumber) {
      this.largestObjectNumber = ref.objectNumber;
    }
  }

  register(object: PDFObject): PDFRef {
    const ref = PDFRef.of(this.largestObjectNumber + 1);
    this.assign(ref, object);
    return ref;
  }

  lookup(ref: PDFRef | PDFObject): PDFObject | void {
    if (ref instanceof PDFRef) return this.indirectObjects.get(ref);
    return ref;
  }

  enumerateIndirectObjects(): Array<[PDFRef, PDFObject]> {
    return Array.from(this.indirectObjects.entries());
  }

  obj(literal: null): typeof PDFNull;
  obj(literal: string): PDFString;
  obj(literal: number): PDFNumber;
  obj(literal: boolean): PDFBool;
  obj(literal: LiteralArray): PDFArray;
  obj(literal: LiteralObject): PDFDict;

  obj(literal: Literal) {
    if (literal instanceof PDFObject) {
      return literal;
    } else if (literal === null) {
      return PDFNull;
    } else if (typeof literal === 'string') {
      return PDFString.of(literal);
    } else if (typeof literal === 'number') {
      return PDFNumber.of(literal);
    } else if (typeof literal === 'boolean') {
      return literal ? PDFBool.True : PDFBool.False;
    } else if (Array.isArray(literal)) {
      const array = PDFArray.withContext(this);
      for (let idx = 0, len = literal.length; idx < len; idx++) {
        array.push(this.obj(literal[idx]));
      }
      return array;
    } else {
      const dict = PDFDict.withContext(this);
      const keys = Object.keys(literal);
      for (let idx = 0, len = keys.length; idx < len; idx++) {
        const key = keys[idx];
        const value = (literal as LiteralObject)[key] as any;
        dict.set(PDFName.of(key), this.obj(value));
      }
      return dict;
    }
  }
}

export default PDFContext;
