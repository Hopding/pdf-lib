import _ from 'lodash';
import { validate } from '../utils/validate';

export type Predicate<A, B> = (A, B) => boolean;

export const writeToDebugFile = (data, postfix = 0) => {
  // eslint-disable-next-line
  const fs = require('fs');
  fs.writeFileSync(`/Users/user/Desktop/pdf-lib/debug${postfix}`, data);
};

export const error = (msg: string) => {
  throw new Error(msg);
};

export const isInt = num => num % 1 === 0;

export const isString = (val): %checks => typeof val === 'string';

export const and = (...predicates: Predicate<any>[]) => (...values: any[]) =>
  predicates.every(predicate => predicate(...values));

export const or = (...predicates: Predicate<any>[]) => (...values: any[]) =>
  predicates.find(predicate => predicate(...values));

export const not = (predicate: Predicate<any>) => (...values: any[]) =>
  !predicate(...values);

export const toBoolean = (boolStr: string) => {
  if (boolStr === 'true') return true;
  if (boolStr === 'false') return false;
  throw new Error(`"${boolStr}" cannot be converted to a boolean`);
};

export const charCode = charStr => {
  if (charStr.length !== 1) {
    throw new Error('"char" must be exactly one character long');
  }
  return charStr.charCodeAt(0);
};

export const charFromCode = (code: number) => String.fromCharCode(code);

export const isObject = val =>
  Object.prototype.toString.call(val) === '[object Object]';

export const mergeUint8Arrays = (...arrs) => {
  const totalLength = _.sum(arrs.map(a => a.length));
  const newArray = new Uint8Array(totalLength);

  let offset = 0;
  arrs.forEach(a => {
    newArray.set(a, offset);
    offset += a.length;
  });

  return newArray;
};

export const addStringToBuffer = (str: string, buffer: Uint8Array) => {
  for (let i = 0; i < str.length; i++) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer.subarray(str.length);
};

export const charCodes = str => str.split('').map(c => c.charCodeAt(0));

export const arrayToString = (arr, startAt = 0, stopAt) => {
  const stopIdx =
    stopAt === undefined || stopAt >= arr.length ? arr.length : stopAt;
  return Array.from(arr.subarray(startAt, stopIdx))
    .map(n => String.fromCharCode(n))
    .join('');
};

export const arrayCharAt = (arr, idx) => String.fromCharCode(arr[idx]);

export const trimArray = arr => {
  let idx = 0;
  while (String.fromCharCode(arr[idx]).match(/^[\ \n\r]/)) idx++;
  return arr.subarray(idx);
};

export const arraysAreEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
};

export const arrayIndexOf = (arr, targetStr, startFrom = 0) => {
  validate(
    startFrom,
    and(_.isNumber, not(_.isNaN)),
    `startFrom must be a number, found: "${startFrom}"`,
  );

  const targetArr = targetStr.split('').map(c => c.charCodeAt(0));
  let currIdx = startFrom;

  while (
    !arraysAreEqual(
      arr.subarray(currIdx, currIdx + targetStr.length),
      targetArr,
    )
  ) {
    currIdx += 1;
    if (currIdx >= arr.length) return undefined;
  }

  return currIdx;
};

export const arrayFindIndexOf = (arr, predicate, startFrom = 0) => {
  let currIdx = startFrom;

  while (!predicate(arr.subarray(currIdx, currIdx + 1)[0])) {
    currIdx += 1;
    if (currIdx >= arr.length) return undefined;
  }

  return currIdx;
};

/* eslint-disable no-restricted-syntax */
export const findInMap = <K, V>(
  map: Map<K, V>,
  predicate: Predicate<V, K>,
): ?V => {
  for (const [key, val] of map) {
    if (predicate(val, key)) return val;
  }
  return null;
};
