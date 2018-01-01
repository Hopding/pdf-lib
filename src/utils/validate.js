/* @flow */

export const validate = <T>(value: T, predicate: T => boolean, msg: string) => {
  if (!predicate(value)) throw new Error(msg);
};

export const validateArr = <T: Array<any>>(
  value: T,
  predicate: T => boolean,
  msg: string,
) => {
  value.forEach(v => validate(v, predicate, msg));
};

export const isInstance = <T>(requiredClass: T) => (value: any) =>
  value instanceof requiredClass;

export const isIdentity = <T>(requiredValue: T) => (value: any) =>
  value === requiredValue;
