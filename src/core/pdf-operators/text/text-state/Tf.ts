/* eslint-disable new-cap */
import isString from 'lodash/isString';

import { PDFName } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, or } from 'utils';
import { isInstance, isNumber, validate } from 'utils/validate';

/**
 * Set the text font, Tf, to font and the text font size, Tfs, to size. font shall
 * be the name of a font resource in the Font subdictionary of the current resource
 * dictionary; size shall be a number representing a scale factor. There is no
 * initial value for either font or size; they shall be specified explicitly by
 * using Tf before any text is shown.
 */
class Tf extends PDFOperator {
  static of = (font: string | PDFName, size: number) => new Tf(font, size);

  font: PDFName;
  size: number;

  constructor(font: string | PDFName, size: number) {
    super();
    validate(
      font,
      or(isString, isInstance(PDFName)),
      'Tf operator arg "font" must be a string or PDFName.',
    );
    validate(size, isNumber, 'Tf operator arg "size" must be a number.');
    this.font = isString(font) ? PDFName.from(font) : font;
    this.size = size;
  }

  toString = (): string => `${this.font} ${this.size} Tf\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default Tf;
