/* tslint:disable:max-classes-per-file */
import { addStringToBuffer, error } from 'utils';
import { isIdentity, validate } from 'utils/validate';

class PDFOperator {
  public static createSingletonOp = (op: string) => {
    const ENFORCER = Symbol(`${op}_ENFORCER`);

    class Singleton extends PDFOperator {
      public static operator: Singleton;

      constructor(enforcer: symbol) {
        super();
        validate(
          enforcer,
          isIdentity(ENFORCER),
          `Cannot instantiate PDFOperator.${op} - use "${op}.operator" instead`,
        );
      }

      public toString = (): string => `${op}\n`;

      public bytesSize = (): number => 2;

      public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
        addStringToBuffer(this.toString(), buffer)
    }

    Singleton.operator = new Singleton(ENFORCER);

    return Singleton;
  }

  public toString = (): string =>
    error(`toString() is not implemented on ${this.constructor.name}`)

  public bytesSize = (): number =>
    error(`bytesSize() is not implemented on ${this.constructor.name}`)

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    error(`copyBytesInto() is not implemented on ${this.constructor.name}`)
}

export default PDFOperator;
