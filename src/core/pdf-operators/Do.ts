/* eslint-disable new-cap */
import _ from 'lodash';

import { PDFName } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, or } from 'utils';
import { isInstance, validate } from 'utils/validate';

/**
 * Draws the XObject with the given name in the current Page's Resource dictionary.
 */
class Do extends PDFOperator {
  static of = (name: string | PDFName) => new Do(name);

  name: PDFName;

  constructor(name: string | PDFName) {
    super();
    validate(
      name,
      or(_.isString, isInstance(PDFName)),
      'Do operator arg "name" must be a string or PDFName.',
    );
    this.name = _.isString(name) ? PDFName.from(name) : name;
  }

  toString = (): string => `${this.name} Do\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default Do;
