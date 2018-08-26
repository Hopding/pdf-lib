import add from 'lodash/add';
import flatten from 'lodash/flatten';
import isNumber from 'lodash/isNumber';
import pako from 'pako';

import 'core/pdf-objects';

import { PDFDictionary, PDFName, PDFNumber, PDFStream } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { addStringToBuffer, or } from 'utils';
import { typedArrayProxy } from 'utils/proxies';
import { isArrayOf, isInstance, validateArr } from 'utils/validate';

class PDFContentStream extends PDFStream {
  static of = (
    dict: PDFDictionary,
    ...operators: Array<PDFOperator | PDFOperator[]>
  ) => new PDFContentStream(dict, ...operators);

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
  encodedOperators: Uint8Array | void;

  constructor(
    dictionary: PDFDictionary,
    ...operators: Array<PDFOperator | PDFOperator[]>
  ) {
    super(dictionary);
    validateArr(
      operators,
      or(isInstance(PDFOperator), isArrayOf(PDFOperator)),
      'PDFContentStream requires PDFOperators or PDFOperator[]s to be constructed.',
    );

    this.operators = typedArrayProxy(flatten(operators), PDFOperator, {
      set: (property) => {
        if (isNumber(Number(property))) {
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

  encode = () => {
    this.dictionary.set(PDFName.from('Filter'), PDFName.from('FlateDecode'));

    const buffer = new Uint8Array(this.operatorsBytesSize());
    this.copyOperatorBytesInto(buffer);
    this.encodedOperators = pako.deflate(buffer);

    this.dictionary.set(
      'Length',
      PDFNumber.fromNumber(this.encodedOperators.length),
    );

    return this;
  };

  operatorsBytesSize = (): number =>
    this.encodedOperators
      ? this.encodedOperators.length
      : this.operators
          .filter(Boolean)
          .map((op) => op.bytesSize())
          .reduce(add, 0);

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

    if (this.encodedOperators) {
      for (let i = 0; i < this.encodedOperators.length; i++) {
        remaining[i] = this.encodedOperators[i];
      }
      remaining = remaining.subarray(this.encodedOperators.length);
    } else {
      remaining = this.copyOperatorBytesInto(remaining);
    }

    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };

  private copyOperatorBytesInto = (buffer: Uint8Array): Uint8Array =>
    this.operators
      .filter(Boolean)
      .reduce((remBytes, op) => op.copyBytesInto(remBytes), buffer);
}

export default PDFContentStream;
