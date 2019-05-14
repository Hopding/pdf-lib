import pako from 'pako';

import PDFArray from 'src/core/objects/PDFArray';
import PDFBool from 'src/core/objects/PDFBool';
import PDFDict from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNull from 'src/core/objects/PDFNull';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFObject from 'src/core/objects/PDFObject';
import PDFRawStream from 'src/core/objects/PDFRawStream';
import PDFRef from 'src/core/objects/PDFRef';
import { typedArrayFor } from 'src/utils';

interface LiteralObject {
  [name: string]: Literal | PDFObject;
}

interface LiteralArray {
  [index: number]: Literal | PDFObject;
}

type Literal = LiteralObject | LiteralArray | string | number | boolean | null;

class PDFContext {
  static create = () => new PDFContext();

  largestObjectNumber: number;

  private readonly indirectObjects: Map<PDFRef, PDFObject>;

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
  obj(literal: string): PDFName;
  obj(literal: number): PDFNumber;
  obj(literal: boolean): PDFBool;
  obj(literal: LiteralObject): PDFDict;
  obj(literal: LiteralArray): PDFArray;

  obj(literal: Literal) {
    if (literal instanceof PDFObject) {
      return literal;
    } else if (literal === null) {
      return PDFNull;
    } else if (typeof literal === 'string') {
      return PDFName.of(literal);
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

  stream(contents: string | Uint8Array): PDFRawStream {
    return PDFRawStream.of(
      this.obj({ Filter: PDFName.FlateDecode }),
      pako.deflate(typedArrayFor(contents)),
    );
  }
}

export default PDFContext;
