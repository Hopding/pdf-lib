/* @flow */
import _ from 'lodash';

import { PDFIndirectObject, PDFName } from 'core/pdf-objects';
import { or, and, not, error, addStringToBuffer, arrayToString } from 'utils';
import { validate, isInstance } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import PDFObject from './PDFObject';

class PDFDictionary extends PDFObject {
  map: Map<PDFName, any>;
  index: PDFObjectIndex;
  validKeys: ReadonlyArray<string>;

  constructor(
    object?: { [key: string]: PDFObject } | Map<PDFName, any>,
    index?: PDFObjectIndex,
    validKeys?: ReadonlyArray<string>,
  ) {
    super();
    validate(
      object,
      and(not(_.isNil), or(_.isObject, isInstance(Map))),
      'PDFDictionary can only be constructed from an Object or a Map',
    );
    validate(
      index,
      isInstance(PDFObjectIndex),
      '"index" must be an instance of PDFObjectIndex',
    );

    this.index = index;
    this.validKeys = validKeys;

    if (object instanceof Map) {
      this.map = object;
    } else {
      this.map = new Map();
      _(object).forEach((val, key) => this.set(key, val, false));
    }
  }

  static from = (
    object: { [key: string]: PDFObject } | Map<PDFName, any>,
    index: PDFObjectIndex,
  ) => new PDFDictionary(object, index);

  filter = (predicate: (o: PDFObject, n: PDFName) => boolean) =>
    Array.from(this.map.entries()).filter(([key, val]) => predicate(val, key));

  set = (
    key: string | PDFName,
    val: PDFObject,
    validateKeys = true,
  ) => {
    validate(
      key,
      or(_.isString, isInstance(PDFName)),
      'PDFDictionary.set() requires keys to be strings or PDFNames',
    );
    validate(
      val,
      isInstance(PDFObject),
      'PDFDictionary.set() requires values to be PDFObjects',
    );

    const keyName = key instanceof PDFName ? key : PDFName.from(key);
    if (
      validateKeys &&
      this.validKeys &&
      !this.validKeys.includes(keyName.key)
    ) {
      error(`Invalid key: "${keyName.key}"`);
    }
    this.map.set(keyName, val);

    return this;
  };

  get = <T extends PDFObject>(key: string | PDFName): T => {
    validate(
      key,
      or(_.isString, isInstance(PDFName)),
      'PDFDictionary.set() requires keys to be strings or PDFNames',
    );

    const keyName = key instanceof PDFName ? key : PDFName.from(key);
    return this.map.get(keyName) || error(`Missing PDFDictionary entry "${String(key)}".`);
  };

  toString = (): string => {
    const buffer = new Uint8Array(this.bytesSize());
    this.copyBytesInto(buffer);
    return arrayToString(buffer);
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
