// tslint:disable: max-classes-per-file

export class MethodNotImplementedError extends Error {
  constructor(className: string, methodName: string) {
    const msg = `Method ${className}.${methodName}() not implemented`;
    super(msg);
  }
}

export class PrivateConstructorError extends Error {
  constructor(className: string) {
    const msg = `Cannot construct ${className} - it has a private constructor`;
    super(msg);
  }
}
