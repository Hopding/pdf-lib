"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFDocument_1 = tslib_1.__importDefault(require("./PDFDocument"));
var core_1 = require("../core");
var utils_1 = require("../utils");
/**
 * Represents a PDF page that has been embedded in a [[PDFDocument]].
 */
var PDFEmbeddedPage = /** @class */ (function () {
    function PDFEmbeddedPage(ref, doc, embedder) {
        this.alreadyEmbedded = false;
        utils_1.assertIs(ref, 'ref', [[core_1.PDFRef, 'PDFRef']]);
        utils_1.assertIs(doc, 'doc', [[PDFDocument_1.default, 'PDFDocument']]);
        utils_1.assertIs(embedder, 'embedder', [[core_1.PDFPageEmbedder, 'PDFPageEmbedder']]);
        this.ref = ref;
        this.doc = doc;
        this.width = embedder.width;
        this.height = embedder.height;
        this.embedder = embedder;
    }
    /**
     * Compute the width and height of this page after being scaled by the
     * given `factor`. For example:
     * ```js
     * embeddedPage.width  // => 500
     * embeddedPage.height // => 250
     *
     * const scaled = embeddedPage.scale(0.5)
     * scaled.width  // => 250
     * scaled.height // => 125
     * ```
     * This operation is often useful before drawing a page with
     * [[PDFPage.drawPage]] to compute the `width` and `height` options.
     * @param factor The factor by which this page should be scaled.
     * @returns The width and height of the page after being scaled.
     */
    PDFEmbeddedPage.prototype.scale = function (factor) {
        utils_1.assertIs(factor, 'factor', ['number']);
        return { width: this.width * factor, height: this.height * factor };
    };
    /**
     * Get the width and height of this page. For example:
     * ```js
     * const { width, height } = embeddedPage.size()
     * ```
     * @returns The width and height of the page.
     */
    PDFEmbeddedPage.prototype.size = function () {
        return this.scale(1);
    };
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all embeddable pages get embedded.
     *
     * Embed this embeddable page in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    PDFEmbeddedPage.prototype.embed = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.alreadyEmbedded) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.embedder.embedIntoContext(this.doc.context, this.ref)];
                    case 1:
                        _a.sent();
                        this.alreadyEmbedded = true;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.embedPdf]] and
     * > [[PDFDocument.embedPage]] methods, which will create instances of
     * > [[PDFEmbeddedPage]] for you.
     *
     * Create an instance of [[PDFEmbeddedPage]] from an existing ref and embedder
     *
     * @param ref The unique reference for this embedded page.
     * @param doc The document to which the embedded page will belong.
     * @param embedder The embedder that will be used to embed the page.
     */
    PDFEmbeddedPage.of = function (ref, doc, embedder) {
        return new PDFEmbeddedPage(ref, doc, embedder);
    };
    return PDFEmbeddedPage;
}());
exports.default = PDFEmbeddedPage;
//# sourceMappingURL=PDFEmbeddedPage.js.map