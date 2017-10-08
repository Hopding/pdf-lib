/* @flow */
import _ from 'lodash';

import PDFObject from './PDFObject';
import PDFIndirectObject from './PDFIndirectObject';
import PDFName from './PDFName';

class PDFDictionary extends PDFObject {
  map: Map<PDFName, PDFObject> = new Map();

  constructor(object: ?{ [string]: PDFObject }) {
    super();
    if (object) {
      _.forEach(object, (val, key) => {
        if (typeof key !== 'string') {
          throw new Error(
            'Cannot construct PDFDictionary from object whose keys are not strings',
          );
        }
        if (!(val instanceof PDFObject)) {
          throw new Error(
            'Cannot construct PDFDictionary from object whose values are not PDFObjects',
          );
        }
        this.map.set(PDFName.forString(key), val);
      });
    }
  }

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
      str += key.toString();
      if (val instanceof PDFIndirectObject) str += `${val.toReference()}\n`;
      else if (val instanceof PDFObject) str += `${val.toString()}\n`;
      else throw new Error(`Not a PDFObject: ${val.constructor.name}`);
    });
    str += '>>';

    return str;
  };
}

export default PDFDictionary;
