/* tslint:disable:max-classes-per-file class-name */
import isString from 'lodash/isString';

import { PDFName } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

/**
 * Set the specified parameters in the graphics state.
 * dictName shall be the name of a graphics state parameter dictionary in the
 *  ExtGState subdictionary of the current resource dictionary.
 */
class gs extends PDFOperator {
  static of = (dictName: string | PDFName) => new gs(dictName);

  dictName: PDFName;

  constructor(dictName: string | PDFName) {
    super();
    validate(
      dictName,
      isString,
      'gs operator arg "dictName" must be a string or PDFName.',
    );
    this.dictName = isString(dictName) ? PDFName.from(dictName) : dictName;
  }

  toString = (): string => `${this.dictName} gs\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default gs;
