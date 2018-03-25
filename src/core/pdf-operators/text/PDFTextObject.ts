/* eslint-disable class-methods-use-this */
/* eslint-disable getter-return */
import _ from 'lodash';

import PDFOperator from 'core/pdf-operators/PDFOperator';
import { addStringToBuffer } from 'utils';
import { isInstance, validateArr } from 'utils/validate';

// TODO: Validate that only valid text operators are passed to this object.
class PDFTextObject extends PDFOperator {
  public operators: PDFOperator[];

  constructor(...operators: PDFOperator[]) {
    super();
    PDFTextObject.validateOperators(operators);
    this.operators = operators;
  }

  public static of = (...operators: PDFOperator[]) =>
    new PDFTextObject(...operators)

  public static validateOperators = (elements: any[]) =>
    validateArr(
      elements,
      isInstance(PDFOperator),
      'only PDFOperators can be pushed to a PDFTextObject',
    )

  public operatorsBytesSize = () =>
    _(this.operators)
      .filter(Boolean)
      .map((op) => op.bytesSize())
      .sum()

  public bytesSize = () =>
    3 + // "BT\n"
    this.operatorsBytesSize() +
    3 // "ET\n"

  public copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('BT\n', buffer);

    remaining = this.operators
      .filter(Boolean)
      .reduce(
        (remBytes: Uint8Array, op: PDFOperator) => op.copyBytesInto(remBytes),
        remaining,
      );

    remaining = addStringToBuffer('ET\n', remaining);
    return remaining;
  }
}

export default PDFTextObject;
