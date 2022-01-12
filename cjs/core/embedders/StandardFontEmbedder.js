"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var standard_fonts_1 = require("@pdf-lib/standard-fonts");
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
var utils_1 = require("../../utils");
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/foliojs/pdfkit/blob/f91bdd61c164a72ea06be1a43dc0a412afc3925f/lib/font/afm.coffee
 */
var StandardFontEmbedder = /** @class */ (function () {
    function StandardFontEmbedder(fontName, customName) {
        // prettier-ignore
        this.encoding = (fontName === standard_fonts_1.FontNames.ZapfDingbats ? standard_fonts_1.Encodings.ZapfDingbats
            : fontName === standard_fonts_1.FontNames.Symbol ? standard_fonts_1.Encodings.Symbol
                : standard_fonts_1.Encodings.WinAnsi);
        this.font = standard_fonts_1.Font.load(fontName);
        this.fontName = this.font.FontName;
        this.customName = customName;
    }
    /**
     * Encode the JavaScript string into this font. (JavaScript encodes strings in
     * Unicode, but standard fonts use either WinAnsi, ZapfDingbats, or Symbol
     * encodings)
     */
    StandardFontEmbedder.prototype.encodeText = function (text) {
        var glyphs = this.encodeTextAsGlyphs(text);
        var hexCodes = new Array(glyphs.length);
        for (var idx = 0, len = glyphs.length; idx < len; idx++) {
            hexCodes[idx] = utils_1.toHexString(glyphs[idx].code);
        }
        return PDFHexString_1.default.of(hexCodes.join(''));
    };
    StandardFontEmbedder.prototype.widthOfTextAtSize = function (text, size) {
        var glyphs = this.encodeTextAsGlyphs(text);
        var totalWidth = 0;
        for (var idx = 0, len = glyphs.length; idx < len; idx++) {
            var left = glyphs[idx].name;
            var right = (glyphs[idx + 1] || {}).name;
            var kernAmount = this.font.getXAxisKerningForPair(left, right) || 0;
            totalWidth += this.widthOfGlyph(left) + kernAmount;
        }
        var scale = size / 1000;
        return totalWidth * scale;
    };
    StandardFontEmbedder.prototype.heightOfFontAtSize = function (size, options) {
        if (options === void 0) { options = {}; }
        var _a = options.descender, descender = _a === void 0 ? true : _a;
        var _b = this.font, Ascender = _b.Ascender, Descender = _b.Descender, FontBBox = _b.FontBBox;
        var yTop = Ascender || FontBBox[3];
        var yBottom = Descender || FontBBox[1];
        var height = yTop - yBottom;
        if (!descender)
            height += Descender || 0;
        return (height / 1000) * size;
    };
    StandardFontEmbedder.prototype.sizeOfFontAtHeight = function (height) {
        var _a = this.font, Ascender = _a.Ascender, Descender = _a.Descender, FontBBox = _a.FontBBox;
        var yTop = Ascender || FontBBox[3];
        var yBottom = Descender || FontBBox[1];
        return (1000 * height) / (yTop - yBottom);
    };
    StandardFontEmbedder.prototype.embedIntoContext = function (context, ref) {
        var fontDict = context.obj({
            Type: 'Font',
            Subtype: 'Type1',
            BaseFont: this.customName || this.fontName,
            Encoding: this.encoding === standard_fonts_1.Encodings.WinAnsi ? 'WinAnsiEncoding' : undefined,
        });
        if (ref) {
            context.assign(ref, fontDict);
            return ref;
        }
        else {
            return context.register(fontDict);
        }
    };
    StandardFontEmbedder.prototype.widthOfGlyph = function (glyphName) {
        // Default to 250 if font doesn't specify a width
        return this.font.getWidthOfGlyph(glyphName) || 250;
    };
    StandardFontEmbedder.prototype.encodeTextAsGlyphs = function (text) {
        var codePoints = Array.from(text);
        var glyphs = new Array(codePoints.length);
        for (var idx = 0, len = codePoints.length; idx < len; idx++) {
            var codePoint = utils_1.toCodePoint(codePoints[idx]);
            glyphs[idx] = this.encoding.encodeUnicodeCodePoint(codePoint);
        }
        return glyphs;
    };
    StandardFontEmbedder.for = function (fontName, customName) {
        return new StandardFontEmbedder(fontName, customName);
    };
    return StandardFontEmbedder;
}());
exports.default = StandardFontEmbedder;
//# sourceMappingURL=StandardFontEmbedder.js.map