/* @flow */
/* eslint-disable new-cap */
import _ from 'lodash';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import {
  PDFString,
  PDFHexString,
  PDFNumber,
  PDFArray,
} from 'core/pdf-objects/index';

import { or, addStringToBuffer } from 'utils';
import { validate, validateArr, isInstance, isNumber } from 'utils/validate';

/**
Show a text string.
*/
export class Tj extends PDFOperator {
  string: PDFString | PDFHexString;

  constructor(string: PDFString | PDFHexString | string) {
    super();
    validate(
      string,
      or(isInstance(PDFString), isInstance(PDFHexString), _.isString),
      'Tj operator arg "string" must be one of: PDFString, PDFHexString, String',
    );
    // TODO: Fix these suppressions...
    if (_.isString(string)) {
      // $SuppressFlow
      this.string = PDFString.fromString(string);
      // $SuppressFlow
    } else this.string = string;
  }

  static of = (string: PDFString | PDFHexString | string) => new Tj(string);

  toString = (): string => `${this.string.toString()} Tj\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
Show one or more text strings, allowing individual glyph positioning.
Each element of array shall be either a string or a number. If the element is a
string, this operator shall show the string. If it is a number, the operator
shall adjust the text position by that amount; that is, it shall translate the
text matrix, Tm. The number shall be expressed in thousandths of a unit of text
space. This amount shall be subtracted from the current horizontal or vertical
coordinate, depending on the writing mode. In the default coordinate system, a
positive adjustment has the effect of moving the next glyph painted either to
the left or down by the given amount. Figure 46 shows an example of the effect
of passing offsets to TJ.
*/
export class TJ extends PDFOperator {
  array: PDFArray<PDFString | PDFHexString | PDFNumber>;

  constructor(array: (PDFString | PDFHexString | string | number)[]) {
    super();
    validateArr(
      array,
      or(
        isInstance(PDFString),
        isInstance(PDFHexString),
        isInstance(PDFNumber),
        _.isString,
        isNumber,
      ),
      'TJ operator arg "array" elements must be one of: PDFString, PDFHexString, PDFNumber, String, Number',
    );

    // TODO: Fix all of these suppressions...
    // $SuppressFlow
    this.array = PDFArray.fromArray(
      // $SuppressFlow
      array.map(elem => {
        // $SuppressFlow
        if (_.isString(elem)) return PDFString.fromString(elem);
        else if (_.isNumber(elem)) {
          // $SuppressFlow
          return PDFNumber.fromNumber(elem);
        }
        return elem;
      }),
    );
  }

  static of = (array: (PDFString | PDFHexString | string | number)[]) =>
    new TJ(array);

  bytesSize = () => this.array.bytesSize() + 4; // "...<array> TJ\n"

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = this.array.copyBytesInto(buffer);
    remaining = addStringToBuffer(' TJ\n');
    return remaining;
  };
}
