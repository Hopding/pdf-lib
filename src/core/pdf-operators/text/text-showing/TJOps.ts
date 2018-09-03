/* tslint:disable:max-classes-per-file class-name */
import add from 'lodash/add';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { PDFHexString, PDFNumber, PDFString } from 'core/pdf-objects/index';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, arrayToString, error, or } from 'utils';
import { isInstance, validate, validateArr } from 'utils/validate';

/**
 * Show a text string.
 */
export class Tj extends PDFOperator {
  static of = (str: PDFString | PDFHexString | string) => new Tj(str);

  string: PDFString | PDFHexString;

  constructor(str: PDFString | PDFHexString | string) {
    super();
    validate(
      str,
      or(isInstance(PDFString), isInstance(PDFHexString), isString),
      'Tj operator arg "str" must be one of: PDFString, PDFHexString, String',
    );
    this.string = isString(str) ? PDFString.fromString(str) : str;
  }

  toString = () => `${this.string} Tj\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
 * Show one or more text strings, allowing individual glyph positioning.
 * Each element of array shall be either a string or a number.
 * If the element is a string, this operator shall show the string.
 * If it is a number, the operator shall adjust the text position by that
 *  amount; that is, it shall translate the text matrix, Tm.
 * The number shall be expressed in thousandths of a unit of text space.
 * This amount shall be subtracted from the current horizontal or vertical
 *   coordinate, depending on the writing mode.
 * In the default coordinate system, a positive adjustment has the effect of
 * moving the next glyph painted either to the left or down by the given amount.
 */
export class TJ extends PDFOperator {
  static of = (...array: Array<PDFString | PDFHexString | string | number>) =>
    new TJ(...array);

  array: Array<PDFString | PDFHexString | PDFNumber>;

  constructor(
    ...array: Array<PDFString | PDFHexString | PDFNumber | string | number>
  ) {
    super();
    if (array.length === 0) {
      error(
        'TJ operator requires  PDFStrings, PDFHexStrings, PDFNumbers, Strings, or Numbers to be constructed',
      );
    }
    validateArr(
      array,
      or(
        isInstance(PDFString),
        isInstance(PDFHexString),
        isInstance(PDFNumber),
        isString,
        isNumber,
      ),
      'TJ operator arg elements must be one of: PDFString, PDFHexString, PDFNumber, String, Number',
    );

    // prettier-ignore
    this.array = array.map((elem) =>
        isString(elem) ? PDFString.fromString(elem)
      : isNumber(elem) ? PDFNumber.fromNumber(elem)
      : elem
    );
  }

  toString = () => {
    const buffer = new Uint8Array(this.bytesSize());
    this.copyBytesInto(buffer);
    return arrayToString(buffer);
  };

  bytesSize = (): number =>
    this.array.map((elem) => elem.bytesSize()).reduce(add, 0) +
    this.array.length + // Spaces between elements
    4 + // "[ " and "]"
    3; // The "TJ" characters and trailing newline

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('[ ', buffer);
    this.array.forEach((elem) => {
      remaining = elem.copyBytesInto(remaining);
      remaining = addStringToBuffer(' ', remaining);
    });
    remaining = addStringToBuffer('] TJ\n', remaining);
    return remaining;
  };
}
