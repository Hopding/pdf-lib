/* @flow */
/* eslint-disable new-cap */
import _ from 'lodash';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { validate, validateArr, isNumber } from 'utils/validate';

/**
Set the line dash pattern in the graphics state
*/
class d extends PDFOperator {
  dashArray: [?number, ?number];
  dashPhase: number;

  constructor(dashArray: [?number, ?number], dashPhase: number) {
    super();
    validateArr(
      dashArray,
      isNumber,
      'd operator arg "dashArray" must be composed of numbers.',
    );
    validate(
      dashPhase,
      isNumber,
      'd operator arg "dashPhase" must be a number.',
    );
    this.dashArray = dashArray;
    this.dashPhase = dashPhase;
  }

  static of = (dashArray: [?number, ?number], dashPhase: number) =>
    new d(dashArray, dashPhase);

  toString = (): string =>
    _.isNil(this.dashArray[0]) && _.isNil(this.dashArray[1])
      ? `[] ${this.dashPhase} d\n`
      : `[${String(this.dashArray[0])} ${String(this.dashArray[1])}] ` +
        `${this.dashPhase} d\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default d;
