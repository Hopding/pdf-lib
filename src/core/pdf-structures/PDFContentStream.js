/* @flow */
/* eslint-disable class-methods-use-this */
/* eslint-disable getter-return */
import _ from 'lodash';

import PDFOperator from '../pdf-operators/PDFOperator';
import { PDFStream, PDFNumber } from '../pdf-objects';
import { addStringToBuffer } from '../../utils';
import { typedArrayProxy } from '../../utils/proxies';
import { validateArr, isInstance } from '../../utils/validate';

class PDFContentStream extends PDFStream {
  operators: PDFOperator[];

  constructor(...operators: PDFOperator[]) {
    super();
    PDFContentStream.validateOperators(operators);

    this.operators = typedArrayProxy(operators, PDFOperator, {
      set: property => {
        if (_.isNumber(Number(property))) {
          this.dictionary.get('Length').number = this.operatorsBytesSize();
        }
      },
    });

    this.dictionary.set(
      'Length',
      PDFNumber.fromNumber(this.operatorsBytesSize()),
    );
  }

  static of = (...operators: PDFOperator[]) =>
    new PDFContentStream(...operators);

  static validateOperators = (elements: any[]) =>
    validateArr(
      elements,
      isInstance(PDFOperator),
      'only PDFOperators can be pushed to a PDFContentStream',
    );

  operatorsBytesSize = () =>
    _(this.operators)
      .filter(Boolean)
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

    remaining = this.operators
      .filter(Boolean)
      .reduce(
        (remBytes: Uint8Array, op: PDFOperator) => op.copyBytesInto(remBytes),
        remaining,
      );

    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };
}

export default PDFContentStream;
