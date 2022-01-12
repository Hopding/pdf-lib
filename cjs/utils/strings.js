"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLastMatch = exports.parseDate = exports.breakTextIntoLines = exports.charSplit = exports.charAtIndex = exports.mergeLines = exports.lineSplit = exports.isNewlineChar = exports.newlineChars = exports.escapedNewlineChars = exports.cleanText = exports.escapeRegExp = exports.addRandomSuffix = exports.copyStringIntoBuffer = exports.padStart = exports.charFromHexCode = exports.charFromCode = exports.toHexString = exports.toHexStringOfMinLength = exports.toCodePoint = exports.toCharCode = void 0;
exports.toCharCode = function (character) { return character.charCodeAt(0); };
exports.toCodePoint = function (character) { return character.codePointAt(0); };
exports.toHexStringOfMinLength = function (num, minLength) {
    return exports.padStart(num.toString(16), minLength, '0').toUpperCase();
};
exports.toHexString = function (num) { return exports.toHexStringOfMinLength(num, 2); };
exports.charFromCode = function (code) { return String.fromCharCode(code); };
exports.charFromHexCode = function (hex) { return exports.charFromCode(parseInt(hex, 16)); };
exports.padStart = function (value, length, padChar) {
    var padding = '';
    for (var idx = 0, len = length - value.length; idx < len; idx++) {
        padding += padChar;
    }
    return padding + value;
};
exports.copyStringIntoBuffer = function (str, buffer, offset) {
    var length = str.length;
    for (var idx = 0; idx < length; idx++) {
        buffer[offset++] = str.charCodeAt(idx);
    }
    return length;
};
exports.addRandomSuffix = function (prefix, suffixLength) {
    if (suffixLength === void 0) { suffixLength = 4; }
    return prefix + "-" + Math.floor(Math.random() * Math.pow(10, suffixLength));
};
exports.escapeRegExp = function (str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
exports.cleanText = function (text) {
    return text.replace(/\t|\u0085|\u2028|\u2029/g, '    ').replace(/[\b\v]/g, '');
};
exports.escapedNewlineChars = ['\\n', '\\f', '\\r', '\\u000B'];
exports.newlineChars = ['\n', '\f', '\r', '\u000B'];
exports.isNewlineChar = function (text) { return /^[\n\f\r\u000B]$/.test(text); };
exports.lineSplit = function (text) { return text.split(/[\n\f\r\u000B]/); };
exports.mergeLines = function (text) {
    return text.replace(/[\n\f\r\u000B]/g, ' ');
};
// JavaScript's String.charAt() method doesn work on strings containing UTF-16
// characters (with high and low surrogate pairs), such as 💩 (poo emoji). This
// `charAtIndex()` function does.
//
// Credit: https://github.com/mathiasbynens/String.prototype.at/blob/master/at.js#L14-L48
exports.charAtIndex = function (text, index) {
    // Get the first code unit and code unit value
    var cuFirst = text.charCodeAt(index);
    var cuSecond;
    var nextIndex = index + 1;
    var length = 1;
    if (
    // Check if it's the start of a surrogate pair.
    cuFirst >= 0xd800 &&
        cuFirst <= 0xdbff && // high surrogate
        text.length > nextIndex // there is a next code unit
    ) {
        cuSecond = text.charCodeAt(nextIndex);
        if (cuSecond >= 0xdc00 && cuSecond <= 0xdfff)
            length = 2; // low surrogate
    }
    return [text.slice(index, index + length), length];
};
exports.charSplit = function (text) {
    var chars = [];
    for (var idx = 0, len = text.length; idx < len;) {
        var _a = exports.charAtIndex(text, idx), c = _a[0], cLen = _a[1];
        chars.push(c);
        idx += cLen;
    }
    return chars;
};
var buildWordBreakRegex = function (wordBreaks) {
    var newlineCharUnion = exports.escapedNewlineChars.join('|');
    var escapedRules = ['$'];
    for (var idx = 0, len = wordBreaks.length; idx < len; idx++) {
        var wordBreak = wordBreaks[idx];
        if (exports.isNewlineChar(wordBreak)) {
            throw new TypeError("`wordBreak` must not include " + newlineCharUnion);
        }
        escapedRules.push(wordBreak === '' ? '.' : exports.escapeRegExp(wordBreak));
    }
    var breakRules = escapedRules.join('|');
    return new RegExp("(" + newlineCharUnion + ")|((.*?)(" + breakRules + "))", 'gm');
};
exports.breakTextIntoLines = function (text, wordBreaks, maxWidth, computeWidthOfText) {
    var regex = buildWordBreakRegex(wordBreaks);
    var words = exports.cleanText(text).match(regex);
    var currLine = '';
    var currWidth = 0;
    var lines = [];
    var pushCurrLine = function () {
        if (currLine !== '')
            lines.push(currLine);
        currLine = '';
        currWidth = 0;
    };
    for (var idx = 0, len = words.length; idx < len; idx++) {
        var word = words[idx];
        if (exports.isNewlineChar(word)) {
            pushCurrLine();
        }
        else {
            var width = computeWidthOfText(word);
            if (currWidth + width > maxWidth)
                pushCurrLine();
            currLine += word;
            currWidth += width;
        }
    }
    pushCurrLine();
    return lines;
};
// See section "7.9.4 Dates" of the PDF specification
var dateRegex = /^D:(\d\d\d\d)(\d\d)?(\d\d)?(\d\d)?(\d\d)?(\d\d)?([+\-Z])?(\d\d)?'?(\d\d)?'?$/;
exports.parseDate = function (dateStr) {
    var match = dateStr.match(dateRegex);
    if (!match)
        return undefined;
    var year = match[1], _a = match[2], month = _a === void 0 ? '01' : _a, _b = match[3], day = _b === void 0 ? '01' : _b, _c = match[4], hours = _c === void 0 ? '00' : _c, _d = match[5], mins = _d === void 0 ? '00' : _d, _e = match[6], secs = _e === void 0 ? '00' : _e, _f = match[7], offsetSign = _f === void 0 ? 'Z' : _f, _g = match[8], offsetHours = _g === void 0 ? '00' : _g, _h = match[9], offsetMins = _h === void 0 ? '00' : _h;
    // http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15
    var tzOffset = offsetSign === 'Z' ? 'Z' : "" + offsetSign + offsetHours + ":" + offsetMins;
    var date = new Date(year + "-" + month + "-" + day + "T" + hours + ":" + mins + ":" + secs + tzOffset);
    return date;
};
exports.findLastMatch = function (value, regex) {
    var _a;
    var position = 0;
    var lastMatch;
    while (position < value.length) {
        var match = value.substring(position).match(regex);
        if (!match)
            return { match: lastMatch, pos: position };
        lastMatch = match;
        position += ((_a = match.index) !== null && _a !== void 0 ? _a : 0) + match[0].length;
    }
    return { match: lastMatch, pos: position };
};
//# sourceMappingURL=strings.js.map