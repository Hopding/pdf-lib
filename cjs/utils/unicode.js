"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasUtf16BOM = exports.utf16Decode = exports.lowSurrogate = exports.highSurrogate = exports.hasSurrogates = exports.isWithinBMP = exports.utf16Encode = exports.utf8Encode = void 0;
var strings_1 = require("./strings");
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
exports.utf8Encode = function (input, byteOrderMark) {
    if (byteOrderMark === void 0) { byteOrderMark = true; }
    var encoded = [];
    if (byteOrderMark)
        encoded.push(0xef, 0xbb, 0xbf);
    for (var idx = 0, len = input.length; idx < len;) {
        var codePoint = input.codePointAt(idx);
        // One byte encoding
        if (codePoint < 0x80) {
            var byte1 = codePoint & 0x7f;
            encoded.push(byte1);
            idx += 1;
        }
        // Two byte encoding
        else if (codePoint < 0x0800) {
            var byte1 = ((codePoint >> 6) & 0x1f) | 0xc0;
            var byte2 = (codePoint & 0x3f) | 0x80;
            encoded.push(byte1, byte2);
            idx += 1;
        }
        // Three byte encoding
        else if (codePoint < 0x010000) {
            var byte1 = ((codePoint >> 12) & 0x0f) | 0xe0;
            var byte2 = ((codePoint >> 6) & 0x3f) | 0x80;
            var byte3 = (codePoint & 0x3f) | 0x80;
            encoded.push(byte1, byte2, byte3);
            idx += 1;
        }
        // Four byte encoding (surrogate pair)
        else if (codePoint < 0x110000) {
            var byte1 = ((codePoint >> 18) & 0x07) | 0xf0;
            var byte2 = ((codePoint >> 12) & 0x3f) | 0x80;
            var byte3 = ((codePoint >> 6) & 0x3f) | 0x80;
            var byte4 = ((codePoint >> 0) & 0x3f) | 0x80;
            encoded.push(byte1, byte2, byte3, byte4);
            idx += 2;
        }
        // Should never reach this case
        else
            throw new Error("Invalid code point: 0x" + strings_1.toHexString(codePoint));
    }
    return new Uint8Array(encoded);
};
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
exports.utf16Encode = function (input, byteOrderMark) {
    if (byteOrderMark === void 0) { byteOrderMark = true; }
    var encoded = [];
    if (byteOrderMark)
        encoded.push(0xfeff);
    for (var idx = 0, len = input.length; idx < len;) {
        var codePoint = input.codePointAt(idx);
        // Two byte encoding
        if (codePoint < 0x010000) {
            encoded.push(codePoint);
            idx += 1;
        }
        // Four byte encoding (surrogate pair)
        else if (codePoint < 0x110000) {
            encoded.push(exports.highSurrogate(codePoint), exports.lowSurrogate(codePoint));
            idx += 2;
        }
        // Should never reach this case
        else
            throw new Error("Invalid code point: 0x" + strings_1.toHexString(codePoint));
    }
    return new Uint16Array(encoded);
};
/**
 * Returns `true` if the `codePoint` is within the
 * Basic Multilingual Plane (BMP). Code points inside the BMP are not encoded
 * with surrogate pairs.
 * @param codePoint The code point to be evaluated.
 *
 * Reference: https://en.wikipedia.org/wiki/UTF-16#Description
 */
exports.isWithinBMP = function (codePoint) {
    return codePoint >= 0 && codePoint <= 0xffff;
};
/**
 * Returns `true` if the given `codePoint` is valid and must be represented
 * with a surrogate pair when encoded.
 * @param codePoint The code point to be evaluated.
 *
 * Reference: https://en.wikipedia.org/wiki/UTF-16#Description
 */
exports.hasSurrogates = function (codePoint) {
    return codePoint >= 0x010000 && codePoint <= 0x10ffff;
};
// From Unicode 3.0 spec, section 3.7:
//   http://unicode.org/versions/Unicode3.0.0/ch03.pdf
exports.highSurrogate = function (codePoint) {
    return Math.floor((codePoint - 0x10000) / 0x400) + 0xd800;
};
// From Unicode 3.0 spec, section 3.7:
//   http://unicode.org/versions/Unicode3.0.0/ch03.pdf
exports.lowSurrogate = function (codePoint) {
    return ((codePoint - 0x10000) % 0x400) + 0xdc00;
};
var ByteOrder;
(function (ByteOrder) {
    ByteOrder["BigEndian"] = "BigEndian";
    ByteOrder["LittleEndian"] = "LittleEndian";
})(ByteOrder || (ByteOrder = {}));
var REPLACEMENT = '�'.codePointAt(0);
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
exports.utf16Decode = function (input, byteOrderMark) {
    if (byteOrderMark === void 0) { byteOrderMark = true; }
    // Need at least 2 bytes of data in UTF-16 encodings
    if (input.length <= 1)
        return String.fromCodePoint(REPLACEMENT);
    var byteOrder = byteOrderMark ? readBOM(input) : ByteOrder.BigEndian;
    // Skip byte order mark if needed
    var idx = byteOrderMark ? 2 : 0;
    var codePoints = [];
    while (input.length - idx >= 2) {
        var first = decodeValues(input[idx++], input[idx++], byteOrder);
        if (isHighSurrogate(first)) {
            if (input.length - idx < 2) {
                // Need at least 2 bytes left for the low surrogate that is required
                codePoints.push(REPLACEMENT);
            }
            else {
                var second = decodeValues(input[idx++], input[idx++], byteOrder);
                if (isLowSurrogate(second)) {
                    codePoints.push(first, second);
                }
                else {
                    // Low surrogates should always follow high surrogates
                    codePoints.push(REPLACEMENT);
                }
            }
        }
        else if (isLowSurrogate(first)) {
            // High surrogates should always come first since `decodeValues()`
            // accounts for the byte ordering
            idx += 2;
            codePoints.push(REPLACEMENT);
        }
        else {
            codePoints.push(first);
        }
    }
    // There shouldn't be extra byte(s) left over
    if (idx < input.length)
        codePoints.push(REPLACEMENT);
    return String.fromCodePoint.apply(String, codePoints);
};
/**
 * Returns `true` if the given `codePoint` is a high surrogate.
 * @param codePoint The code point to be evaluated.
 *
 * Reference: https://en.wikipedia.org/wiki/UTF-16#Description
 */
var isHighSurrogate = function (codePoint) {
    return codePoint >= 0xd800 && codePoint <= 0xdbff;
};
/**
 * Returns `true` if the given `codePoint` is a low surrogate.
 * @param codePoint The code point to be evaluated.
 *
 * Reference: https://en.wikipedia.org/wiki/UTF-16#Description
 */
var isLowSurrogate = function (codePoint) {
    return codePoint >= 0xdc00 && codePoint <= 0xdfff;
};
/**
 * Decodes the given utf-16 values first and second using the specified
 * byte order.
 * @param first The first byte of the encoding.
 * @param second The second byte of the encoding.
 * @param byteOrder The byte order of the encoding.
 * Reference: https://en.wikipedia.org/wiki/UTF-16#Examples
 */
var decodeValues = function (first, second, byteOrder) {
    // Append the binary representation of the preceding byte by shifting the
    // first one 8 to the left and than applying a bitwise or-operator to append
    // the second one.
    if (byteOrder === ByteOrder.LittleEndian)
        return (second << 8) | first;
    if (byteOrder === ByteOrder.BigEndian)
        return (first << 8) | second;
    throw new Error("Invalid byteOrder: " + byteOrder);
};
/**
 * Returns whether the given array contains a byte order mark for the
 * UTF-16BE or UTF-16LE encoding. If it has neither, BigEndian is assumed.
 *
 * Reference: https://en.wikipedia.org/wiki/Byte_order_mark#UTF-16
 *
 * @param bytes The byte array to be evaluated.
 */
// prettier-ignore
var readBOM = function (bytes) { return (hasUtf16BigEndianBOM(bytes) ? ByteOrder.BigEndian
    : hasUtf16LittleEndianBOM(bytes) ? ByteOrder.LittleEndian
        : ByteOrder.BigEndian); };
var hasUtf16BigEndianBOM = function (bytes) {
    return bytes[0] === 0xfe && bytes[1] === 0xff;
};
var hasUtf16LittleEndianBOM = function (bytes) {
    return bytes[0] === 0xff && bytes[1] === 0xfe;
};
exports.hasUtf16BOM = function (bytes) {
    return hasUtf16BigEndianBOM(bytes) || hasUtf16LittleEndianBOM(bytes);
};
//# sourceMappingURL=unicode.js.map