
import _ from 'lodash';
import { error, addStringToBuffer, arrayToString } from 'utils';
import { validate, validateArr, isInstance } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import PDFObject from './PDFObject';
import { PDFIndirectObject } from '.';

class PDFArray<T extends PDFObject = PDFObject> extends PDFObject {
  array: Array<T>;
  index: PDFObjectIndex;

  constructor(array: Array<T>, index: PDFObjectIndex) {
    super();
    validateArr(
      array,
      isInstance(PDFObject),
      'Cannot construct PDFArray from array whose elements are not PDFObjects',
    );
    validate(
      index,
      isInstance(PDFObjectIndex),
      '"index" must be a an instance of PDFObjectIndex',
    );
    this.array = array;
    this.index = index;
  }

  static fromArray = <A extends PDFObject>(array: Array<A>, index?: PDFObjectIndex) =>
    new PDFArray(array, index);

  push = (...val: T[]) => {
    validateArr(
      val,
      isInstance(PDFObject),
      'PDFArray.push() requires arguments to be PDFObjects',
    );

    this.array.push(...val);
    return this;
  };

  set = (idx: number, val: any) => {
    validate(idx, _.isNumber, 'PDFArray.set() requires indexes to be numbers');
    validate(
      val,
      isInstance(PDFObject),
      'PDFArray.set() requires values to be PDFObjects',
    );

    this.array[idx] = val;
    return this;
  };

  get = (idx: number) => {
    validate(idx, _.isNumber, 'PDFArray.set() requires indexes to be numbers');
    return this.array[idx];
  };

  forEach = (fn: (value: T, index: number, array: T[]) => void) => this.array.forEach(fn);
  map = <U>(fn: (value: T, index: number, array: T[]) => U) => this.array.map(fn);
  splice = (start: number, deleteCount?: number) => this.array.splice(start, deleteCount);

  toString = (): string => {
    const bufferSize = this.bytesSize();
    const buffer = new Uint8Array(bufferSize);
    this.copyBytesInto(buffer);
    return arrayToString(buffer);
  };

  bytesSize = () =>
    2 + // "[ "
    _(this.array)
      .map(e => {
        if (e instanceof PDFIndirectObject) return e.toReference().length + 1;
        else if (e instanceof PDFObject) return e.bytesSize() + 1;
        return error(`Not a PDFObject: ${e}`);
      })
      .sum() +
    1; // "]";

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('[ ', buffer);

    this.array.forEach((e, idx) => {
      if (e instanceof PDFIndirectObject) {
        remaining = addStringToBuffer(e.toReference(), remaining);
      } else if (e instanceof PDFObject) {
        remaining = e.copyBytesInto(remaining);
      } else {
        error(`Not a PDFObject: ${e}`);
      }
      remaining = addStringToBuffer(' ', remaining);
    });

    remaining = addStringToBuffer(']', remaining);
    return remaining;
  };
}

export default PDFArray;
