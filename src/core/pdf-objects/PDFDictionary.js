/* @flow */
import _ from 'lodash';

import {
  PDFIndirectReference,
  PDFIndirectObject,
  PDFName,
} from 'core/pdf-objects';
import { or, and, not, error, addStringToBuffer, arrayToString } from 'utils';
import { validate, isInstance } from 'utils/validate';

import type { PDFObjectLookup } from 'core/pdf-document/PDFObjectIndex';

import PDFObject from './PDFObject';

class PDFDictionary extends PDFObject {
  map: Map<PDFName, any>;
  lookup: PDFObjectLookup;
  validKeys: ?Array<string>;

  constructor(
    object?: { [string]: PDFObject } | Map<PDFName, any>,
    lookup: PDFObjectLookup,
    validKeys: ?(string[]),
  ) {
    super();
    validate(
      object,
      and(not(_.isNil), or(_.isObject, isInstance(Map))),
      'PDFDictionary can only be constructed from an Object or a Map',
    );
    validate(lookup, _.isFunction, '"lookup" must be a function');

    this.lookup = lookup;
    this.validKeys = validKeys;

    if (object instanceof Map) {
      this.map = object;
    } else {
      this.map = new Map();
      _(object).forEach((val, key) => this.set(key, val, false));
    }
  }

  static from = (
    object: { [string]: PDFObject } | PDFDictionary,
    lookup: PDFObjectLookup,
  ) => new PDFDictionary(object, lookup);

  filter = (predicate: (PDFObject, PDFName) => boolean) =>
    Array.from(this.map.entries()).filter(([key, val]) => predicate(val, key));

  set = (
    key: string | PDFName,
    val: PDFObject,
    validateKeys: ?boolean = true,
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

  get = (key: string | PDFName) => {
    validate(
      key,
      or(_.isString, isInstance(PDFName)),
      'PDFDictionary.set() requires keys to be strings or PDFNames',
    );

    const keyName = key instanceof PDFName ? key : PDFName.from(key);
    return this.map.get(keyName);
  };

  dereference = (
    indirectObjects: Map<PDFIndirectReference, PDFIndirectObject<*>>,
  ) => {
    const failures = [];
    this.filter(isInstance(PDFIndirectReference)).forEach(([key, val]) => {
      const indirectObj = indirectObjects.get(val);
      if (indirectObj) this.set(key, indirectObj, false);
      else {
        const msg = `Failed to dereference: (${key.toString()}, ${val})`;
        // For an unknown reason, '/Obj' values somtimes fail to dereference...
        // if (
        //   [
        //     PDFName.from('Obj'),
        //     PDFName.from('Annots'),
        //     PDFName.from('Info'),
        //   ].includes(key)
        // ) {
        //   console.warn(msg);
        // } else error(msg);
        failures.push([key.toString(), val.toString()]);
      }
    });
    return failures;
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
