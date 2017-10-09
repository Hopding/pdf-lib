/* @flow */
import _ from 'lodash';
import { charCodes, charCode } from '../utils';

import PDFObject from './PDFObject';
import PDFIndirectObject from './PDFIndirectObject';
import PDFName from './PDFName';

class PDFDictionary extends PDFObject {
  map: Map<PDFName, PDFObject> = new Map();

  constructor(object: ?{ [string]: PDFObject }) {
    super();
    if (object) {
      _.forEach(object, (val, key) => {
        this.set(key, val);
      });
    }
  }

  static fromObject = object => new PDFDictionary(object);

  set = (key: string | PDFName, val: PDFObject) => {
    if (typeof key !== 'string' && !(key instanceof PDFName)) {
      throw new Error(
        'PDFDictionary.set() requires keys to be strings or PDFNames',
      );
    }
    if (!(val instanceof PDFObject)) {
      throw new Error('PDFDictionary.set() requires values to be PDFObjects');
    }

    if (typeof key === 'string') this.map.set(PDFName.forString(key), val);
    else this.map.set(key, val);
    return this;
  };

  get = (key: string | PDFName) => {
    if (typeof key !== 'string' && !(key instanceof PDFName)) {
      throw new Error(
        'PDFDictionary.set() requires keys to be strings or PDFNames',
      );
    }

    if (typeof key === 'string') return this.map.get(PDFName.forString(key));
    return this.map.get(key);
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

  toBytes = (): Uint8Array => {
    const bytes = [...charCodes('<<\n')];

    this.map.forEach((val, key) => {
      bytes.push(...charCodes(`${key.toString()} `));
      if (val instanceof PDFIndirectObject) {
        bytes.push(...charCodes(val.toReference()));
      } else if (val instanceof PDFObject) {
        bytes.push(...val.toBytes());
      } else {
        throw new Error(`Not a PDFObject: ${val.constructor.name}`);
      }
      bytes.push(charCode('\n'));
    });

    bytes.push(...charCodes('>>'));
    return new Uint8Array(bytes);
  };
}

export default PDFDictionary;
