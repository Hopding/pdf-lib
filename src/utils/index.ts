/* tslint:disable no-bitwise */
import sum from 'lodash/sum';

export type Predicate<A, B = true> = (a: A, b?: B) => boolean;

export type ArrayPredicate<A> = (...a: A[]) => boolean;

// export const writeToDebugFile = (data: any, postfix = 0) => {
//   // eslint-disable-next-line
//   const fs = require('fs');
//   fs.writeFileSync(`/Users/user/Desktop/pdf-lib/debug${postfix}`, data);
// };

export const error = (msg: string) => {
  throw new Error(msg);
};

export const digits = (num: number) => String(num).split('').length;

export const sizeInBytes = (n: number) => Math.ceil(n.toString(2).length / 8);

/**
 * Converts a number into its constituent bytes and returns them as
 * a number[].
 *
 * Returns most significant byte as first element in array. It may be necessary
 * to call .reverse() to get the bits in the desired order.
 *
 * Example:
 *   bytesFor(0x02A41E) => [ 0b10, 0b10100100, 0b11110 ]
 *
 * Credit for algorithm: https://stackoverflow.com/a/1936865
 */
export const bytesFor = (n: number) => {
  const bytes = new Uint8Array(sizeInBytes(n));
  for (let i = 1; i <= bytes.length; i++) {
    bytes[i - 1] = n >> ((bytes.length - i) * 8);
  }
  return bytes;
};

// Arrays and TypedArrays in JS both have .reverse() methods, which would seem
// to negate the need for this function. However, not all runtimes support this
// method (e.g. React Native), so using this function compensates for that.
export const reverseArray = (array: any[] | Uint8Array) => {
  for (let i = 0; i < Math.floor(array.length / 2); i++) {
    const leftIdx = i;
    const rightIdx = array.length - i - 1;
    const temp = array[i];

    array[leftIdx] = array[rightIdx];
    array[rightIdx] = temp;
  }
  return array;
};

export const isInt = (num: number) => num % 1 === 0;

export const and = (...predicates: Array<ArrayPredicate<any>>) => (
  ...values: any[]
) => predicates.every((predicate) => predicate(...values));

export const or = (...predicates: Array<ArrayPredicate<any>>) => (
  ...values: any[]
) => predicates.some((predicate) => predicate(...values));

export const not = (predicate: ArrayPredicate<any>) => (...values: any[]) =>
  !predicate(...values);

export const toBoolean = (boolStr: string) => {
  if (boolStr === 'true') return true;
  if (boolStr === 'false') return false;
  throw new Error(`"${boolStr}" cannot be converted to a boolean`);
};

export const charCode = (charStr: string) => {
  if (charStr.length !== 1) {
    throw new Error('"char" must be exactly one character long');
  }
  return charStr.charCodeAt(0);
};

export const charFromCode = (code: number) => String.fromCharCode(code);

export const mergeUint8Arrays = (...arrs: Uint8Array[]) => {
  const totalLength = sum(arrs.map((a) => a.length));
  const newArray = new Uint8Array(totalLength);

  let offset = 0;
  arrs.forEach((a) => {
    newArray.set(a, offset);
    offset += a.length;
  });

  return newArray;
};

export const addStringToBuffer = (str: string, buffer: Uint8Array) => {
  for (let i = 0; i < str.length; i += 1) {
    buffer[i] = str.charCodeAt(i);
  }
  return buffer.subarray(str.length);
};

export const charCodes = (str: string) =>
  str.split('').map((c) => c.charCodeAt(0));

export const typedArrayFor = (str: string) => new Uint8Array(charCodes(str));

export const arrayToString = (
  arr: Uint8Array | number[],
  startAt = 0,
  stopAt?: number,
) => {
  const stopIdx =
    stopAt === undefined || stopAt >= arr.length ? arr.length : stopAt;
  let str = '';
  for (let i = startAt; i < stopIdx; i += 1) {
    str += charFromCode(arr[i]);
  }
  return str;
};

export const arrayCharAt = (arr: Uint8Array | any[], idx: number) =>
  String.fromCharCode(arr[idx]);

export const trimArray = (arr: Uint8Array) => {
  let idx = 0;
  while (
    String.fromCharCode(arr[idx]).match(/^[\0\t\n\f\r ]/) &&
    idx < arr.length
  ) {
    idx += 1;
  }
  return arr.subarray(idx);
};

export const arraysAreEqual = (
  arr1: any[] | Uint8Array,
  arr1Start: number,
  arr1Stop: number,
  arr2: any[] | Uint8Array,
  arr2Start: number,
  arr2Stop: number,
) => {
  const arr1Length = arr1Stop - arr1Start;
  if (arr1Length !== arr2Stop - arr2Start) return false;
  for (let i = 0; i < arr1Length; i += 1) {
    if (arr1[arr1Start + i] !== arr2[arr2Start + i]) return false;
  }
  return true;
};

export const arrayIndexOf = (
  arr: any[] | Uint8Array,
  targetStr: string,
  startFrom = 0,
) => {
  const targetArr = targetStr.split('').map((c) => c.charCodeAt(0));
  let currIdx = startFrom;

  while (
    !arraysAreEqual(
      arr,
      currIdx,
      currIdx + targetStr.length,
      targetArr,
      0,
      targetArr.length,
    )
  ) {
    currIdx += 1;
    if (currIdx >= arr.length) return undefined;
  }

  return currIdx;
};

export const arrayIndexOneOf = (
  arr: any[] | Uint8Array,
  targetStrings: string[],
  startFrom = 0,
): [number, string] | void => {
  const targetArrs = targetStrings.map((str) => str.split('').map(charCode));
  let currIdx = startFrom;
  let match = null;

  while (!match) {
    currIdx += 1;
    if (currIdx >= arr.length) return undefined;
    match = targetArrs.find((target) =>
      arraysAreEqual(
        arr,
        currIdx,
        currIdx + target.length,
        target,
        0,
        target.length,
      ),
    );
  }

  return [currIdx, arrayToString(match)];
};

export const arrayIndexOfReverse = (
  arr: any[],
  targetStr: string,
  startFrom: number,
) => {
  // validate(
  //   startFrom,
  //   and(_.isNumber, not(_.isNaN)),
  //   `startFrom must be a number, found: "${startFrom}"`,
  // );

  const targetArr = targetStr.split('').map((c) => c.charCodeAt(0));
  let currIdx = startFrom;

  while (
    !arraysAreEqual(
      arr,
      currIdx,
      currIdx + targetStr.length,
      targetArr,
      0,
      targetArr.length,
    )
  ) {
    currIdx -= 1;
    if (currIdx === -1) return undefined;
  }

  return currIdx;
};

export const arrayFindIndexOf = (
  arr: Uint8Array,
  predicate: (a: any) => boolean,
  startFrom = 0,
) => {
  let currIdx = startFrom;

  while (!predicate(arr.subarray(currIdx, currIdx + 1)[0])) {
    currIdx += 1;
    if (currIdx >= arr.length) return undefined;
  }

  return currIdx;
};

export const setCharAt = (str: string, idx: number, newChar: string) =>
  str.substring(0, idx) + newChar + str.substring(idx + 1);
