"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CMap_1 = require("./CMap");
var FontFlags_1 = require("./FontFlags");
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
var PDFString_1 = tslib_1.__importDefault(require("../objects/PDFString"));
var utils_1 = require("../../utils");
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
var CustomFontEmbedder = /** @class */ (function () {
    function CustomFontEmbedder(font, fontData, customName, fontFeatures) {
        var _this = this;
        this.allGlyphsInFontSortedById = function () {
            var glyphs = new Array(_this.font.characterSet.length);
            for (var idx = 0, len = glyphs.length; idx < len; idx++) {
                var codePoint = _this.font.characterSet[idx];
                glyphs[idx] = _this.font.glyphForCodePoint(codePoint);
            }
            return utils_1.sortedUniq(glyphs.sort(utils_1.byAscendingId), function (g) { return g.id; });
        };
        this.font = font;
        this.scale = 1000 / this.font.unitsPerEm;
        this.fontData = fontData;
        this.fontName = this.font.postscriptName || 'Font';
        this.customName = customName;
        this.fontFeatures = fontFeatures;
        this.baseFontName = '';
        this.glyphCache = utils_1.Cache.populatedBy(this.allGlyphsInFontSortedById);
    }
    CustomFontEmbedder.for = function (fontkit, fontData, customName, fontFeatures) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var font;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fontkit.create(fontData)];
                    case 1:
                        font = _a.sent();
                        return [2 /*return*/, new CustomFontEmbedder(font, fontData, customName, fontFeatures)];
                }
            });
        });
    };
    /**
     * Encode the JavaScript string into this font. (JavaScript encodes strings in
     * Unicode, but embedded fonts use their own custom encodings)
     */
    CustomFontEmbedder.prototype.encodeText = function (text) {
        var glyphs = this.font.layout(text, this.fontFeatures).glyphs;
        var hexCodes = new Array(glyphs.length);
        for (var idx = 0, len = glyphs.length; idx < len; idx++) {
            hexCodes[idx] = utils_1.toHexStringOfMinLength(glyphs[idx].id, 4);
        }
        return PDFHexString_1.default.of(hexCodes.join(''));
    };
    // The advanceWidth takes into account kerning automatically, so we don't
    // have to do that manually like we do for the standard fonts.
    CustomFontEmbedder.prototype.widthOfTextAtSize = function (text, size) {
        var glyphs = this.font.layout(text, this.fontFeatures).glyphs;
        var totalWidth = 0;
        for (var idx = 0, len = glyphs.length; idx < len; idx++) {
            totalWidth += glyphs[idx].advanceWidth * this.scale;
        }
        var scale = size / 1000;
        return totalWidth * scale;
    };
    CustomFontEmbedder.prototype.heightOfFontAtSize = function (size, options) {
        if (options === void 0) { options = {}; }
        var _a = options.descender, descender = _a === void 0 ? true : _a;
        var _b = this.font, ascent = _b.ascent, descent = _b.descent, bbox = _b.bbox;
        var yTop = (ascent || bbox.maxY) * this.scale;
        var yBottom = (descent || bbox.minY) * this.scale;
        var height = yTop - yBottom;
        if (!descender)
            height -= Math.abs(descent) || 0;
        return (height / 1000) * size;
    };
    CustomFontEmbedder.prototype.sizeOfFontAtHeight = function (height) {
        var _a = this.font, ascent = _a.ascent, descent = _a.descent, bbox = _a.bbox;
        var yTop = (ascent || bbox.maxY) * this.scale;
        var yBottom = (descent || bbox.minY) * this.scale;
        return (1000 * height) / (yTop - yBottom);
    };
    CustomFontEmbedder.prototype.embedIntoContext = function (context, ref) {
        this.baseFontName =
            this.customName || context.addRandomSuffix(this.fontName);
        return this.embedFontDict(context, ref);
    };
    CustomFontEmbedder.prototype.embedFontDict = function (context, ref) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var cidFontDictRef, unicodeCMapRef, fontDict;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.embedCIDFontDict(context)];
                    case 1:
                        cidFontDictRef = _a.sent();
                        unicodeCMapRef = this.embedUnicodeCmap(context);
                        fontDict = context.obj({
                            Type: 'Font',
                            Subtype: 'Type0',
                            BaseFont: this.baseFontName,
                            Encoding: 'Identity-H',
                            DescendantFonts: [cidFontDictRef],
                            ToUnicode: unicodeCMapRef,
                        });
                        if (ref) {
                            context.assign(ref, fontDict);
                            return [2 /*return*/, ref];
                        }
                        else {
                            return [2 /*return*/, context.register(fontDict)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CustomFontEmbedder.prototype.isCFF = function () {
        return this.font.cff;
    };
    CustomFontEmbedder.prototype.embedCIDFontDict = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fontDescriptorRef, cidFontDict;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.embedFontDescriptor(context)];
                    case 1:
                        fontDescriptorRef = _a.sent();
                        cidFontDict = context.obj({
                            Type: 'Font',
                            Subtype: this.isCFF() ? 'CIDFontType0' : 'CIDFontType2',
                            CIDToGIDMap: 'Identity',
                            BaseFont: this.baseFontName,
                            CIDSystemInfo: {
                                Registry: PDFString_1.default.of('Adobe'),
                                Ordering: PDFString_1.default.of('Identity'),
                                Supplement: 0,
                            },
                            FontDescriptor: fontDescriptorRef,
                            W: this.computeWidths(),
                        });
                        return [2 /*return*/, context.register(cidFontDict)];
                }
            });
        });
    };
    CustomFontEmbedder.prototype.embedFontDescriptor = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fontStreamRef, scale, _a, italicAngle, ascent, descent, capHeight, xHeight, _b, minX, minY, maxX, maxY, fontDescriptor;
            var _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.embedFontStream(context)];
                    case 1:
                        fontStreamRef = _d.sent();
                        scale = this.scale;
                        _a = this.font, italicAngle = _a.italicAngle, ascent = _a.ascent, descent = _a.descent, capHeight = _a.capHeight, xHeight = _a.xHeight;
                        _b = this.font.bbox, minX = _b.minX, minY = _b.minY, maxX = _b.maxX, maxY = _b.maxY;
                        fontDescriptor = context.obj((_c = {
                                Type: 'FontDescriptor',
                                FontName: this.baseFontName,
                                Flags: FontFlags_1.deriveFontFlags(this.font),
                                FontBBox: [minX * scale, minY * scale, maxX * scale, maxY * scale],
                                ItalicAngle: italicAngle,
                                Ascent: ascent * scale,
                                Descent: descent * scale,
                                CapHeight: (capHeight || ascent) * scale,
                                XHeight: (xHeight || 0) * scale,
                                // Not sure how to compute/find this, nor is anybody else really:
                                // https://stackoverflow.com/questions/35485179/stemv-value-of-the-truetype-font
                                StemV: 0
                            },
                            _c[this.isCFF() ? 'FontFile3' : 'FontFile2'] = fontStreamRef,
                            _c));
                        return [2 /*return*/, context.register(fontDescriptor)];
                }
            });
        });
    };
    CustomFontEmbedder.prototype.serializeFont = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.fontData];
            });
        });
    };
    CustomFontEmbedder.prototype.embedFontStream = function (context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var fontStream, _a, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = context).flateStream;
                        return [4 /*yield*/, this.serializeFont()];
                    case 1:
                        fontStream = _b.apply(_a, [_c.sent(), {
                                Subtype: this.isCFF() ? 'CIDFontType0C' : undefined,
                            }]);
                        return [2 /*return*/, context.register(fontStream)];
                }
            });
        });
    };
    CustomFontEmbedder.prototype.embedUnicodeCmap = function (context) {
        var cmap = CMap_1.createCmap(this.glyphCache.access(), this.glyphId.bind(this));
        var cmapStream = context.flateStream(cmap);
        return context.register(cmapStream);
    };
    CustomFontEmbedder.prototype.glyphId = function (glyph) {
        return glyph ? glyph.id : -1;
    };
    CustomFontEmbedder.prototype.computeWidths = function () {
        var glyphs = this.glyphCache.access();
        var widths = [];
        var currSection = [];
        for (var idx = 0, len = glyphs.length; idx < len; idx++) {
            var currGlyph = glyphs[idx];
            var prevGlyph = glyphs[idx - 1];
            var currGlyphId = this.glyphId(currGlyph);
            var prevGlyphId = this.glyphId(prevGlyph);
            if (idx === 0) {
                widths.push(currGlyphId);
            }
            else if (currGlyphId - prevGlyphId !== 1) {
                widths.push(currSection);
                widths.push(currGlyphId);
                currSection = [];
            }
            currSection.push(currGlyph.advanceWidth * this.scale);
        }
        widths.push(currSection);
        return widths;
    };
    return CustomFontEmbedder;
}());
exports.default = CustomFontEmbedder;
//# sourceMappingURL=CustomFontEmbedder.js.map