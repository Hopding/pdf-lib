import _ from 'lodash';
import StringView from './StringView';

export const isInt = (num) => (num % 1 === 0);

export const charCode = (char) => {
  if (char.length !== 1) throw new Error('"char" must be exactly one character long');
  return char.charCodeAt(0);
}

export const isString = (val) => typeof(val) === 'string';

export const isObject = (val) =>
  Object.prototype.toString.call(val) === '[object Object]';

export const mergeUint8Arrays = (...arrs) => {
  const totalLength = _.sum(arrs.map(a => a.length))
  const newArray = new Uint8Array(totalLength);

  let offset = 0;
  arrs.forEach(a => {
    newArray.set(a, offset);
    offset += a.length;
  });

  return newArray;
}

// export const arrayIndexOf = (arr, targetStr, startFrom) => {
//   	let currIdx = startFrom || 0;
//   	while ((new StringView(arr)).subview(currIdx, targetStr.length).toString() !== targetStr) {
//   		currIdx++;
//   		if (currIdx >= arr.length) return undefined;
//   	}
//   	return currIdx;
// }

export const arrayIndexOf = (arr, targetStr, startFrom) => {
  	let currIdx = startFrom || 0;
  	// while ((new StringView(arr)).subview(currIdx, targetStr.length).toString() !== targetStr) {

    while (
      Array.from(
        arr.slice(currIdx, currIdx + targetStr.length
      )).map(n => String.fromCharCode(n)).join('') !== targetStr
    ) {
      const x = Array.from(
        arr.slice(currIdx, currIdx + targetStr.length
      )).map(n => String.fromCharCode(n)).join('');
      if (x.includes('e')) console.log(x)
  		currIdx++;
  		if (currIdx >= arr.length) return undefined;
  	}
  	return currIdx;
}
