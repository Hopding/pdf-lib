/* @flow */
import _ from 'lodash';

import PDFObject from './PDFObject';
import PDFIndirectObject from './PDFIndirectObject';

class PDFDictionary extends PDFObject {
  object: { [string]: PDFObject } = {};

  constructor(object: Object) {
    super();
    this.object = object;
  }

  set = (key: string, val: any) => {
    this.object[key] = val;
    return this;
  }

  get = (key: string) => this.object[key];

  toString = () => {
    let str = '<<\n';
    _.forEach(this.object, (val, key) => {
      str += `/${key} `;
      if (val instanceof PDFIndirectObject) str += `${val.toReference()}\n`;
      else if (val instanceof PDFObject) str += `${val.toString()}\n`;
      else throw new Error(`Not a PDFObject: ${val.constructor.name}`);
    });
    str += '>>';

    return str;
  }
}

export default PDFDictionary;
