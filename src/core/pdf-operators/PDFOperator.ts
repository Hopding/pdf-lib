/* tslint:disable:max-classes-per-file */
import { addStringToBuffer, error } from 'utils';
import { isIdentity, validate } from 'utils/validate';

export class IPDFOperatorSingleton {
  operator: PDFOperator;
  asterisk?: IPDFOperatorSingleton;
}

class PDFOperator {
  static createSingletonOp = (op: string): IPDFOperatorSingleton => {
    // const ENFORCER = Symbol(`${op}_ENFORCER`);

    // Using a Symbol is ideal here, but React Native doesn't current support
    // them, so we'll use a string instead.
    const ENFORCER = `@@__${op}_ENFORCER`;

    class Singleton extends PDFOperator {
      static operator: PDFOperator;
      static asterisk?: IPDFOperatorSingleton;

      constructor(enforcer: string) {
        super();
        validate(
          enforcer,
          isIdentity(ENFORCER),
          `Cannot instantiate PDFOperator.${op} - use "${op}.operator" instead`,
        );
      }

      toString = (): string => `${op}\n`;

      bytesSize = (): number => this.toString().length;

      copyBytesInto = (buffer: Uint8Array): Uint8Array =>
        addStringToBuffer(this.toString(), buffer);
    }

    Singleton.operator = new Singleton(ENFORCER);

    return Singleton;
  };

  toString = (): string =>
    error(`toString() is not implemented on ${this.constructor.name}`);

  bytesSize = (): number =>
    error(`bytesSize() is not implemented on ${this.constructor.name}`);

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    error(`copyBytesInto() is not implemented on ${this.constructor.name}`);
}

export default PDFOperator;
