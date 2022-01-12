"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFDocument_1 = tslib_1.__importDefault(require("./PDFDocument"));
var core_1 = require("../core");
var utils_1 = require("../utils");
/**
 * Represents an image that has been embedded in a [[PDFDocument]].
 */
var PDFImage = /** @class */ (function () {
    function PDFImage(ref, doc, embedder) {
        utils_1.assertIs(ref, 'ref', [[core_1.PDFRef, 'PDFRef']]);
        utils_1.assertIs(doc, 'doc', [[PDFDocument_1.default, 'PDFDocument']]);
        utils_1.assertIs(embedder, 'embedder', [
            [core_1.JpegEmbedder, 'JpegEmbedder'],
            [core_1.PngEmbedder, 'PngEmbedder'],
        ]);
        this.ref = ref;
        this.doc = doc;
        this.width = embedder.width;
        this.height = embedder.height;
        this.embedder = embedder;
    }
    /**
     * Compute the width and height of this image after being scaled by the
     * given `factor`. For example:
     * ```js
     * image.width  // => 500
     * image.height // => 250
     *
     * const scaled = image.scale(0.5)
     * scaled.width  // => 250
     * scaled.height // => 125
     * ```
     * This operation is often useful before drawing an image with
     * [[PDFPage.drawImage]] to compute the `width` and `height` options.
     * @param factor The factor by which this image should be scaled.
     * @returns The width and height of the image after being scaled.
     */
    PDFImage.prototype.scale = function (factor) {
        utils_1.assertIs(factor, 'factor', ['number']);
        return { width: this.width * factor, height: this.height * factor };
    };
    /**
     * Get the width and height of this image after scaling it as large as
     * possible while maintaining its aspect ratio and not exceeding the
     * specified `width` and `height`. For example:
     * ```
     * image.width  // => 500
     * image.height // => 250
     *
     * const scaled = image.scaleToFit(750, 1000)
     * scaled.width  // => 750
     * scaled.height // => 375
     * ```
     * The `width` and `height` parameters can also be thought of as the width
     * and height of a box that the scaled image must fit within.
     * @param width The bounding box's width.
     * @param height The bounding box's height.
     * @returns The width and height of the image after being scaled.
     */
    PDFImage.prototype.scaleToFit = function (width, height) {
        utils_1.assertIs(width, 'width', ['number']);
        utils_1.assertIs(height, 'height', ['number']);
        var imgWidthScale = width / this.width;
        var imgHeightScale = height / this.height;
        var scale = Math.min(imgWidthScale, imgHeightScale);
        return this.scale(scale);
    };
    /**
     * Get the width and height of this image. For example:
     * ```js
     * const { width, height } = image.size()
     * ```
     * @returns The width and height of the image.
     */
    PDFImage.prototype.size = function () {
        return this.scale(1);
    };
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all images get embedded.
     *
     * Embed this image in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    PDFImage.prototype.embed = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, doc, ref;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.embedder)
                            return [2 /*return*/];
                        // The image should only be embedded once. If there's a pending embed
                        // operation then wait on it. Otherwise we need to start the embed.
                        if (!this.embedTask) {
                            _a = this, doc = _a.doc, ref = _a.ref;
                            this.embedTask = this.embedder.embedIntoContext(doc.context, ref);
                        }
                        return [4 /*yield*/, this.embedTask];
                    case 1:
                        _b.sent();
                        // We clear `this.embedder` so that the indirectly referenced image data
                        // can be garbage collected, thus avoiding a memory leak.
                        // See https://github.com/Hopding/pdf-lib/pull/1032/files.
                        this.embedder = undefined;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.embedPng]] and [[PDFDocument.embedJpg]]
     * > methods, which will create instances of [[PDFImage]] for you.
     *
     * Create an instance of [[PDFImage]] from an existing ref and embedder
     *
     * @param ref The unique reference for this image.
     * @param doc The document to which the image will belong.
     * @param embedder The embedder that will be used to embed the image.
     */
    PDFImage.of = function (ref, doc, embedder) {
        return new PDFImage(ref, doc, embedder);
    };
    return PDFImage;
}());
exports.default = PDFImage;
//# sourceMappingURL=PDFImage.js.map