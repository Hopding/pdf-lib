/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';
import _ from 'lodash';

import { addStringToBuffer, or } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the line dash pattern in the graphics state
 */
class d extends PDFOperator {
  public static of = (dashArray: [number, number], dashPhase: number) =>
    new d(dashArray, dashPhase);

  public dashArray: [number, number];
  public dashPhase: number;

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

  public toString = (): string =>
    _.isNil(this.dashArray[0]) && _.isNil(this.dashArray[1])
      ? `[] ${this.dashPhase} d\n`
      : `[${String(this.dashArray[0])} ${String(this.dashArray[1])}] ` +
        `${this.dashPhase} d\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default d;
