import chain from 'lodash/chain';

import {
  colorOperators,
  generalGraphicsStateOperators,
  textPositioningOperators,
  textShowingOperators,
  textStateOperators,
} from 'core/pdf-operators';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { addStringToBuffer, arrayToString } from 'utils';
import { isInstance, validateArr } from 'utils/validate';

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

  // Note we have to force the cast to type "number" because
  // of a bug in '@types/lodash':
  //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/21206
  operatorsBytesSize = (): number =>
    chain(this.operators)
      .filter(Boolean)
      .map((op) => op.bytesSize())
      .sum() as any;

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
