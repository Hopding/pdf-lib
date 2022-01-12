"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var acroform_1 = require("../acroform");
var ViewerPreferences_1 = tslib_1.__importDefault(require("../interactive/ViewerPreferences"));
var PDFCatalog = /** @class */ (function (_super) {
    tslib_1.__extends(PDFCatalog, _super);
    function PDFCatalog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFCatalog.prototype.Pages = function () {
        return this.lookup(PDFName_1.default.of('Pages'), PDFDict_1.default);
    };
    PDFCatalog.prototype.AcroForm = function () {
        return this.lookupMaybe(PDFName_1.default.of('AcroForm'), PDFDict_1.default);
    };
    PDFCatalog.prototype.getAcroForm = function () {
        var dict = this.AcroForm();
        if (!dict)
            return undefined;
        return acroform_1.PDFAcroForm.fromDict(dict);
    };
    PDFCatalog.prototype.getOrCreateAcroForm = function () {
        var acroForm = this.getAcroForm();
        if (!acroForm) {
            acroForm = acroform_1.PDFAcroForm.create(this.context);
            var acroFormRef = this.context.register(acroForm.dict);
            this.set(PDFName_1.default.of('AcroForm'), acroFormRef);
        }
        return acroForm;
    };
    PDFCatalog.prototype.ViewerPreferences = function () {
        return this.lookupMaybe(PDFName_1.default.of('ViewerPreferences'), PDFDict_1.default);
    };
    PDFCatalog.prototype.getViewerPreferences = function () {
        var dict = this.ViewerPreferences();
        if (!dict)
            return undefined;
        return ViewerPreferences_1.default.fromDict(dict);
    };
    PDFCatalog.prototype.getOrCreateViewerPreferences = function () {
        var viewerPrefs = this.getViewerPreferences();
        if (!viewerPrefs) {
            viewerPrefs = ViewerPreferences_1.default.create(this.context);
            var viewerPrefsRef = this.context.register(viewerPrefs.dict);
            this.set(PDFName_1.default.of('ViewerPreferences'), viewerPrefsRef);
        }
        return viewerPrefs;
    };
    /**
     * Inserts the given ref as a leaf node of this catalog's page tree at the
     * specified index (zero-based). Also increments the `Count` of each node in
     * the page tree hierarchy to accomodate the new page.
     *
     * Returns the ref of the PDFPageTree node into which `leafRef` was inserted.
     */
    PDFCatalog.prototype.insertLeafNode = function (leafRef, index) {
        var pagesRef = this.get(PDFName_1.default.of('Pages'));
        var maybeParentRef = this.Pages().insertLeafNode(leafRef, index);
        return maybeParentRef || pagesRef;
    };
    PDFCatalog.prototype.removeLeafNode = function (index) {
        this.Pages().removeLeafNode(index);
    };
    PDFCatalog.withContextAndPages = function (context, pages) {
        var dict = new Map();
        dict.set(PDFName_1.default.of('Type'), PDFName_1.default.of('Catalog'));
        dict.set(PDFName_1.default.of('Pages'), pages);
        return new PDFCatalog(dict, context);
    };
    PDFCatalog.fromMapWithContext = function (map, context) {
        return new PDFCatalog(map, context);
    };
    return PDFCatalog;
}(PDFDict_1.default));
exports.default = PDFCatalog;
//# sourceMappingURL=PDFCatalog.js.map