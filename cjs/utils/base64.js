"use strict";
/*
 * The `chars`, `lookup`, `encode`, and `decode` members of this file are
 * licensed under the following:
 *
 *     base64-arraybuffer
 *     https://github.com/niklasvh/base64-arraybuffer
 *
 *     Copyright (c) 2012 Niklas von Hertzen
 *     Licensed under the MIT license.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeFromBase64DataUri = exports.decodeFromBase64 = exports.encodeToBase64 = void 0;
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// Use a lookup table to find the index.
var lookup = new Uint8Array(256);
for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}
exports.encodeToBase64 = function (bytes) {
    var base64 = '';
    var len = bytes.length;
    for (var i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    }
    else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }
    return base64;
};
exports.decodeFromBase64 = function (base64) {
    var bufferLength = base64.length * 0.75;
    var len = base64.length;
    var i;
    var p = 0;
    var encoded1;
    var encoded2;
    var encoded3;
    var encoded4;
    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }
    var bytes = new Uint8Array(bufferLength);
    for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];
        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    return bytes;
};
// This regex is designed to be as flexible as possible. It will parse certain
// invalid data URIs.
var DATA_URI_PREFIX_REGEX = /^(data)?:?([\w\/\+]+)?;?(charset=[\w-]+|base64)?.*,/i;
/**
 * If the `dataUri` input is a data URI, then the data URI prefix must not be
 * longer than 100 characters, or this function will fail to decode it.
 *
 * @param dataUri a base64 data URI or plain base64 string
 * @returns a Uint8Array containing the decoded input
 */
exports.decodeFromBase64DataUri = function (dataUri) {
    var trimmedUri = dataUri.trim();
    var prefix = trimmedUri.substring(0, 100);
    var res = prefix.match(DATA_URI_PREFIX_REGEX);
    // Assume it's not a data URI - just a plain base64 string
    if (!res)
        return exports.decodeFromBase64(trimmedUri);
    // Remove the data URI prefix and parse the remainder as a base64 string
    var fullMatch = res[0];
    var data = trimmedUri.substring(fullMatch.length);
    return exports.decodeFromBase64(data);
};
//# sourceMappingURL=base64.js.map