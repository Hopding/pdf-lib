export const isInt = (num) => (num % 1 === 0);

export const charCode = (char) => {
  if (char.length !== 1) throw new Error('"char" must be exactly one character long');
  return char.charCodeAt(0);
}

export const isString = (val) => typeof(val) === 'string';

export const isObject = (val) =>
  Object.prototype.toString.call(val) === '[object Object]';
