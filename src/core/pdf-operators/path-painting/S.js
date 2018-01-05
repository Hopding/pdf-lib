/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const S_ENFORCER = Symbol('S_ENFORCER');

/**
Stroke the path.
*/
class S extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(S_ENFORCER),
      'Cannot instantiate PDFOperator.S - use "S.operator" instead',
    );
  }

  static operator = new S(S_ENFORCER);

  toString = () => `S\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default S;
