/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const B_ENFORCER = Symbol('B_ENFORCER');

/**
Fill and then stroke the path, using the nonzero winding number rule to
determine the region to fill. This operator shall produce the same result as
constructing two identical path objects, painting the first with f and the
second with S.

NOTE: The filling and stroking portions of the operation consult different
values of several graphics state parameters, such as the current colour.
*/
class B extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(B_ENFORCER),
      'Cannot instantiate PDFOperator.B - use "B.operator" instead',
    );
  }

  static operator = new B(B_ENFORCER);

  toString = () => `B\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default B;
