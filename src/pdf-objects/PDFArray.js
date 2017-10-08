/* @flow */
import { charCodes, charCode } from '../utils';

import PDFObject from './PDFObject';
import PDFIndirectObject from './PDFIndirectObject';

class PDFArray extends PDFObject {
  array: Array<PDFObject> = [];

  constructor(array: Array<PDFObject>) {
    super();
    array.forEach(e => {
      if (!(e instanceof PDFObject)) {
        throw new Error(
          'Cannot construct PDFArray from array whose elements are not PDFObjects',
        );
      }
      this.array.push(e);
    });
  }

  push = (val: PDFObject) => {
    if (!(val instanceof PDFObject)) {
      throw new Error('PDFArray.set() requires values to be PDFObjects');
    }

    this.array.push(val);
    return this;
  };

  set = (idx: number, val: PDFObject) => {
    if (typeof idx !== 'number') {
      throw new Error('PDFArray.set() requires indexes to be numbers');
    }
    if (!(val instanceof PDFObject)) {
      throw new Error('PDFArray.set() requires values to be PDFObjects');
    }

    this.array[idx] = val;
    return this;
  };

  get = (idx: number) => {
    if (typeof idx !== 'number') {
      throw new Error('PDFArray.set() requires indexes to be numbers');
    }

    return this.array[idx];
  };

  forEach = this.array.forEach;

  toString = () => {
    let str = '[';
    this.array.forEach((e, idx) => {
      if (e instanceof PDFIndirectObject) str += `${e.toReference()}`;
      else if (e instanceof PDFObject) str += `${e.toString()}`;
      else throw new Error(`Not a PDFObject: ${e.constructor.name}`);

      if (idx !== this.array.length - 1) str += ' ';
    });
    str += ']';
    return str;
  };

  toBytes = (): Uint8Array => {
    const bytes = [charCode('[')];

    this.array.forEach((e, idx) => {
      if (e instanceof PDFIndirectObject) {
        bytes.push(...charCodes(e.toReference()));
      } else if (e instanceof PDFObject) {
        bytes.push(...e.toBytes());
      } else {
        throw new Error(`Not a PDFObject: ${e.constructor.name}`);
      }
      if (idx !== this.array.length - 1) bytes.push(charCode(' '));
    });

    bytes.push(charCode(']'));
    return new Uint8Array(bytes);
  };
}

export default PDFArray;
