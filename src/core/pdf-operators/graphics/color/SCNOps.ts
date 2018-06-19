/* tslint:disable:max-classes-per-file class-name */
import * as _ from 'lodash';

import { PDFName } from 'core/pdf-objects';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, and, not, or } from 'utils';
import { isInstance, isNumber, validate, validateArr } from 'utils/validate';

/**
 * Same as SC but also supports Pattern, Separation, DeviceN and ICCBased colour
 * spaces.
 *
 * If the current stroking colour space is a Separation, DeviceN, or ICCBased
 * colour space, the operands c1...cn shall be numbers. The number of operands and
 * their interpretation depends on the colour space.
 *
 * If the current stroking colour space is a Pattern colour space, name shall be
 * the name of an entry in the Pattern subdictionary of the current resource
 * dictionary. For an uncoloured tiling pattern
 * (PatternType = 1 and PaintType = 2), c1...cn
 * shall be component values specifying a colour in the pattern’s underlying colour
 * space. For other types of patterns, these operands shall not be specified.
 */
export class SCN extends PDFOperator {
  static of = (c: number[], name?: string | PDFName) => new SCN(c, name);

  c: number[];
  name: PDFName;

  // TODO: Confirm whether or not a number[] and string will ever both be present?
  constructor(c: number[], name?: string | PDFName) {
    super();
    validateArr(c, isNumber, 'SCN operator args "c" must be all be numbers.');
    validate(
      name,
      or(_.isString, isInstance(PDFName), _.isNil),
      'SCN operator arg "name" must be a string or PDFName.',
    );
    this.c = c;
    this.name = _.isString(name) ? PDFName.from(name) : name;
  }

  toString = () =>
    this.name
      ? `${this.c.join(' ')} ${this.name} SCN\n`
      : `${this.c.join(' ')} SCN\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
 * Same as SCN but used for nonstroking operations.
 */
export class scn extends PDFOperator {
  static of = (c: number[], name?: string | PDFName) => new scn(c, name);

  c: number[];
  name: PDFName;

  constructor(c: number[], name?: string | PDFName) {
    super();
    validateArr(c, isNumber, 'scn operator args "c" must be all be numbers.');
    validate(
      name,
      or(_.isString, isInstance(PDFName), _.isNil),
      'scn operator arg "name" must be a string or PDFName.',
    );
    this.c = c;
    this.name = _.isString(name) ? PDFName.from(name) : name;
  }

  toString = () =>
    this.name
      ? `${this.c.join(' ')} ${this.name} scn\n`
      : `${this.c.join(' ')} scn\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
