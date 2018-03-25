/* eslint-disable new-cap */
import {
  PDFArray,
  PDFHexString,
  PDFNumber,
  PDFString,
} from 'core/pdf-objects/index';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import _ from 'lodash';

import { addStringToBuffer, or } from 'utils';
import { isInstance, isNumber, validate, validateArr } from 'utils/validate';

/**
Show a text string.
*/
export class Tj extends PDFOperator {
  public string: PDFString | PDFHexString;

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

  public static of = (string: PDFString | PDFHexString | string) => new Tj(string);

  public toString = () => this.string.toString() + ' Tj\n';

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
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
  public array: PDFArray<PDFString | PDFHexString | PDFNumber>;

  constructor(array: Array<PDFString | PDFHexString | string | number>) {
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

    this.array = PDFArray.fromArray(
      array.map((elem) => {
        if (_.isString(elem)) return PDFString.fromString(elem);
        else if (_.isNumber(elem)) return PDFNumber.fromNumber(elem);
        return elem;
      }),
    );
  }

  public static of = (array: Array<PDFString | PDFHexString | string | number>) =>
    new TJ(array)

  public bytesSize = () => this.array.bytesSize() + 4; // "...<array> TJ\n"

  public copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = this.array.copyBytesInto(buffer);
    remaining = addStringToBuffer(' TJ\n', buffer);
    return remaining;
  }
}
