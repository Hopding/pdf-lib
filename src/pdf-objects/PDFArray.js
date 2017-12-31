/* @flow */
import _ from 'lodash';
import {
  validate,
  isInstance,
  addStringToBuffer,
  charCodes,
  charCode,
} from '../utils';

import PDFObject from './PDFObject';
import { PDFIndirectReference, PDFIndirectObject } from '.';

class PDFArray<T: PDFObject> extends PDFObject {
  array: Array<T> = [];

  constructor(array: Array<T>) {
    super();
    array.forEach(e => {
      validate(
        e,
        isInstance(PDFObject),
        'Cannot construct PDFArray from array whose elements are not PDFObjects',
      );
      this.array.push(e);
    });
  }

  static fromArray = array => new PDFArray(array);

  push = (val: T) => {
    validate(
      val,
      isInstance(PDFObject),
      'PDFArray.set() requires values to be PDFObjects',
    );

    this.array.push(val);
    return this;
  };

  set = (idx: number, val: T) => {
    validate(idx, _.isNumber, 'PDFArray.set() requires indexes to be numbers');
    validate(
      val,
      isInstance(PDFObject),
      'PDFArray.set() requires values to be PDFObjects',
    );

    this.array[idx] = val;
    return this;
  };

  get = (idx: number): T => {
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
        if (!obj) throw new Error(`Failed to dereference: ${val.toString()}`);
        this.array[idx] = obj;
      }
    });
  };

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

  bytesSize = () =>
    2 + // "[ "
    _(this.array)
      .map(e => {
        if (e instanceof PDFIndirectObject) {
          return e.toReference().length + 1;
        } else if (e instanceof PDFObject) {
          return e.bytesSize() + 1;
        }
        throw new Error(`Not a PDFObject: ${e.constructor.name}`);
      })
      .sum() +
    1; // "]";

  addBytes = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('[ ', buffer);

    this.array.forEach((e, idx) => {
      if (e instanceof PDFIndirectObject) {
        remaining = addStringToBuffer(e.toReference(), remaining);
      } else if (e instanceof PDFObject) {
        remaining = e.addBytes(remaining);
      } else {
        throw new Error(`Not a PDFObject: ${e.constructor.name}`);
      }
      remaining = addStringToBuffer(' ', remaining);
    });

    remaining = addStringToBuffer(']', remaining);
    return remaining;
  };
}

export default PDFArray;
