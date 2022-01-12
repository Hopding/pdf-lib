"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// prettier-ignore
var MARKERS = [
    0xffc0, 0xffc1, 0xffc2,
    0xffc3, 0xffc5, 0xffc6,
    0xffc7, 0xffc8, 0xffc9,
    0xffca, 0xffcb, 0xffcc,
    0xffcd, 0xffce, 0xffcf,
];
var ColorSpace;
(function (ColorSpace) {
    ColorSpace["DeviceGray"] = "DeviceGray";
    ColorSpace["DeviceRGB"] = "DeviceRGB";
    ColorSpace["DeviceCMYK"] = "DeviceCMYK";
})(ColorSpace || (ColorSpace = {}));
var ChannelToColorSpace = {
    1: ColorSpace.DeviceGray,
    3: ColorSpace.DeviceRGB,
    4: ColorSpace.DeviceCMYK,
};
/**
 * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
 * this class borrows from:
 *   https://github.com/foliojs/pdfkit/blob/a6af76467ce06bd6a2af4aa7271ccac9ff152a7d/lib/image/jpeg.js
 */
var JpegEmbedder = /** @class */ (function () {
    function JpegEmbedder(imageData, bitsPerComponent, width, height, colorSpace) {
        this.imageData = imageData;
        this.bitsPerComponent = bitsPerComponent;
        this.width = width;
        this.height = height;
        this.colorSpace = colorSpace;
    }
    JpegEmbedder.for = function (imageData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var dataView, soi, pos, marker, bitsPerComponent, height, width, channelByte, channelName, colorSpace;
            return tslib_1.__generator(this, function (_a) {
                dataView = new DataView(imageData.buffer);
                soi = dataView.getUint16(0);
                if (soi !== 0xffd8)
                    throw new Error('SOI not found in JPEG');
                pos = 2;
                while (pos < dataView.byteLength) {
                    marker = dataView.getUint16(pos);
                    pos += 2;
                    if (MARKERS.includes(marker))
                        break;
                    pos += dataView.getUint16(pos);
                }
                if (!MARKERS.includes(marker))
                    throw new Error('Invalid JPEG');
                pos += 2;
                bitsPerComponent = dataView.getUint8(pos++);
                height = dataView.getUint16(pos);
                pos += 2;
                width = dataView.getUint16(pos);
                pos += 2;
                channelByte = dataView.getUint8(pos++);
                channelName = ChannelToColorSpace[channelByte];
                if (!channelName)
                    throw new Error('Unknown JPEG channel.');
                colorSpace = channelName;
                return [2 /*return*/, new JpegEmbedder(imageData, bitsPerComponent, width, height, colorSpace)];
            });
        });
    };
    JpegEmbedder.prototype.embedIntoContext = function (context, ref) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var xObject;
            return tslib_1.__generator(this, function (_a) {
                xObject = context.stream(this.imageData, {
                    Type: 'XObject',
                    Subtype: 'Image',
                    BitsPerComponent: this.bitsPerComponent,
                    Width: this.width,
                    Height: this.height,
                    ColorSpace: this.colorSpace,
                    Filter: 'DCTDecode',
                    // CMYK JPEG streams in PDF are typically stored complemented,
                    // with 1 as 'off' and 0 as 'on' (PDF 32000-1:2008, 8.6.4.4).
                    //
                    // Standalone CMYK JPEG (usually exported by Photoshop) are
                    // stored inverse, with 0 as 'off' and 1 as 'on', like RGB.
                    //
                    // Applying a swap here as a hedge that most bytes passing
                    // through this method will benefit from it.
                    Decode: this.colorSpace === ColorSpace.DeviceCMYK
                        ? [1, 0, 1, 0, 1, 0, 1, 0]
                        : undefined,
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
    return JpegEmbedder;
}());
exports.default = JpegEmbedder;
//# sourceMappingURL=JpegEmbedder.js.map