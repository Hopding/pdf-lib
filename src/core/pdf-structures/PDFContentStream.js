/* @flow */
/* eslint-disable class-methods-use-this */
/* eslint-disable getter-return */
import _ from 'lodash';

import { PDFStream, PDFNumber } from '../pdf-objects';
import PDFOperator from '../pdf-operators/PDFOperator';
import { addStringToBuffer } from '../../utils';
import { validateArr, isInstance } from '../../utils/validate';

class PDFContentStream extends PDFStream {
  operators: PDFOperator[];

  constructor(...operators: PDFOperator[]) {
    super();
    validateArr(
      operators,
      isInstance(PDFOperator),
      'PDFContentStream can only be constructed from an array of PDFOperator',
    );
    this.operators = operators;

    // TODO: This should be set on every mutation to the operators array...
    this.dictionary.set(
      'Length',
      PDFNumber.fromNumber(this.operatorsBytesSize()),
    );
  }

  static of = (...operators: PDFOperator[]) =>
    new PDFContentStream(...operators);

  operatorsBytesSize = () =>
    _(this.operators)
      .map(op => op.bytesSize())
      .sum();

  bytesSize = () =>
    this.dictionary.bytesSize() +
    1 + // "\n"
    7 + // "stream\n"
    this.operatorsBytesSize() +
    10; // \nendstream

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    this.validateDictionary();
    let remaining = this.dictionary.copyBytesInto(buffer);
    remaining = addStringToBuffer('\nstream\n', remaining);

    remaining = this.operators.reduce(
      (remBytes: Uint8Array, op: PDFOperator) => op.copyBytesInto(remBytes),
      remaining,
    );

    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };
}

export default PDFContentStream;
