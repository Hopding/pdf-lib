import { decodeFromBase64DataUri } from 'src/utils/base64';
import { charFromCode } from 'src/utils/strings';

export const last = <T>(array: T[]): T => array[array.length - 1];

export const typedArrayFor = (value: string | Uint8Array): Uint8Array => {
  if (value instanceof Uint8Array) return value;
  const length = value.length;
  const typedArray = new Uint8Array(length);
  for (let idx = 0; idx < length; idx++) {
    typedArray[idx] = value.charCodeAt(idx);
  }
  return typedArray;
};

export const mergeIntoTypedArray = (...arrays: Array<string | Uint8Array>) => {
  const arrayCount = arrays.length;

  const typedArrays: Uint8Array[] = [];
  for (let idx = 0; idx < arrayCount; idx++) {
    const element = arrays[idx];
    typedArrays[idx] =
      element instanceof Uint8Array ? element : typedArrayFor(element);
  }

  let totalSize = 0;
  for (let idx = 0; idx < arrayCount; idx++) {
    totalSize += arrays[idx].length;
  }

  const merged = new Uint8Array(totalSize);
  let offset = 0;
  for (let arrIdx = 0; arrIdx < arrayCount; arrIdx++) {
    const arr = typedArrays[arrIdx];
    for (let byteIdx = 0, arrLen = arr.length; byteIdx < arrLen; byteIdx++) {
      merged[offset++] = arr[byteIdx];
    }
  }

  return merged;
};

export const mergeUint8Arrays = (arrays: Uint8Array[]): Uint8Array => {
  let totalSize = 0;
  for (let idx = 0, len = arrays.length; idx < len; idx++) {
    totalSize += arrays[idx].length;
  }

  const mergedBuffer = new Uint8Array(totalSize);
  let offset = 0;
  for (let idx = 0, len = arrays.length; idx < len; idx++) {
    const array = arrays[idx];
    mergedBuffer.set(array, offset);
    offset += array.length;
  }

  return mergedBuffer;
};

export const arrayAsString = (array: Uint8Array | number[]): string => {
  let str = '';
  for (let idx = 0, len = array.length; idx < len; idx++) {
    str += charFromCode(array[idx]);
  }
  return str;
};

export const byAscendingId = <T extends { id: any }>(a: T, b: T) => a.id - b.id;

export const sortedUniq = <T>(array: T[], indexer: (elem: T) => any): T[] => {
  const uniq: T[] = [];

  for (let idx = 0, len = array.length; idx < len; idx++) {
    const curr = array[idx];
    const prev = array[idx - 1];
    if (idx === 0 || indexer(curr) !== indexer(prev)) {
      uniq.push(curr);
    }
  }

  return uniq;
};

// Arrays and TypedArrays in JS both have .reverse() methods, which would seem
// to negate the need for this function. However, not all runtimes support this
// method (e.g. React Native). This function compensates for that fact.
export const reverseArray = (array: Uint8Array) => {
  const arrayLen = array.length;
  for (let idx = 0, len = Math.floor(arrayLen / 2); idx < len; idx++) {
    const leftIdx = idx;
    const rightIdx = arrayLen - idx - 1;
    const temp = array[idx];

    array[leftIdx] = array[rightIdx];
    array[rightIdx] = temp;
  }
  return array;
};

export const sum = (array: number[] | Uint8Array): number => {
  let total = 0;
  for (let idx = 0, len = array.length; idx < len; idx++) {
    total += array[idx];
  }
  return total;
};

export const range = (start: number, end: number): number[] => {
  const arr = new Array(end - start);
  for (let idx = start; idx < end; idx++) arr[idx] = idx;
  return arr;
};

export const pluckIndices = <T>(arr: T[], indices: number[]) => {
  const plucked = new Array<T>(indices.length);
  for (let idx = 0, len = indices.length; idx < len; idx++) {
    plucked[idx] = arr[indices[idx]];
  }
  return plucked;
};

export const canBeConvertedToUint8Array = (
  input: any,
): input is string | ArrayBuffer | Uint8Array =>
  input instanceof Uint8Array ||
  input instanceof ArrayBuffer ||
  typeof input === 'string';

export const toUint8Array = (input: string | ArrayBuffer | Uint8Array) => {
  if (typeof input === 'string') {
    return decodeFromBase64DataUri(input);
  } else if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  } else if (input instanceof Uint8Array) {
    return input;
  } else {
    throw new TypeError(
      '`input` must be one of `string | ArrayBuffer | Uint8Array`',
    );
  }
};
