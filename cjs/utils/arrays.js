"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUint8Array = exports.canBeConvertedToUint8Array = exports.pluckIndices = exports.range = exports.sum = exports.reverseArray = exports.sortedUniq = exports.byAscendingId = exports.arrayAsString = exports.mergeUint8Arrays = exports.mergeIntoTypedArray = exports.typedArrayFor = exports.last = void 0;
var base64_1 = require("./base64");
var strings_1 = require("./strings");
exports.last = function (array) { return array[array.length - 1]; };
// export const dropLast = <T>(array: T[]): T[] =>
// array.slice(0, array.length - 1);
exports.typedArrayFor = function (value) {
    if (value instanceof Uint8Array)
        return value;
    var length = value.length;
    var typedArray = new Uint8Array(length);
    for (var idx = 0; idx < length; idx++) {
        typedArray[idx] = value.charCodeAt(idx);
    }
    return typedArray;
};
exports.mergeIntoTypedArray = function () {
    var arrays = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arrays[_i] = arguments[_i];
    }
    var arrayCount = arrays.length;
    var typedArrays = [];
    for (var idx = 0; idx < arrayCount; idx++) {
        var element = arrays[idx];
        typedArrays[idx] =
            element instanceof Uint8Array ? element : exports.typedArrayFor(element);
    }
    var totalSize = 0;
    for (var idx = 0; idx < arrayCount; idx++) {
        totalSize += arrays[idx].length;
    }
    var merged = new Uint8Array(totalSize);
    var offset = 0;
    for (var arrIdx = 0; arrIdx < arrayCount; arrIdx++) {
        var arr = typedArrays[arrIdx];
        for (var byteIdx = 0, arrLen = arr.length; byteIdx < arrLen; byteIdx++) {
            merged[offset++] = arr[byteIdx];
        }
    }
    return merged;
};
exports.mergeUint8Arrays = function (arrays) {
    var totalSize = 0;
    for (var idx = 0, len = arrays.length; idx < len; idx++) {
        totalSize += arrays[idx].length;
    }
    var mergedBuffer = new Uint8Array(totalSize);
    var offset = 0;
    for (var idx = 0, len = arrays.length; idx < len; idx++) {
        var array = arrays[idx];
        mergedBuffer.set(array, offset);
        offset += array.length;
    }
    return mergedBuffer;
};
exports.arrayAsString = function (array) {
    var str = '';
    for (var idx = 0, len = array.length; idx < len; idx++) {
        str += strings_1.charFromCode(array[idx]);
    }
    return str;
};
exports.byAscendingId = function (a, b) { return a.id - b.id; };
exports.sortedUniq = function (array, indexer) {
    var uniq = [];
    for (var idx = 0, len = array.length; idx < len; idx++) {
        var curr = array[idx];
        var prev = array[idx - 1];
        if (idx === 0 || indexer(curr) !== indexer(prev)) {
            uniq.push(curr);
        }
    }
    return uniq;
};
// Arrays and TypedArrays in JS both have .reverse() methods, which would seem
// to negate the need for this function. However, not all runtimes support this
// method (e.g. React Native). This function compensates for that fact.
exports.reverseArray = function (array) {
    var arrayLen = array.length;
    for (var idx = 0, len = Math.floor(arrayLen / 2); idx < len; idx++) {
        var leftIdx = idx;
        var rightIdx = arrayLen - idx - 1;
        var temp = array[idx];
        array[leftIdx] = array[rightIdx];
        array[rightIdx] = temp;
    }
    return array;
};
exports.sum = function (array) {
    var total = 0;
    for (var idx = 0, len = array.length; idx < len; idx++) {
        total += array[idx];
    }
    return total;
};
exports.range = function (start, end) {
    var arr = new Array(end - start);
    for (var idx = 0, len = arr.length; idx < len; idx++) {
        arr[idx] = start + idx;
    }
    return arr;
};
exports.pluckIndices = function (arr, indices) {
    var plucked = new Array(indices.length);
    for (var idx = 0, len = indices.length; idx < len; idx++) {
        plucked[idx] = arr[indices[idx]];
    }
    return plucked;
};
exports.canBeConvertedToUint8Array = function (input) {
    return input instanceof Uint8Array ||
        input instanceof ArrayBuffer ||
        typeof input === 'string';
};
exports.toUint8Array = function (input) {
    if (typeof input === 'string') {
        return base64_1.decodeFromBase64DataUri(input);
    }
    else if (input instanceof ArrayBuffer) {
        return new Uint8Array(input);
    }
    else if (input instanceof Uint8Array) {
        return input;
    }
    else {
        throw new TypeError('`input` must be one of `string | ArrayBuffer | Uint8Array`');
    }
};
//# sourceMappingURL=arrays.js.map