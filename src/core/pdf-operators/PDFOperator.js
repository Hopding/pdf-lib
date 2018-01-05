/* @flow */
import { addStringToBuffer } from '../../utils';
import { validate, isIdentity } from '../../utils/validate';

class PDFOperator {
  is = <T>(obj: T) => this instanceof obj;

  toString = (): string => {
    throw new Error(
      `toString() is not implemented on ${this.constructor.name}`,
    );
  };

  bytesSize = (): number => {
    throw new Error(
      `bytesSize() is not implemented on ${this.constructor.name}`,
    );
  };

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    throw new Error(
      `copyBytesInto() is not implemented on ${this.constructor.name}`,
    );
  };

  static createSingleton = (op: string) => {
    const ENFORCER = Symbol(`${op}_ENFORCER`);

    const Singleton = class extends PDFOperator {
      constructor(enforcer: Symbol) {
        super();
        validate(
          enforcer,
          isIdentity(ENFORCER),
          `Cannot instantiate PDFOperator.${op} - use "${op}.operator" instead`,
        );
      }

      // static operator = new Singleton(ENFORCER);

      toString = () => `${op}\n`;

      bytesSize = (): number => 2;

      copyBytesInto = (buffer: Uint8Array): Uint8Array =>
        addStringToBuffer(this.toString(), buffer);
    };
    Singleton.operator = new Singleton(ENFORCER);

    return Singleton;
  };
}

export default PDFOperator;
