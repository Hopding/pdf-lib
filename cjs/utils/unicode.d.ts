/**
 * Encodes a string to UTF-8.
 *
 * @param input The string to be encoded.
 * @param byteOrderMark Whether or not a byte order marker (BOM) should be added
 *                      to the start of the encoding. (default `true`)
 * @returns A Uint8Array containing the UTF-8 encoding of the input string.
 *
 * -----------------------------------------------------------------------------
 *
 * JavaScript strings are composed of Unicode code points. Code points are
 * integers in the range 0 to 1,114,111 (0x10FFFF). When serializing a string,
 * it must be encoded as a sequence of words. A word is typically 8, 16, or 32
 * bytes in size. As such, Unicode defines three encoding forms: UTF-8, UTF-16,
 * and UTF-32. These encoding forms are described in the Unicode standard [1].
 * This function implements the UTF-8 encoding form.
 *
 * -----------------------------------------------------------------------------
 *
 * In UTF-8, each code point is mapped to a sequence of 1, 2, 3, or 4 bytes.
 * Note that the logic which defines this mapping is slightly convoluted, and
 * not as straightforward as the mapping logic for UTF-16 or UTF-32. The UTF-8
 * mapping logic is as follows [2]:
 *
 * • If a code point is in the range U+0000..U+007F, then view it as a 7-bit
 *   integer: 0bxxxxxxx. Map the code point to 1 byte with the first high order
 *   bit set to 0:
 *
 *       b1=0b0xxxxxxx
 *
 * • If a code point is in the range U+0080..U+07FF, then view it as an 11-bit
 *   integer: 0byyyyyxxxxxx. Map the code point to 2 bytes with the first 5 bits
 *   of the code point stored in the first byte, and the last 6 bits stored in
 *   the second byte:
 *
 *       b1=0b110yyyyy    b2=0b10xxxxxx
 *
 * • If a code point is in the range U+0800..U+FFFF, then view it as a 16-bit
 *   integer, 0bzzzzyyyyyyxxxxxx. Map the code point to 3 bytes with the first
 *   4 bits stored in the first byte, the next 6 bits stored in the second byte,
 *   and the last 6 bits in the third byte:
 *
 *       b1=0b1110zzzz    b2=0b10yyyyyy    b3=0b10xxxxxx
 *
 * • If a code point is in the range U+10000...U+10FFFF, then view it as a
 *   21-bit integer, 0bvvvzzzzzzyyyyyyxxxxxx. Map the code point to 4 bytes with
 *   the first 3 bits stored in the first byte, the next 6 bits stored in the
 *   second byte, the next 6 bits stored in the third byte, and the last 6 bits
 *   stored in the fourth byte:
 *
 *       b1=0b11110xxx    b2=0b10zzzzzz    b3=0b10yyyyyy    b4=0b10xxxxxx
 *
 * -----------------------------------------------------------------------------
 *
 * It is important to note, when iterating through the code points of a string
 * in JavaScript, that if a character is encoded as a surrogate pair it will
 * increase the string's length by 2 instead of 1 [4]. For example:
 *
 * ```
 * > 'a'.length
 * 1
 * > '💩'.length
 * 2
 * > '語'.length
 * 1
 * > 'a💩語'.length
 * 4
 * ```
 *
 * The results of the above example are explained by the fact that the
 * characters 'a' and '語' are not represented by surrogate pairs, but '💩' is.
 *
 * Because of this idiosyncrasy in JavaScript's string implementation and APIs,
 * we must "jump" an extra index after encoding a character as a surrogate
 * pair. In practice, this means we must increment the index of our for loop by
 * 2 if we encode a surrogate pair, and 1 in all other cases.
 *
 * -----------------------------------------------------------------------------
 *
 * References:
 *   - [1] https://www.unicode.org/versions/Unicode12.0.0/UnicodeStandard-12.0.pdf
 *         3.9  Unicode Encoding Forms - UTF-8
 *   - [2] http://www.herongyang.com/Unicode/UTF-8-UTF-8-Encoding.html
 *   - [3] http://www.herongyang.com/Unicode/UTF-8-UTF-8-Encoding-Algorithm.html
 *   - [4] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length#Description
 *
 */
export declare const utf8Encode: (input: string, byteOrderMark?: boolean) => Uint8Array;
/**
 * Encodes a string to UTF-16.
 *
 * @param input The string to be encoded.
 * @param byteOrderMark Whether or not a byte order marker (BOM) should be added
 *                      to the start of the encoding. (default `true`)
 * @returns A Uint16Array containing the UTF-16 encoding of the input string.
 *
 * -----------------------------------------------------------------------------
 *
 * JavaScript strings are composed of Unicode code points. Code points are
 * integers in the range 0 to 1,114,111 (0x10FFFF). When serializing a string,
 * it must be encoded as a sequence of words. A word is typically 8, 16, or 32
 * bytes in size. As such, Unicode defines three encoding forms: UTF-8, UTF-16,
 * and UTF-32. These encoding forms are described in the Unicode standard [1].
 * This function implements the UTF-16 encoding form.
 *
 * -----------------------------------------------------------------------------
 *
 * In UTF-16, each code point is mapped to one or two 16-bit integers. The
 * UTF-16 mapping logic is as follows [2]:
 *
 * • If a code point is in the range U+0000..U+FFFF, then map the code point to
 *   a 16-bit integer with the most significant byte first.
 *
 * • If a code point is in the range U+10000..U+10000, then map the code point
 *   to two 16-bit integers. The first integer should contain the high surrogate
 *   and the second integer should contain the low surrogate. Both surrogates
 *   should be written with the most significant byte first.
 *
 * -----------------------------------------------------------------------------
 *
 * It is important to note, when iterating through the code points of a string
 * in JavaScript, that if a character is encoded as a surrogate pair it will
 * increase the string's length by 2 instead of 1 [4]. For example:
 *
 * ```
 * > 'a'.length
 * 1
 * > '💩'.length
 * 2
 * > '語'.length
 * 1
 * > 'a💩語'.length
 * 4
 * ```
 *
 * The results of the above example are explained by the fact that the
 * characters 'a' and '語' are not represented by surrogate pairs, but '💩' is.
 *
 * Because of this idiosyncrasy in JavaScript's string implementation and APIs,
 * we must "jump" an extra index after encoding a character as a surrogate
 * pair. In practice, this means we must increment the index of our for loop by
 * 2 if we encode a surrogate pair, and 1 in all other cases.
 *
 * -----------------------------------------------------------------------------
 *
 * References:
 *   - [1] https://www.unicode.org/versions/Unicode12.0.0/UnicodeStandard-12.0.pdf
 *         3.9  Unicode Encoding Forms - UTF-8
 *   - [2] http://www.herongyang.com/Unicode/UTF-16-UTF-16-Encoding.html
 *   - [3] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length#Description
 *
 */
export declare const utf16Encode: (input: string, byteOrderMark?: boolean) => Uint16Array;
/**
 * Returns `true` if the `codePoint` is within the
 * Basic Multilingual Plane (BMP). Code points inside the BMP are not encoded
 * with surrogate pairs.
 * @param codePoint The code point to be evaluated.
 *
 * Reference: https://en.wikipedia.org/wiki/UTF-16#Description
 */
export declare const isWithinBMP: (codePoint: number) => boolean;
/**
 * Returns `true` if the given `codePoint` is valid and must be represented
 * with a surrogate pair when encoded.
 * @param codePoint The code point to be evaluated.
 *
 * Reference: https://en.wikipedia.org/wiki/UTF-16#Description
 */
export declare const hasSurrogates: (codePoint: number) => boolean;
export declare const highSurrogate: (codePoint: number) => number;
export declare const lowSurrogate: (codePoint: number) => number;
/**
 * Decodes a Uint8Array of data to a string using UTF-16.
 *
 * Note that this function attempts to recover from erronous input by
 * inserting the replacement character (�) to mark invalid code points
 * and surrogate pairs.
 *
 * @param input A Uint8Array containing UTF-16 encoded data
 * @param byteOrderMark Whether or not a byte order marker (BOM) should be read
 *                      at the start of the encoding. (default `true`)
 * @returns The decoded string.
 */
export declare const utf16Decode: (input: Uint8Array, byteOrderMark?: boolean) => string;
export declare const hasUtf16BOM: (bytes: Uint8Array) => boolean;
//# sourceMappingURL=unicode.d.ts.map