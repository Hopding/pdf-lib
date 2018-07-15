import add from 'lodash/add';
import forEach from 'lodash/forEach';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';

import { PDFIndirectObject, PDFName } from 'core/pdf-objects';
import { addStringToBuffer, and, arrayToString, error, not, or } from 'utils';
import { isInstance, validate } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import PDFObject from './PDFObject';

class PDFDictionary extends PDFObject {
  static from = (
    object: { [key: string]: PDFObject } | Map<PDFName, any>,
    index: PDFObjectIndex,
  ) => new PDFDictionary(object, index);

  map: Map<PDFName, any>;
  index: PDFObjectIndex;
  validKeys?: ReadonlyArray<string>;

  constructor(
    object: { [key: string]: PDFObject } | Map<PDFName, any>,
    index: PDFObjectIndex,
    validKeys?: ReadonlyArray<string>,
  ) {
    super();
    validate(
      object,
      and(not(isNil), or(isPlainObject, isInstance(Map))),
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
      forEach(object, (val, key) => this.set(key, val, false));
    }
  }

  filter = (predicate: (o: PDFObject, n: PDFName) => boolean) =>
    Array.from(this.map.entries()).filter(([key, val]) => predicate(val, key));

  getMaybe = <T extends PDFObject>(key: string | PDFName): T | void => {
    validate(
      key,
      or(isString, isInstance(PDFName)),
      'PDFDictionary.set() requires keys to be strings or PDFNames',
    );

    const keyName = key instanceof PDFName ? key : PDFName.from(key);
    return this.map.get(keyName);
  };

  get = <T extends PDFObject>(key: string | PDFName): T => {
    return this.getMaybe(key) || error(`Missing PDFDictionary entry "${key}".`);
  };

  set = (key: string | PDFName, val: PDFObject, validateKeys = true) => {
    validate(
      key,
      or(isString, isInstance(PDFName)),
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

  toString = (): string => {
    const buffer = new Uint8Array(this.bytesSize());
    this.copyBytesInto(buffer);
    return arrayToString(buffer);
  };

  bytesSize = (): number =>
    3 + // "<<\n"
    Array.from(this.map.entries())
      .map(([key, val]) => {
        const keySize = `${key.toString()} `.length;
        if (val instanceof PDFIndirectObject) {
          return keySize + val.toReference().length + 1;
        } else if (val instanceof PDFObject) {
          return keySize + val.bytesSize() + 1;
        }
        throw new Error(`Not a PDFObject: ${val.constructor.name}`);
      })
      .reduce(add, 0) +
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
