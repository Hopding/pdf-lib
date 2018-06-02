/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';
import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

/**
 * Set the specified parameters in the graphics state.
 * dictName shall be the name of a graphics state parameter dictionary in the
 *  ExtGState subdictionary of the current resource dictionary.
 */
class gs extends PDFOperator {
  static of = (dictName: string) => new gs(dictName);

  dictName: string;

  // TODO: See if the "dictName" must be preceded by a "/" or not...
  // TODO: Should "dictName" be a PDFName?
  constructor(dictName: string) {
    super();
    validate(
      dictName,
      _.isString,
      'gs operator arg "dictName" must be a string.',
    );
    this.dictName = dictName;
  }

  toString = (): string => `${this.dictName} gs\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default gs;
