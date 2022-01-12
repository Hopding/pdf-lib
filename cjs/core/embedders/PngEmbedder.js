"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var png_1 = require("../../utils/png");
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee
 */
var PngEmbedder = /** @class */ (function () {
    function PngEmbedder(png) {
        this.image = png;
        this.bitsPerComponent = png.bitsPerComponent;
        this.width = png.width;
        this.height = png.height;
        this.colorSpace = 'DeviceRGB';
    }
    PngEmbedder.for = function (imageData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var png;
            return tslib_1.__generator(this, function (_a) {
                png = png_1.PNG.load(imageData);
                return [2 /*return*/, new PngEmbedder(png)];
            });
        });
    };
    PngEmbedder.prototype.embedIntoContext = function (context, ref) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var SMask, xObject;
            return tslib_1.__generator(this, function (_a) {
                SMask = this.embedAlphaChannel(context);
                xObject = context.flateStream(this.image.rgbChannel, {
                    Type: 'XObject',
                    Subtype: 'Image',
                    BitsPerComponent: this.image.bitsPerComponent,
                    Width: this.image.width,
                    Height: this.image.height,
                    ColorSpace: this.colorSpace,
                    SMask: SMask,
                });
                if (ref) {
                    context.assign(ref, xObject);
                    return [2 /*return*/, ref];
                }
                else {
                    return [2 /*return*/, context.register(xObject)];
                }
                return [2 /*return*/];
            });
        });
    };
    PngEmbedder.prototype.embedAlphaChannel = function (context) {
        if (!this.image.alphaChannel)
            return undefined;
        var xObject = context.flateStream(this.image.alphaChannel, {
            Type: 'XObject',
            Subtype: 'Image',
            Height: this.image.height,
            Width: this.image.width,
            BitsPerComponent: this.image.bitsPerComponent,
            ColorSpace: 'DeviceGray',
            Decode: [0, 1],
        });
        return context.register(xObject);
    };
    return PngEmbedder;
}());
exports.default = PngEmbedder;
//# sourceMappingURL=PngEmbedder.js.map