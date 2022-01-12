"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CustomFontEmbedder_1 = tslib_1.__importDefault(require("./CustomFontEmbedder"));
var PDFHexString_1 = tslib_1.__importDefault(require("../objects/PDFHexString"));
var utils_1 = require("../../utils");
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
 */
var CustomFontSubsetEmbedder = /** @class */ (function (_super) {
    tslib_1.__extends(CustomFontSubsetEmbedder, _super);
    function CustomFontSubsetEmbedder(font, fontData, customFontName, fontFeatures) {
        var _this = _super.call(this, font, fontData, customFontName, fontFeatures) || this;
        _this.subset = _this.font.createSubset();
        _this.glyphs = [];
        _this.glyphCache = utils_1.Cache.populatedBy(function () { return _this.glyphs; });
        _this.glyphIdMap = new Map();
        return _this;
    }
    CustomFontSubsetEmbedder.for = function (fontkit, fontData, customFontName, fontFeatures) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var font;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fontkit.create(fontData)];
                    case 1:
                        font = _a.sent();
                        return [2 /*return*/, new CustomFontSubsetEmbedder(font, fontData, customFontName, fontFeatures)];
                }
            });
        });
    };
    CustomFontSubsetEmbedder.prototype.encodeText = function (text) {
        var glyphs = this.font.layout(text, this.fontFeatures).glyphs;
        var hexCodes = new Array(glyphs.length);
        for (var idx = 0, len = glyphs.length; idx < len; idx++) {
            var glyph = glyphs[idx];
            var subsetGlyphId = this.subset.includeGlyph(glyph);
            this.glyphs[subsetGlyphId - 1] = glyph;
            this.glyphIdMap.set(glyph.id, subsetGlyphId);
            hexCodes[idx] = utils_1.toHexStringOfMinLength(subsetGlyphId, 4);
        }
        this.glyphCache.invalidate();
        return PDFHexString_1.default.of(hexCodes.join(''));
    };
    CustomFontSubsetEmbedder.prototype.isCFF = function () {
        return this.subset.cff;
    };
    CustomFontSubsetEmbedder.prototype.glyphId = function (glyph) {
        return glyph ? this.glyphIdMap.get(glyph.id) : -1;
    };
    CustomFontSubsetEmbedder.prototype.serializeFont = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var parts = [];
            _this.subset
                .encodeStream()
                .on('data', function (bytes) { return parts.push(bytes); })
                .on('end', function () { return resolve(utils_1.mergeUint8Arrays(parts)); })
                .on('error', function (err) { return reject(err); });
        });
    };
    return CustomFontSubsetEmbedder;
}(CustomFontEmbedder_1.default));
exports.default = CustomFontSubsetEmbedder;
//# sourceMappingURL=CustomFontSubsetEmbedder.js.map