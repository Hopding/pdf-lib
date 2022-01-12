"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutSinglelineText = exports.layoutCombedText = exports.layoutMultilineText = void 0;
var errors_1 = require("../errors");
var alignment_1 = require("./alignment");
var utils_1 = require("../../utils");
var MIN_FONT_SIZE = 4;
var MAX_FONT_SIZE = 500;
var computeFontSize = function (lines, font, bounds, multiline) {
    if (multiline === void 0) { multiline = false; }
    var fontSize = MIN_FONT_SIZE;
    while (fontSize < MAX_FONT_SIZE) {
        var linesUsed = 0;
        for (var lineIdx = 0, lineLen = lines.length; lineIdx < lineLen; lineIdx++) {
            linesUsed += 1;
            var line = lines[lineIdx];
            var words = line.split(' ');
            // Layout the words using the current `fontSize`, line wrapping
            // whenever we reach the end of the current line.
            var spaceInLineRemaining = bounds.width;
            for (var idx = 0, len = words.length; idx < len; idx++) {
                var isLastWord = idx === len - 1;
                var word = isLastWord ? words[idx] : words[idx] + ' ';
                var widthOfWord = font.widthOfTextAtSize(word, fontSize);
                spaceInLineRemaining -= widthOfWord;
                if (spaceInLineRemaining <= 0) {
                    linesUsed += 1;
                    spaceInLineRemaining = bounds.width - widthOfWord;
                }
            }
        }
        // Return if we exceeded the allowed width
        if (!multiline && linesUsed > lines.length)
            return fontSize - 1;
        var height = font.heightAtSize(fontSize);
        var lineHeight = height + height * 0.2;
        var totalHeight = lineHeight * linesUsed;
        // Return if we exceeded the allowed height
        if (totalHeight > Math.abs(bounds.height))
            return fontSize - 1;
        fontSize += 1;
    }
    return fontSize;
};
var computeCombedFontSize = function (line, font, bounds, cellCount) {
    var cellWidth = bounds.width / cellCount;
    var cellHeight = bounds.height;
    var fontSize = MIN_FONT_SIZE;
    var chars = utils_1.charSplit(line);
    while (fontSize < MAX_FONT_SIZE) {
        for (var idx = 0, len = chars.length; idx < len; idx++) {
            var c = chars[idx];
            var tooLong = font.widthOfTextAtSize(c, fontSize) > cellWidth * 0.75;
            if (tooLong)
                return fontSize - 1;
        }
        var height = font.heightAtSize(fontSize, { descender: false });
        if (height > cellHeight)
            return fontSize - 1;
        fontSize += 1;
    }
    return fontSize;
};
var lastIndexOfWhitespace = function (line) {
    for (var idx = line.length; idx > 0; idx--) {
        if (/\s/.test(line[idx]))
            return idx;
    }
    return undefined;
};
var splitOutLines = function (input, maxWidth, font, fontSize) {
    var _a;
    var lastWhitespaceIdx = input.length;
    while (lastWhitespaceIdx > 0) {
        var line = input.substring(0, lastWhitespaceIdx);
        var encoded = font.encodeText(line);
        var width = font.widthOfTextAtSize(line, fontSize);
        if (width < maxWidth) {
            var remainder = input.substring(lastWhitespaceIdx) || undefined;
            return { line: line, encoded: encoded, width: width, remainder: remainder };
        }
        lastWhitespaceIdx = (_a = lastIndexOfWhitespace(line)) !== null && _a !== void 0 ? _a : 0;
    }
    // We were unable to split the input enough to get a chunk that would fit
    // within the specified `maxWidth` so we'll just return everything
    return {
        line: input,
        encoded: font.encodeText(input),
        width: font.widthOfTextAtSize(input, fontSize),
        remainder: undefined,
    };
};
exports.layoutMultilineText = function (text, _a) {
    var alignment = _a.alignment, fontSize = _a.fontSize, font = _a.font, bounds = _a.bounds;
    var lines = utils_1.lineSplit(utils_1.cleanText(text));
    if (fontSize === undefined || fontSize === 0) {
        fontSize = computeFontSize(lines, font, bounds, true);
    }
    var height = font.heightAtSize(fontSize);
    var lineHeight = height + height * 0.2;
    var textLines = [];
    var minX = bounds.x;
    var minY = bounds.y;
    var maxX = bounds.x + bounds.width;
    var maxY = bounds.y + bounds.height;
    var y = bounds.y + bounds.height;
    for (var idx = 0, len = lines.length; idx < len; idx++) {
        var prevRemainder = lines[idx];
        while (prevRemainder !== undefined) {
            var _b = splitOutLines(prevRemainder, bounds.width, font, fontSize), line = _b.line, encoded = _b.encoded, width = _b.width, remainder = _b.remainder;
            // prettier-ignore
            var x = (alignment === alignment_1.TextAlignment.Left ? bounds.x
                : alignment === alignment_1.TextAlignment.Center ? bounds.x + (bounds.width / 2) - (width / 2)
                    : alignment === alignment_1.TextAlignment.Right ? bounds.x + bounds.width - width
                        : bounds.x);
            y -= lineHeight;
            if (x < minX)
                minX = x;
            if (y < minY)
                minY = y;
            if (x + width > maxX)
                maxX = x + width;
            if (y + height > maxY)
                maxY = y + height;
            textLines.push({ text: line, encoded: encoded, width: width, height: height, x: x, y: y });
            // Only trim lines that we had to split ourselves. So we won't trim lines
            // that the user provided themselves with whitespace.
            prevRemainder = remainder === null || remainder === void 0 ? void 0 : remainder.trim();
        }
    }
    return {
        fontSize: fontSize,
        lineHeight: lineHeight,
        lines: textLines,
        bounds: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        },
    };
};
exports.layoutCombedText = function (text, _a) {
    var fontSize = _a.fontSize, font = _a.font, bounds = _a.bounds, cellCount = _a.cellCount;
    var line = utils_1.mergeLines(utils_1.cleanText(text));
    if (line.length > cellCount) {
        throw new errors_1.CombedTextLayoutError(line.length, cellCount);
    }
    if (fontSize === undefined || fontSize === 0) {
        fontSize = computeCombedFontSize(line, font, bounds, cellCount);
    }
    var cellWidth = bounds.width / cellCount;
    var height = font.heightAtSize(fontSize, { descender: false });
    var y = bounds.y + (bounds.height / 2 - height / 2);
    var cells = [];
    var minX = bounds.x;
    var minY = bounds.y;
    var maxX = bounds.x + bounds.width;
    var maxY = bounds.y + bounds.height;
    var cellOffset = 0;
    var charOffset = 0;
    while (cellOffset < cellCount) {
        var _b = utils_1.charAtIndex(line, charOffset), char = _b[0], charLength = _b[1];
        var encoded = font.encodeText(char);
        var width = font.widthOfTextAtSize(char, fontSize);
        var cellCenter = bounds.x + (cellWidth * cellOffset + cellWidth / 2);
        var x = cellCenter - width / 2;
        if (x < minX)
            minX = x;
        if (y < minY)
            minY = y;
        if (x + width > maxX)
            maxX = x + width;
        if (y + height > maxY)
            maxY = y + height;
        cells.push({ text: line, encoded: encoded, width: width, height: height, x: x, y: y });
        cellOffset += 1;
        charOffset += charLength;
    }
    return {
        fontSize: fontSize,
        cells: cells,
        bounds: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        },
    };
};
exports.layoutSinglelineText = function (text, _a) {
    var alignment = _a.alignment, fontSize = _a.fontSize, font = _a.font, bounds = _a.bounds;
    var line = utils_1.mergeLines(utils_1.cleanText(text));
    if (fontSize === undefined || fontSize === 0) {
        fontSize = computeFontSize([line], font, bounds);
    }
    var encoded = font.encodeText(line);
    var width = font.widthOfTextAtSize(line, fontSize);
    var height = font.heightAtSize(fontSize, { descender: false });
    // prettier-ignore
    var x = (alignment === alignment_1.TextAlignment.Left ? bounds.x
        : alignment === alignment_1.TextAlignment.Center ? bounds.x + (bounds.width / 2) - (width / 2)
            : alignment === alignment_1.TextAlignment.Right ? bounds.x + bounds.width - width
                : bounds.x);
    var y = bounds.y + (bounds.height / 2 - height / 2);
    return {
        fontSize: fontSize,
        line: { text: line, encoded: encoded, width: width, height: height, x: x, y: y },
        bounds: { x: x, y: y, width: width, height: height },
    };
};
//# sourceMappingURL=layout.js.map