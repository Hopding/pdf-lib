/* @flow */
import _ from 'lodash';
import { error, addStringToBuffer, arrayToString } from 'utils';
import { validate, validateArr, isInstance } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import PDFObject from './PDFObject';
import { PDFIndirectObject } from '.';

class PDFArray<T: $Subtype<PDFObject>> extends PDFObject {
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

  static fromArray = (array: Array<T>, index: PDFObjectIndex) =>
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

  forEach = (...args: any) => this.array.forEach(...args);
  map = (...args: any) => this.array.map(...args);
  splice = (...args: any) => this.array.splice(...args);

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
        if (e.is(PDFIndirectObject)) return e.toReference().length + 1;
        else if (e.is(PDFObject)) return e.bytesSize() + 1;
        return error(`Not a PDFObject: ${e.constructor.name}`);
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
        error(`Not a PDFObject: ${e.constructor.name}`);
      }
      remaining = addStringToBuffer(' ', remaining);
    });

    remaining = addStringToBuffer(']', remaining);
    return remaining;
  };
}

export default PDFArray;
