// tslint:disable radix

/**
 * Converts a number to its string representation in decimal. This function
 * differs from simply converting a number to a string with `.toString()`
 * because this function's output string will **not** contain exponential
 * notation.
 *
 * Credit: https://stackoverflow.com/a/46545519
 */
export const numberToString = (num: number) => {
  let numStr = String(num);

  if (Math.abs(num) < 1.0) {
    const e = parseInt(num.toString().split('e-')[1]);
    if (e) {
      const negative = num < 0;
      if (negative) num *= -1;
      num *= Math.pow(10, e - 1);
      numStr = '0.' + new Array(e).join('0') + num.toString().substring(2);
      if (negative) numStr = '-' + numStr;
    }
  } else {
    let e = parseInt(num.toString().split('+')[1]);
    if (e > 20) {
      e -= 20;
      num /= Math.pow(10, e);
      numStr = num.toString() + new Array(e + 1).join('0');
    }
  }

  return numStr;
};

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
