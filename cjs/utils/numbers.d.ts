/**
 * Converts a number to its string representation in decimal. This function
 * differs from simply converting a number to a string with `.toString()`
 * because this function's output string will **not** contain exponential
 * notation.
 *
 * Credit: https://stackoverflow.com/a/46545519
 */
export declare const numberToString: (num: number) => string;
export declare const sizeInBytes: (n: number) => number;
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
export declare const bytesFor: (n: number) => Uint8Array;
//# sourceMappingURL=numbers.d.ts.map