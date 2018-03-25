/* @flow */
import { error, addStringToBuffer } from 'utils';
import { validate, isIdentity } from 'utils/validate';

class PDFOperator {
  toString = (): string =>
    error(`toString() is not implemented on ${this.constructor.name}`);

  bytesSize = (): number =>
    error(`bytesSize() is not implemented on ${this.constructor.name}`);

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    error(`copyBytesInto() is not implemented on ${this.constructor.name}`);

  static createSingletonOp = (op: string) => {
    const ENFORCER = Symbol(`${op}_ENFORCER`);

    class Singleton extends PDFOperator {
      constructor(enforcer: Symbol) {
        super();
        validate(
          enforcer,
          isIdentity(ENFORCER),
          `Cannot instantiate PDFOperator.${op} - use "${op}.operator" instead`,
        );
      }

      static operator: Singleton;

      toString = (): string => `${op}\n`;

      bytesSize = (): number => 2;

      copyBytesInto = (buffer: Uint8Array): Uint8Array =>
        addStringToBuffer(this.toString(), buffer);
    };

    Singleton.operator = new Singleton(ENFORCER);

    return Singleton;
  };
}

export default PDFOperator;
