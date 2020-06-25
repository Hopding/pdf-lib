/* tslint:disable:ban-types */

import { values as objectValues } from 'src/utils';

export const backtick = (val: any) => `\`${val}\``;
export const singleQuote = (val: any) => `'${val}'`;

type Primitive = string | number | boolean | undefined | null;

export const createValueErrorMsg = (
  value: any,
  valueName: string,
  values: Primitive[],
) => {
  const allowedValues = new Array(values.length);

  for (let idx = 0, len = values.length; idx < len; idx++) {
    const v = values[idx];
    const type = typeof v;

    if (type === 'string') allowedValues[idx] = singleQuote(v);
    else if (type === 'undefined') allowedValues[idx] = backtick('undefined');
    else allowedValues[idx] = v;
  }

  const joinedValues = allowedValues.join(' or ');

  // prettier-ignore
  return `${backtick(valueName)} must be one of ${joinedValues}, but was actually ${value}`;
};

export const assertIsOneOf = (
  value: any,
  valueName: string,
  values: Primitive[] | { [key: string]: Primitive },
) => {
  if (!Array.isArray(values)) values = objectValues(values);
  for (let idx = 0, len = values.length; idx < len; idx++) {
    if (value === values[idx]) return;
  }
  throw new TypeError(createValueErrorMsg(value, valueName, values));
};

export const assertIsOneOfOrUndefined = (
  value: any,
  valueName: string,
  values: Primitive[] | { [key: string]: Primitive },
) => {
  if (!Array.isArray(values)) values = objectValues(values);
  assertIsOneOf(value, valueName, values.concat(undefined));
};

export const getType = (val: any) => {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return 'string';
  if (isNaN(val)) return 'NaN';
  if (typeof val === 'number') return 'number';
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'symbol') return 'symbol';
  if (typeof val === 'bigint') return 'bigint';
  if (val.constructor && val.constructor.name) return val.constructor.name;
  if (val.name) return val.name;
  if (val.constructor) return String(val.constructor);
  return String(val);
};

export type TypeDescriptor =
  | 'null'
  | 'undefined'
  | 'string'
  | 'number'
  | 'boolean'
  | 'symbol'
  | 'bigint'
  | DateConstructor
  | ArrayConstructor
  | Uint8ArrayConstructor
  | ArrayBufferConstructor
  | [Function, string];

export const isType = (value: any, type: TypeDescriptor) => {
  if (type === 'null') return value === null;
  if (type === 'undefined') return value === undefined;
  if (type === 'string') return typeof value === 'string';
  if (type === 'number') return typeof value === 'number' && !isNaN(value);
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'symbol') return typeof value === 'symbol';
  if (type === 'bigint') return typeof value === 'bigint';
  if (type === Date) return value instanceof Date;
  if (type === Array) return value instanceof Array;
  if (type === Uint8Array) return value instanceof Uint8Array;
  if (type === ArrayBuffer) return value instanceof ArrayBuffer;
  return value instanceof (type as [Function, string])[0];
};

export const createTypeErrorMsg = (
  value: any,
  valueName: string,
  types: TypeDescriptor[],
) => {
  const allowedTypes = new Array(types.length);

  for (let idx = 0, len = types.length; idx < len; idx++) {
    const type = types[idx];
    if (type === 'null') allowedTypes[idx] = backtick('null');
    if (type === 'undefined') allowedTypes[idx] = backtick('undefined');
    if (type === 'string') allowedTypes[idx] = backtick('string');
    else if (type === 'number') allowedTypes[idx] = backtick('number');
    else if (type === 'boolean') allowedTypes[idx] = backtick('boolean');
    else if (type === 'symbol') allowedTypes[idx] = backtick('symbol');
    else if (type === 'bigint') allowedTypes[idx] = backtick('bigint');
    else if (type === Array) allowedTypes[idx] = backtick('Array');
    else if (type === Uint8Array) allowedTypes[idx] = backtick('Uint8Array');
    else if (type === ArrayBuffer) allowedTypes[idx] = backtick('ArrayBuffer');
    else allowedTypes[idx] = backtick((type as [Function, string])[1]);
  }

  const joinedTypes = allowedTypes.join(' or ');

  // prettier-ignore
  return `${backtick(valueName)} must be of type ${joinedTypes}, but was actually of type ${backtick(getType(value))}`;
};

export const assertIs = (
  value: any,
  valueName: string,
  types: TypeDescriptor[],
) => {
  for (let idx = 0, len = types.length; idx < len; idx++) {
    if (isType(value, types[idx])) return;
  }
  throw new TypeError(createTypeErrorMsg(value, valueName, types));
};

export const assertOrUndefined = (
  value: any,
  valueName: string,
  types: TypeDescriptor[],
) => {
  assertIs(value, valueName, types.concat('undefined'));
};

export const assertEachIs = (
  values: any[],
  valueName: string,
  types: TypeDescriptor[],
) => {
  for (let idx = 0, len = values.length; idx < len; idx++) {
    assertIs(values[idx], valueName, types);
  }
};

export const assertRange = (
  value: any,
  valueName: string,
  min: number,
  max: number,
) => {
  assertIs(value, valueName, ['number']);
  assertIs(min, 'min', ['number']);
  assertIs(max, 'max', ['number']);
  max = Math.max(min, max);
  if (value < min || value > max) {
    // prettier-ignore
    throw new Error(`${backtick(valueName)} must be at least ${min} and at most ${max}, but was actually ${value}`);
  }
};

export const assertRangeOrUndefined = (
  value: any,
  valueName: string,
  min: number,
  max: number,
) => {
  assertIs(value, valueName, ['number', 'undefined']);
  if (typeof value === 'number') assertRange(value, valueName, min, max);
};

export const assertMultiple = (
  value: any,
  valueName: string,
  multiplier: number,
) => {
  assertIs(value, valueName, ['number']);
  if (value % multiplier !== 0) {
    // prettier-ignore
    throw new Error(`${backtick(valueName)} must be a multiple of ${multiplier}, but was actually ${value}`);
  }
};
