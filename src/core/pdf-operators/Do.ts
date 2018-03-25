/* @flow */
/* eslint-disable new-cap */
import _ from 'lodash';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

/**
Draws the XObject with the given name in the current Page's Resource dictionary.
*/
class Do extends PDFOperator {
  name: string;

  // TODO: See if the "name" must be preceded by a "/" or not...
  constructor(name: string) {
    super();
    validate(name, _.isString, 'Do operator arg "name" must be a string.');
    this.name = name;
  }

  static of = (name: string) => new Do(name);

  toString = (): string => `${this.name} Do\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default Do;
