/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';
import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

/**
Set the current colour space to use for stroking operations. The operand name
shall be a name object. If the colour space is one that can be specified by a
name and no additional parameters (DeviceGray, DeviceRGB, DeviceCMYK, and
certain cases of Pattern), the name may be specified directly. Otherwise, it
shall be a name defined in the ColorSpace subdictionary of the current resource
dictionary; the associated value shall be an array describing the colour space.

The names DeviceGray, DeviceRGB, DeviceCMYK, and Pattern always identify the
corresponding colour spaces directly; they never refer to resources in the
ColorSpace subdictionary.

The CS operator shall also set the current stroking colour to its initial value,
which depends on the colour space:

In a DeviceGray, DeviceRGB, CalGray, or CalRGB colour space, the initial colour
shall have all components equal to 0.0.

In a DeviceCMYK colour space, the initial colour shall be [0.0 0.0 0.0 1.0].

In a Lab or ICCBased colour space, the initial colour shall have all components
equal to 0.0 unless that falls outside the intervals specified by the space’s
Range entry, in which case the nearest valid value shall be substituted.

In an Indexed colour space, the initial colour value shall be 0.

In a Separation or DeviceN colour space, the initial tint value shall be 1.0 for
all colorants.

In a Pattern colour space, the initial colour shall be a pattern object that
causes nothing to be painted.
*/
export class CS extends PDFOperator {
  public name: string;

  constructor(name: string) {
    super();
    validate(name, _.isString, 'CS operator arg "name" must be a string.');
    this.name = name;
  }

  public static of = (name: string) => new CS(name);

  public toString = (): string => `${this.name} CS\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

/**
Same as CS but used for nonstroking operations.
*/
export class cs extends PDFOperator {
  public name: string;

  constructor(name: string) {
    super();
    validate(name, _.isString, 'cs operator arg "name" must be a string.');
    this.name = name;
  }

  public static of = (name: string) => new cs(name);

  public toString = (): string => `${this.name} cs\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}
