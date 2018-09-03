import add from 'lodash/add';
import isNumber from 'lodash/isNumber';

import { addStringToBuffer, arrayToString, error } from 'utils';
import { isInstance, validate, validateArr } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import {
  PDFDictionary,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFStream,
} from '.';
import PDFObject from './PDFObject';

class PDFArray<T extends PDFObject = PDFObject> extends PDFObject {
  static fromArray = <A extends PDFObject>(array: A[], index: PDFObjectIndex) =>
    new PDFArray(array, index);

  array: T[];
  index: PDFObjectIndex;

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

  push = (...val: T[]) => {
    validateArr(
      val,
      isInstance(PDFObject),
      'PDFArray.push() requires arguments to be PDFObjects',
    );

    this.array.push(...val);
    return this;
  };

  set = (idx: number, val: T) => {
    validate(idx, isNumber, 'PDFArray.set() requires indexes to be numbers');
    validate(
      val,
      isInstance(PDFObject),
      'PDFArray.set() requires values to be PDFObjects',
    );

    this.array[idx] = val;
    return this;
  };

  get = (idx: number) => {
    validate(idx, isNumber, 'PDFArray.set() requires indexes to be numbers');
    return this.array[idx];
  };

  forEach = (fn: (value: T, index: number, array: T[]) => void) =>
    this.array.forEach(fn);
  map = <U>(fn: (value: T, index: number, array: T[]) => U) =>
    this.array.map(fn);
  splice = (start: number, deleteCount?: number) =>
    this.array.splice(start, deleteCount);

  recursiveTraverse = (
    destIndex: PDFObjectIndex,
    mappedRefs: Map<PDFIndirectReference, PDFIndirectReference>,
    nextObjectNumber: () => number,
  ) => {
    this.array.forEach((value, idx) => {
      console.log('Value:', value.toString());
      if (value instanceof PDFDictionary || value instanceof PDFArray) {
        value.recursiveTraverse(destIndex, mappedRefs, nextObjectNumber);
      }

      if (value instanceof PDFIndirectReference) {
        console.log('Found Ref:', value.toString());
        const alreadyMapped = mappedRefs.has(value);
        if (alreadyMapped) {
          this.array[idx] = mappedRefs.get(value) as any;
        } else {
          const dereferencedValue = this.index.lookup(value);

          const newRef = PDFIndirectReference.forNumbers(nextObjectNumber(), 0);
          destIndex.set(newRef, dereferencedValue);
          mappedRefs.set(value, newRef);

          if (dereferencedValue instanceof PDFStream) {
            console.log('Dereferenced (Stream) Dict:');
            dereferencedValue.dictionary.recursiveTraverse(
              destIndex,
              mappedRefs,
              nextObjectNumber,
            );
          } else if (
            dereferencedValue instanceof PDFDictionary ||
            dereferencedValue instanceof PDFArray
          ) {
            dereferencedValue.recursiveTraverse(
              destIndex,
              mappedRefs,
              nextObjectNumber,
            );
          } else {
            console.log('Dereferenced:', dereferencedValue.toString());
          }

          this.array[idx] = newRef as any;
        }
      }

      console.log();
    });
  };

  toString = (): string => {
    const bufferSize = this.bytesSize();
    const buffer = new Uint8Array(bufferSize);
    this.copyBytesInto(buffer);
    return arrayToString(buffer);
  };

  bytesSize = (): number =>
    2 + // "[ "
    this.array
      .map((e) => {
        if (e instanceof PDFIndirectObject) return e.toReference().length + 1;
        else if (e instanceof PDFObject) return e.bytesSize() + 1;
        return error(`Not a PDFObject: ${e}`);
      })
      .reduce(add, 0) +
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
