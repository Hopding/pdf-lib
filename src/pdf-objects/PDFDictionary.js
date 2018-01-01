/* @flow */
import _ from 'lodash';
import { error, addStringToBuffer, charCodes, charCode } from '../utils';

import PDFObject from './PDFObject';
import { PDFIndirectReference, PDFIndirectObject, PDFName } from '.';

class PDFDictionary extends PDFObject {
  map: Map<PDFName, any> = new Map();
  validKeys: ?Array<string>;

  constructor(object: ?{ [string]: PDFObject }, validKeys: ?Array<string>) {
    super();

    this.validKeys = validKeys;
    if (object) {
      _.forEach(object, (val, key) => {
        this.set(key, val, false);
      });
    }
  }

  static from = object => new PDFDictionary(object);

  filter = (predicate: (any, PDFName) => boolean) =>
    Array.from(this.map.entries()).filter(([key, value]) =>
      predicate(value, key),
    );

  find = (predicate: (any, PDFName) => boolean) =>
    Array.from(this.map.entries()).find(([key, value]) =>
      predicate(value, key),
    );

  set = (key: string | PDFName, val: PDFObject, validate: ?boolean = true) => {
    if (typeof key !== 'string' && !(key instanceof PDFName)) {
      error('PDFDictionary.set() requires keys to be strings or PDFNames');
    }
    if (!(val instanceof PDFObject)) {
      error(
        `PDFDictionary.set() requires values to be PDFObjects, found: "${val
          .constructor.name}"`,
      );
    }

    const keyName = typeof key === 'string' ? PDFName.from(key) : key;
    if (validate && this.validKeys && !this.validKeys.includes(keyName.key)) {
      error(`Invalid key: "${keyName.key}"`);
    }
    this.map.set(keyName, val);

    return this;
  };

  get = (key: string | PDFName) => {
    if (typeof key !== 'string' && !(key instanceof PDFName)) {
      throw new Error(
        'PDFDictionary.set() requires keys to be strings or PDFNames',
      );
    }

    if (typeof key === 'string') return this.map.get(PDFName.from(key));

    return this.map.get(key);
  };

  dereference = (
    indirectObjects: Map<PDFIndirectReference, PDFIndirectObject>,
  ) => {
    this.map.forEach((val, key) => {
      if (val instanceof PDFIndirectReference) {
        const obj = indirectObjects.get(val);

        if (!obj) {
          console.log(`key.constructor.name === "${key.constructor.name}"`);
          console.log(`key.key === "${key.key}"`);
          console.log(`key.key.length === "${key.key.length}"`);
          // console.log(`key.toString() === "${key.toString()}"`);
          // console.log(`key.toString().length === "${key.toString().length}"`);
          const msg = `Failed to dereference: (${key.toString()}, ${val.toString()})`;

          // For some reason, '/Obj' values always seem to fail dereferencing.
          // This still seems to be a bug, however.
          if (key.toString() === '/Obj') console.warn(msg);
          else throw new Error(msg);
        } else {
          if (key.toString() === '/Obj') {
            console.log(
              `Successfully dereferenced (${key.toString()}, ${val.toString()})`,
            );
          }
          this.set(key, obj);
        }
      }
    });
  };

  toString = () => {
    let str = '<<\n';
    this.map.forEach((val, key) => {
      str += `${key.toString()} `;
      if (val instanceof PDFIndirectObject) str += `${val.toReference()}\n`;
      else if (val instanceof PDFObject) str += `${val.toString()}\n`;
      else throw new Error(`Not a PDFObject: ${val.constructor.name}`);
    });
    str += '>>';

    return str;
  };

  bytesSize = () =>
    3 + // "<<\n"
    _(Array.from(this.map.entries()))
      .map(([key, val]) => {
        const keySize = `${key.toString()} `.length;
        if (val instanceof PDFIndirectObject) {
          return keySize + val.toReference().length + 1;
        } else if (val instanceof PDFObject) {
          return keySize + val.bytesSize() + 1;
        }
        throw new Error(`Not a PDFObject: ${val.constructor.name}`);
      })
      .sum() +
    2; // ">>"

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('<<\n', buffer);
    this.map.forEach((val, key) => {
      remaining = addStringToBuffer(`${key.toString()} `, remaining);
      if (val instanceof PDFIndirectObject) {
        remaining = addStringToBuffer(val.toReference(), remaining);
      } else if (val instanceof PDFObject) {
        remaining = val.copyBytesInto(remaining);
      } else {
        throw new Error(`Not a PDFObject: ${val.constructor.name}`);
      }
      remaining = addStringToBuffer('\n', remaining);
    });
    remaining = addStringToBuffer('>>', remaining);
    return remaining;
  };
}

export default PDFDictionary;
