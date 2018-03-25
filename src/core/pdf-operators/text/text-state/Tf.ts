/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';
import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
Set the text font, Tf, to font and the text font size, Tfs, to size. font shall
be the name of a font resource in the Font subdictionary of the current resource
dictionary; size shall be a number representing a scale factor. There is no
initial value for either font or size; they shall be specified explicitly by
using Tf before any text is shown.
*/
class Tf extends PDFOperator {
  public font: string; // TODO: Should this be a PDFName?
  public size: number;

  constructor(font: string, size: number) {
    super();
    validate(font, _.isString, 'Tf operator arg "font" must be a string.');
    validate(size, isNumber, 'Tf operator arg "size" must be a number.');
    this.font = font;
    this.size = size;
  }

  public static of = (font: string, size: number) => new Tf(font, size);

  public toString = (): string => `${this.font} ${this.size} Tf\n`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

export default Tf;
