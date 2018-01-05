/* @flow */
/* eslint-disable new-cap, camelcase */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const s_ENFORCER = Symbol('s_ENFORCER');

/**
Close and stroke the path. This operator shall have the same effect as the
sequence `h S`.
*/
class s extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(s_ENFORCER),
      'Cannot instantiate PDFOperator.s - use "s.operator" instead',
    );
  }

  static operator = new s(s_ENFORCER);

  toString = () => `s\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default s;
