"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCmap = void 0;
var utils_1 = require("../../utils");
var unicode_1 = require("../../utils/unicode");
/** `glyphs` should be an array of unique glyphs */
exports.createCmap = function (glyphs, glyphId) {
    var bfChars = new Array(glyphs.length);
    for (var idx = 0, len = glyphs.length; idx < len; idx++) {
        var glyph = glyphs[idx];
        var id = cmapHexFormat(cmapHexString(glyphId(glyph)));
        var unicode = cmapHexFormat.apply(void 0, glyph.codePoints.map(cmapCodePointFormat));
        bfChars[idx] = [id, unicode];
    }
    return fillCmapTemplate(bfChars);
};
/* =============================== Templates ================================ */
var fillCmapTemplate = function (bfChars) { return "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo <<\n  /Registry (Adobe)\n  /Ordering (UCS)\n  /Supplement 0\n>> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000><ffff>\nendcodespacerange\n" + bfChars.length + " beginbfchar\n" + bfChars.map(function (_a) {
    var glyphId = _a[0], codePoint = _a[1];
    return glyphId + " " + codePoint;
}).join('\n') + "\nendbfchar\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend"; };
/* =============================== Utilities ================================ */
var cmapHexFormat = function () {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    return "<" + values.join('') + ">";
};
var cmapHexString = function (value) { return utils_1.toHexStringOfMinLength(value, 4); };
var cmapCodePointFormat = function (codePoint) {
    if (unicode_1.isWithinBMP(codePoint))
        return cmapHexString(codePoint);
    if (unicode_1.hasSurrogates(codePoint)) {
        var hs = unicode_1.highSurrogate(codePoint);
        var ls = unicode_1.lowSurrogate(codePoint);
        return "" + cmapHexString(hs) + cmapHexString(ls);
    }
    var hex = utils_1.toHexString(codePoint);
    var msg = "0x" + hex + " is not a valid UTF-8 or UTF-16 codepoint.";
    throw new Error(msg);
};
//# sourceMappingURL=CMap.js.map