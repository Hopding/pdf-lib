export const typedArrayFor = (value: string): Uint8Array => {
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
