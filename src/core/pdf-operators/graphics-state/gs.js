/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isNumber } from '../../../utils/validate';

/**
Set the specified parameters in the graphics state. dictName shall be the name
of a graphics state parameter dictionary in the ExtGState subdictionary of the
current resource dictionary.
*/
class gs extends PDFOperator {
  dictName: number;

  constructor(dictName: number) {
    super();
    validate(
      dictName,
      isNumber,
      'gs operator arg "dictName" must be a number.',
    );
    this.dictName = dictName;
  }

  static of = (dictName: number) => new gs(dictName);

  toString = (): string => `${this.dictName} gs\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default gs;
