"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var core_1 = require("../core");
/**
 * Represents a file that has been embedded in a [[PDFDocument]].
 */
var PDFEmbeddedFile = /** @class */ (function () {
    function PDFEmbeddedFile(ref, doc, embedder) {
        this.alreadyEmbedded = false;
        this.ref = ref;
        this.doc = doc;
        this.embedder = embedder;
    }
    /**
     * > **NOTE:** You probably don't need to call this method directly. The
     * > [[PDFDocument.save]] and [[PDFDocument.saveAsBase64]] methods will
     * > automatically ensure all embeddable files get embedded.
     *
     * Embed this embeddable file in its document.
     *
     * @returns Resolves when the embedding is complete.
     */
    PDFEmbeddedFile.prototype.embed = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ref, Names, EmbeddedFiles, EFNames, AF;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.alreadyEmbedded) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.embedder.embedIntoContext(this.doc.context, this.ref)];
                    case 1:
                        ref = _a.sent();
                        if (!this.doc.catalog.has(core_1.PDFName.of('Names'))) {
                            this.doc.catalog.set(core_1.PDFName.of('Names'), this.doc.context.obj({}));
                        }
                        Names = this.doc.catalog.lookup(core_1.PDFName.of('Names'), core_1.PDFDict);
                        if (!Names.has(core_1.PDFName.of('EmbeddedFiles'))) {
                            Names.set(core_1.PDFName.of('EmbeddedFiles'), this.doc.context.obj({}));
                        }
                        EmbeddedFiles = Names.lookup(core_1.PDFName.of('EmbeddedFiles'), core_1.PDFDict);
                        if (!EmbeddedFiles.has(core_1.PDFName.of('Names'))) {
                            EmbeddedFiles.set(core_1.PDFName.of('Names'), this.doc.context.obj([]));
                        }
                        EFNames = EmbeddedFiles.lookup(core_1.PDFName.of('Names'), core_1.PDFArray);
                        EFNames.push(core_1.PDFHexString.fromText(this.embedder.fileName));
                        EFNames.push(ref);
                        /**
                         * The AF-Tag is needed to achieve PDF-A3 compliance for embedded files
                         *
                         * The following document outlines the uses cases of the associated files (AF) tag.
                         * See:
                         * https://www.pdfa.org/wp-content/uploads/2018/10/PDF20_AN002-AF.pdf
                         */
                        if (!this.doc.catalog.has(core_1.PDFName.of('AF'))) {
                            this.doc.catalog.set(core_1.PDFName.of('AF'), this.doc.context.obj([]));
                        }
                        AF = this.doc.catalog.lookup(core_1.PDFName.of('AF'), core_1.PDFArray);
                        AF.push(ref);
                        this.alreadyEmbedded = true;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.attach]] method, which will create
     * instances of [[PDFEmbeddedFile]] for you.
     *
     * Create an instance of [[PDFEmbeddedFile]] from an existing ref and embedder
     *
     * @param ref The unique reference for this file.
     * @param doc The document to which the file will belong.
     * @param embedder The embedder that will be used to embed the file.
     */
    PDFEmbeddedFile.of = function (ref, doc, embedder) {
        return new PDFEmbeddedFile(ref, doc, embedder);
    };
    return PDFEmbeddedFile;
}());
exports.default = PDFEmbeddedFile;
//# sourceMappingURL=PDFEmbeddedFile.js.map