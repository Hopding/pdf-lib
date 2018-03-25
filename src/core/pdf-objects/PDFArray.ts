import _ from 'lodash';
import { addStringToBuffer, arrayToString, error } from 'utils';
import { isInstance, validate, validateArr } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import { PDFIndirectObject } from '.';
import PDFObject from './PDFObject';

class PDFArray<T extends PDFObject = PDFObject> extends PDFObject {
  public static fromArray = <A extends PDFObject>(
    array: A[],
    index?: PDFObjectIndex,
  ) => new PDFArray(array, index)

  public array: T[];
  public index: PDFObjectIndex;

  constructor(array: T[], index: PDFObjectIndex) {
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

  public push = (...val: T[]) => {
    validateArr(
      val,
      isInstance(PDFObject),
      'PDFArray.push() requires arguments to be PDFObjects',
    );

    this.array.push(...val);
    return this;
  }

  public set = (idx: number, val: any) => {
    validate(idx, _.isNumber, 'PDFArray.set() requires indexes to be numbers');
    validate(
      val,
      isInstance(PDFObject),
      'PDFArray.set() requires values to be PDFObjects',
    );

    this.array[idx] = val;
    return this;
  }

  public get = (idx: number) => {
    validate(idx, _.isNumber, 'PDFArray.set() requires indexes to be numbers');
    return this.array[idx];
  }

  public forEach = (fn: (value: T, index: number, array: T[]) => void) =>
    this.array.forEach(fn)
  public map = <U>(fn: (value: T, index: number, array: T[]) => U) =>
    this.array.map(fn)
  public splice = (start: number, deleteCount?: number) =>
    this.array.splice(start, deleteCount)

  public toString = (): string => {
    const bufferSize = this.bytesSize();
    const buffer = new Uint8Array(bufferSize);
    this.copyBytesInto(buffer);
    return arrayToString(buffer);
  }

  public bytesSize = () =>
    2 + // "[ "
    _(this.array)
      .map((e) => {
        if (e instanceof PDFIndirectObject) return e.toReference().length + 1;
        else if (e instanceof PDFObject) return e.bytesSize() + 1;
        return error(`Not a PDFObject: ${e}`);
      })
      .sum() +
    1 // "]";

  public copyBytesInto = (buffer: Uint8Array): Uint8Array => {
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
  }
}

export default PDFArray;
