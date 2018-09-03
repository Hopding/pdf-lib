import add from 'lodash/add';

import {
  colorOperators,
  generalGraphicsStateOperators,
  textPositioningOperators,
  textShowingOperators,
  textStateOperators,
} from 'core/pdf-operators';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { addStringToBuffer, arrayToString } from 'utils';
import { validateArr } from 'utils/validate';

const validCategories = [
  ...colorOperators,
  ...generalGraphicsStateOperators,
  ...textPositioningOperators,
  ...textShowingOperators,
  ...textStateOperators,
];

// TODO: Validate that only valid text operators are passed or pushed to this object.
class PDFTextObject extends PDFOperator {
  static of = (...operators: PDFOperator[]) => new PDFTextObject(...operators);

  static validateOperators = (elements: PDFOperator[]) =>
    validateArr(
      elements,
      (op: PDFOperator) =>
        validCategories.some((category: any) => op instanceof category),
      'only PDF text operators can be pushed to a PDFTextObject',
    );

  operators: PDFOperator[];

  constructor(...operators: PDFOperator[]) {
    super();
    PDFTextObject.validateOperators(operators);
    this.operators = operators;
  }

  operatorsBytesSize = (): number =>
    this.operators
      .filter(Boolean)
      .map((op) => op.bytesSize())
      .reduce(add, 0);

  toString = () => {
    const buffer = new Uint8Array(this.bytesSize());
    this.copyBytesInto(buffer);
    return arrayToString(buffer);
  };

  bytesSize = () =>
    3 + // "BT\n"
    this.operatorsBytesSize() +
    3; // "ET\n"

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('BT\n', buffer);

    remaining = this.operators
      .filter(Boolean)
      .reduce(
        (remBytes: Uint8Array, op: PDFOperator) => op.copyBytesInto(remBytes),
        remaining,
      );

    remaining = addStringToBuffer('ET\n', remaining);
    return remaining;
  };
}

export default PDFTextObject;
