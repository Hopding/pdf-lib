/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

// eslint-disable-next-line camelcase
const h_ENFORCER = Symbol('h_ENFORCER');

/**
Close the current subpath by appending a straight line segment from the current
point to the starting point of the subpath. If the current subpath is already
closed, h shall do nothing. This operator terminates the current subpath.
Appending another segment to the current path shall begin a new subpath, even if
the new segment begins at the endpoint reached by the h operation.
*/
class h extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(h_ENFORCER),
      'Cannot instantiate PDFOperator.h - use "h.operator" instead',
    );
  }

  static operator = new h(h_ENFORCER);

  toString = () => `h\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default h;
