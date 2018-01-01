/* @flow */
import _ from 'lodash';
import { error, addStringToBuffer } from '../utils';
import { validate, validateArr, isInstance } from '../utils/validate';

import PDFObject from './PDFObject';
import { PDFIndirectReference, PDFIndirectObject } from '.';

class PDFArray extends PDFObject {
  array: Array<Object>;

  constructor(array: Array<Object>) {
    super();
    validateArr(
      array,
      isInstance(PDFObject),
      'Cannot construct PDFArray from array whose elements are not PDFObjects',
    );
    this.array = array.slice();
  }

  static fromArray = (array: Array<*>) => new PDFArray(array);

  push = (val: any) => {
    validate(
      val,
      isInstance(PDFObject),
      'PDFArray.set() requires values to be PDFObjects',
    );

    this.array.push(val);
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

  forEach = (...args: any) => this.array.forEach(...args);
  map = (...args: any) => this.array.map(...args);

  dereference = (
    indirectObjects: Map<PDFIndirectReference, PDFIndirectObject>,
  ) => {
    this.array.forEach((val, idx) => {
      if (val instanceof PDFIndirectReference) {
        const obj = indirectObjects.get(val);
        if (!obj) error(`Failed to dereference: ${val.toString()}`);
        else this.array[idx] = obj;
      }
    });
  };

  bytesSize = () =>
    2 + // "[ "
    _(this.array)
      .map(e => {
        if (e.is(PDFIndirectObject)) return e.toReference().length + 1;
        else if (e.is(PDFObject)) return e.bytesSize() + 1;
        return error(`Not a PDFObject: ${e.constructor.name}`);
      })
      .sum() +
    1; // "]";

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('[ ', buffer);

    this.array.forEach((e, idx) => {
      if (e.is(PDFIndirectObject)) {
        remaining = addStringToBuffer(e.toReference(), remaining);
      } else if (e.is(PDFObject)) {
        remaining = e.copyBytesInto(remaining);
      } else {
        error(`Not a PDFObject: ${e.constructor.name}`);
      }
      remaining = addStringToBuffer(' ', remaining);
    });

    remaining = addStringToBuffer(']', remaining);
    return remaining;
  };
}

export default PDFArray;
