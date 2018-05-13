/* eslint-disable class-methods-use-this */
/* eslint-disable getter-return */
import _ from 'lodash';

import 'core/pdf-objects';

import { PDFDictionary, PDFNumber, PDFStream } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { addStringToBuffer } from 'utils';
import { typedArrayProxy } from 'utils/proxies';
import { isInstance, validateArr } from 'utils/validate';

class PDFContentStream extends PDFStream {
  static of = (dict: PDFDictionary, ...operators: PDFOperator[]) =>
    new PDFContentStream(dict, ...operators);

  static validateOperators = (elements: any[]) =>
    validateArr(
      elements,
      isInstance(PDFOperator),
      'Only PDFOperators can be pushed to a PDFContentStream.',
    );

  // TODO: Should this allow text showing operators?
  // TODO: Prevent this from being reassigned
  // TODO: Should disallow non-numeric indexes
  operators: PDFOperator[];

  constructor(dictionary: PDFDictionary, ...operators: PDFOperator[]) {
    super(dictionary);
    PDFContentStream.validateOperators(operators);

    this.operators = typedArrayProxy(operators, PDFOperator, {
      set: (property) => {
        if (_.isNumber(Number(property))) {
          this.Length.number = this.operatorsBytesSize();
        }
      },
    });

    this.dictionary.set(
      'Length',
      PDFNumber.fromNumber(this.operatorsBytesSize()),
    );
  }

  get Length() {
    const Length = this.dictionary.get('Length');
    return this.dictionary.index.lookup(Length) as PDFNumber;
  }

  operatorsBytesSize = () =>
    _(this.operators)
      .filter(Boolean)
      .map((op) => op.bytesSize())
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
