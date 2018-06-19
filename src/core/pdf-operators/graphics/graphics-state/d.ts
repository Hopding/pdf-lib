/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';
import * as _ from 'lodash';

import { addStringToBuffer, or } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the line dash pattern in the graphics state
 */
class d extends PDFOperator {
  static of = (dashArray: number[], dashPhase: number) =>
    new d(dashArray, dashPhase);

  dashArray: [number, number];
  dashPhase: number;

  // TODO: Looks like the dashArray can actually be an array of arbitrary size,
  //       so shouldn't be restricting it here.
  constructor(dashArray: number[], dashPhase?: number) {
    super();
    validate(
      dashArray[0],
      or(isNumber, _.isNil),
      'dashArray[0] must be a number or undefined.',
    );
    validate(
      dashArray[1],
      or(isNumber, _.isNil),
      'dashArray[1] must be a number or undefined.',
    );
    validate(
      dashPhase,
      or(isNumber, _.isNil),
      'd operator arg "dashPhase" must be a number.',
    );
    this.dashArray = dashArray as [number, number];
    this.dashPhase = dashPhase;
  }

  toString = () =>
    this.dashArray.every(_.isNil)
      ? `[] ${this.dashPhase} d\n`
      : `[${this.dashArray[0]} ${this.dashArray[1]}] ${this.dashPhase} d\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default d;
