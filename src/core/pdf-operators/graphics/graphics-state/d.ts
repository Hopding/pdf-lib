/* @flow */
/* eslint-disable new-cap */
import _ from 'lodash';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, or } from 'utils';
import { validate, isNumber } from 'utils/validate';

/**
Set the line dash pattern in the graphics state
*/
class d extends PDFOperator {
  dashArray: [number, number];
  dashPhase: number;

  constructor(dashArray: [number, number], dashPhase: number) {
    super();
    validate(
      dashArray[0],
      or(isNumber, _.isNil),
      'elements of "dashArray" must be numbers.',
    );
    validate(
      dashArray[1],
      or(isNumber, _.isNil),
      'elements of "dashArray" must be numbers.',
    );
    validate(
      dashPhase,
      or(isNumber, _.isNil),
      'd operator arg "dashPhase" must be a number.',
    );
    this.dashArray = dashArray;
    this.dashPhase = dashPhase;
  }

  static of = (dashArray: [number, number], dashPhase: number) =>
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
