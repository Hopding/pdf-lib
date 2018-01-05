/* @flow */
/* eslint-disable new-cap */
import _ from 'lodash';
import PDFOperator from '../PDFOperator';

import { and, not, addStringToBuffer } from '../../../utils';
import { validateArr, validate, isNumber } from '../../../utils/validate';

/**
Same as SC but also supports Pattern, Separation, DeviceN and ICCBased colour
spaces.

If the current stroking colour space is a Separation, DeviceN, or ICCBased
colour space, the operands c1...cn shall be numbers. The number of operands and
their interpretation depends on the colour space.

If the current stroking colour space is a Pattern colour space, name shall be
the name of an entry in the Pattern subdictionary of the current resource
dictionary. For an uncoloured tiling pattern
(PatternType = 1 and PaintType = 2), c1...cn
shall be component values specifying a colour in the pattern’s underlying colour
space. For other types of patterns, these operands shall not be specified.
*/
export class SCN extends PDFOperator {
  c: number[];
  name: ?string;

  constructor(c: number[], name?: string) {
    super();
    validateArr(c, isNumber, 'SCN operator args "c" must be all be numbers.');
    validate(
      name,
      and(_.isString, not(_.isNil)),
      'SCN operator args "c" must be all be numbers.',
    );
    this.c = c;
    this.name = name;
  }

  static of = (c: number[], name?: string) => new SCN(c, name);

  toString = (): string =>
    `${this.c.join(' ')} ${this.name ? `${this.name} ` : ''} SCN\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
Same as SCN but used for nonstroking operations.
*/
export class scn extends PDFOperator {
  c: number[];
  name: ?string;

  constructor(c: number[], name?: string) {
    super();
    validateArr(c, isNumber, 'scn operator args "c" must be all be numbers.');
    validate(
      name,
      and(_.isString, not(_.isNil)),
      'scn operator args "c" must be all be numbers.',
    );
    this.c = c;
    this.name = name;
  }

  static of = (c: number[], name?: string) => new scn(c, name);

  toString = (): string =>
    `${this.c.join(' ')} ${this.name ? `${this.name} ` : ''} scn\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
