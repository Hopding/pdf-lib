"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Duplex = exports.PrintScaling = exports.ReadingDirection = exports.NonFullScreenPageMode = void 0;
var tslib_1 = require("tslib");
var PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
var PDFBool_1 = tslib_1.__importDefault(require("../objects/PDFBool"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
var utils_1 = require("../../utils");
var asEnum = function (rawValue, enumType) {
    if (rawValue === undefined)
        return undefined;
    return enumType[rawValue];
};
var NonFullScreenPageMode;
(function (NonFullScreenPageMode) {
    /**
     * After exiting FullScreen mode, neither the document outline nor thumbnail
     * images should be visible.
     */
    NonFullScreenPageMode["UseNone"] = "UseNone";
    /** After exiting FullScreen mode, the document outline should be visible. */
    NonFullScreenPageMode["UseOutlines"] = "UseOutlines";
    /** After exiting FullScreen mode, thumbnail images should be visible. */
    NonFullScreenPageMode["UseThumbs"] = "UseThumbs";
    /**
     * After exiting FullScreen mode, the optional content group panel should be
     * visible.
     */
    NonFullScreenPageMode["UseOC"] = "UseOC";
})(NonFullScreenPageMode = exports.NonFullScreenPageMode || (exports.NonFullScreenPageMode = {}));
var ReadingDirection;
(function (ReadingDirection) {
    /** The predominant reading order is Left to Right. */
    ReadingDirection["L2R"] = "L2R";
    /**
     * The predominant reading order is Right to left (including vertical writing
     * systems, such as Chinese, Japanese and Korean).
     */
    ReadingDirection["R2L"] = "R2L";
})(ReadingDirection = exports.ReadingDirection || (exports.ReadingDirection = {}));
var PrintScaling;
(function (PrintScaling) {
    /** No page scaling. */
    PrintScaling["None"] = "None";
    /* Use the PDF reader's default print scaling. */
    PrintScaling["AppDefault"] = "AppDefault";
})(PrintScaling = exports.PrintScaling || (exports.PrintScaling = {}));
var Duplex;
(function (Duplex) {
    /** The PDF reader should print single-sided. */
    Duplex["Simplex"] = "Simplex";
    /**
     * The PDF reader should print double sided and flip on the short edge of the
     * sheet.
     */
    Duplex["DuplexFlipShortEdge"] = "DuplexFlipShortEdge";
    /**
     * The PDF reader should print double sided and flip on the long edge of the
     * sheet.
     */
    Duplex["DuplexFlipLongEdge"] = "DuplexFlipLongEdge";
})(Duplex = exports.Duplex || (exports.Duplex = {}));
var ViewerPreferences = /** @class */ (function () {
    /** @ignore */
    function ViewerPreferences(dict) {
        this.dict = dict;
    }
    ViewerPreferences.prototype.lookupBool = function (key) {
        var returnObj = this.dict.lookup(PDFName_1.default.of(key));
        if (returnObj instanceof PDFBool_1.default)
            return returnObj;
        return undefined;
    };
    ViewerPreferences.prototype.lookupName = function (key) {
        var returnObj = this.dict.lookup(PDFName_1.default.of(key));
        if (returnObj instanceof PDFName_1.default)
            return returnObj;
        return undefined;
    };
    /** @ignore */
    ViewerPreferences.prototype.HideToolbar = function () {
        return this.lookupBool('HideToolbar');
    };
    /** @ignore */
    ViewerPreferences.prototype.HideMenubar = function () {
        return this.lookupBool('HideMenubar');
    };
    /** @ignore */
    ViewerPreferences.prototype.HideWindowUI = function () {
        return this.lookupBool('HideWindowUI');
    };
    /** @ignore */
    ViewerPreferences.prototype.FitWindow = function () {
        return this.lookupBool('FitWindow');
    };
    /** @ignore */
    ViewerPreferences.prototype.CenterWindow = function () {
        return this.lookupBool('CenterWindow');
    };
    /** @ignore */
    ViewerPreferences.prototype.DisplayDocTitle = function () {
        return this.lookupBool('DisplayDocTitle');
    };
    /** @ignore */
    ViewerPreferences.prototype.NonFullScreenPageMode = function () {
        return this.lookupName('NonFullScreenPageMode');
    };
    /** @ignore */
    ViewerPreferences.prototype.Direction = function () {
        return this.lookupName('Direction');
    };
    /** @ignore */
    ViewerPreferences.prototype.PrintScaling = function () {
        return this.lookupName('PrintScaling');
    };
    /** @ignore */
    ViewerPreferences.prototype.Duplex = function () {
        return this.lookupName('Duplex');
    };
    /** @ignore */
    ViewerPreferences.prototype.PickTrayByPDFSize = function () {
        return this.lookupBool('PickTrayByPDFSize');
    };
    /** @ignore */
    ViewerPreferences.prototype.PrintPageRange = function () {
        var PrintPageRange = this.dict.lookup(PDFName_1.default.of('PrintPageRange'));
        if (PrintPageRange instanceof PDFArray_1.default)
            return PrintPageRange;
        return undefined;
    };
    /** @ignore */
    ViewerPreferences.prototype.NumCopies = function () {
        var NumCopies = this.dict.lookup(PDFName_1.default.of('NumCopies'));
        if (NumCopies instanceof PDFNumber_1.default)
            return NumCopies;
        return undefined;
    };
    /**
     * Returns `true` if PDF readers should hide the toolbar menus when displaying
     * this document.
     * @returns Whether or not toolbars should be hidden.
     */
    ViewerPreferences.prototype.getHideToolbar = function () {
        var _a, _b;
        return (_b = (_a = this.HideToolbar()) === null || _a === void 0 ? void 0 : _a.asBoolean()) !== null && _b !== void 0 ? _b : false;
    };
    /**
     * Returns `true` if PDF readers should hide the menu bar when displaying this
     * document.
     * @returns Whether or not the menu bar should be hidden.
     */
    ViewerPreferences.prototype.getHideMenubar = function () {
        var _a, _b;
        return (_b = (_a = this.HideMenubar()) === null || _a === void 0 ? void 0 : _a.asBoolean()) !== null && _b !== void 0 ? _b : false;
    };
    /**
     * Returns `true` if PDF readers should hide the user interface elements in
     * the document's window (such as scroll bars and navigation controls),
     * leaving only the document's contents displayed.
     * @returns Whether or not user interface elements should be hidden.
     */
    ViewerPreferences.prototype.getHideWindowUI = function () {
        var _a, _b;
        return (_b = (_a = this.HideWindowUI()) === null || _a === void 0 ? void 0 : _a.asBoolean()) !== null && _b !== void 0 ? _b : false;
    };
    /**
     * Returns `true` if PDF readers should resize the document's window to fit
     * the size of the first displayed page.
     * @returns Whether or not the window should be resized to fit.
     */
    ViewerPreferences.prototype.getFitWindow = function () {
        var _a, _b;
        return (_b = (_a = this.FitWindow()) === null || _a === void 0 ? void 0 : _a.asBoolean()) !== null && _b !== void 0 ? _b : false;
    };
    /**
     * Returns `true` if PDF readers should position the document's window in the
     * center of the screen.
     * @returns Whether or not to center the document window.
     */
    ViewerPreferences.prototype.getCenterWindow = function () {
        var _a, _b;
        return (_b = (_a = this.CenterWindow()) === null || _a === void 0 ? void 0 : _a.asBoolean()) !== null && _b !== void 0 ? _b : false;
    };
    /**
     * Returns `true` if the window's title bar should display the document
     * `Title`, taken from the document metadata (see [[PDFDocument.getTitle]]).
     * Returns `false` if the title bar should instead display the filename of the
     * PDF file.
     * @returns Whether to display the document title.
     */
    ViewerPreferences.prototype.getDisplayDocTitle = function () {
        var _a, _b;
        return (_b = (_a = this.DisplayDocTitle()) === null || _a === void 0 ? void 0 : _a.asBoolean()) !== null && _b !== void 0 ? _b : false;
    };
    /**
     * Returns the page mode, which tells the PDF reader how to display the
     * document after exiting full-screen mode.
     * @returns The page mode after exiting full-screen mode.
     */
    ViewerPreferences.prototype.getNonFullScreenPageMode = function () {
        var _a, _b;
        var mode = (_a = this.NonFullScreenPageMode()) === null || _a === void 0 ? void 0 : _a.decodeText();
        return (_b = asEnum(mode, NonFullScreenPageMode)) !== null && _b !== void 0 ? _b : NonFullScreenPageMode.UseNone;
    };
    /**
     * Returns the predominant reading order for text.
     * @returns The text reading order.
     */
    ViewerPreferences.prototype.getReadingDirection = function () {
        var _a, _b;
        var direction = (_a = this.Direction()) === null || _a === void 0 ? void 0 : _a.decodeText();
        return (_b = asEnum(direction, ReadingDirection)) !== null && _b !== void 0 ? _b : ReadingDirection.L2R;
    };
    /**
     * Returns the page scaling option that the PDF reader should select when the
     * print dialog is displayed.
     * @returns The page scaling option.
     */
    ViewerPreferences.prototype.getPrintScaling = function () {
        var _a, _b;
        var scaling = (_a = this.PrintScaling()) === null || _a === void 0 ? void 0 : _a.decodeText();
        return (_b = asEnum(scaling, PrintScaling)) !== null && _b !== void 0 ? _b : PrintScaling.AppDefault;
    };
    /**
     * Returns the paper handling option that should be used when printing the
     * file from the print dialog.
     * @returns The paper handling option.
     */
    ViewerPreferences.prototype.getDuplex = function () {
        var _a;
        var duplex = (_a = this.Duplex()) === null || _a === void 0 ? void 0 : _a.decodeText();
        return asEnum(duplex, Duplex);
    };
    /**
     * Returns `true` if the PDF page size should be used to select the input
     * paper tray.
     * @returns Whether or not the PDF page size should be used to select the
     *          input paper tray.
     */
    ViewerPreferences.prototype.getPickTrayByPDFSize = function () {
        var _a;
        return (_a = this.PickTrayByPDFSize()) === null || _a === void 0 ? void 0 : _a.asBoolean();
    };
    /**
     * Returns an array of page number ranges, which are the values used to
     * initialize the print dialog box when the file is printed. Each range
     * specifies the first (`start`) and last (`end`) pages in a sub-range of
     * pages to be printed. The first page of the PDF file is denoted by 0.
     * For example:
     * ```js
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * const includesPage3 = viewerPrefs
     *   .getPrintRanges()
     *   .some(pr => pr.start =< 2 && pr.end >= 2)
     * if (includesPage3) console.log('printRange includes page 3')
     * ```
     * @returns An array of objects, each with the properties `start` and `end`,
     *          denoting page indices. If not, specified an empty array is
     *          returned.
     */
    ViewerPreferences.prototype.getPrintPageRange = function () {
        var rng = this.PrintPageRange();
        if (!rng)
            return [];
        var pageRanges = [];
        for (var i = 0; i < rng.size(); i += 2) {
            // Despite the spec clearly stating that "The first page of the PDF file
            // shall be donoted by 1", several test PDFs (spec 1.7) created in
            // Acrobat XI 11.0 and also read with Reader DC 2020.013 indicate this is
            // actually a 0 based index.
            var start = rng.lookup(i, PDFNumber_1.default).asNumber();
            var end = rng.lookup(i + 1, PDFNumber_1.default).asNumber();
            pageRanges.push({ start: start, end: end });
        }
        return pageRanges;
    };
    /**
     * Returns the number of copies to be printed when the print dialog is opened
     * for this document.
     * @returns The default number of copies to be printed.
     */
    ViewerPreferences.prototype.getNumCopies = function () {
        var _a, _b;
        return (_b = (_a = this.NumCopies()) === null || _a === void 0 ? void 0 : _a.asNumber()) !== null && _b !== void 0 ? _b : 1;
    };
    /**
     * Choose whether the PDF reader's toolbars should be hidden while the
     * document is active.
     * @param hideToolbar `true` if the toolbar should be hidden.
     */
    ViewerPreferences.prototype.setHideToolbar = function (hideToolbar) {
        var HideToolbar = this.dict.context.obj(hideToolbar);
        this.dict.set(PDFName_1.default.of('HideToolbar'), HideToolbar);
    };
    /**
     * Choose whether the PDF reader's menu bar should be hidden while the
     * document is active.
     * @param hideMenubar `true` if the menu bar should be hidden.
     */
    ViewerPreferences.prototype.setHideMenubar = function (hideMenubar) {
        var HideMenubar = this.dict.context.obj(hideMenubar);
        this.dict.set(PDFName_1.default.of('HideMenubar'), HideMenubar);
    };
    /**
     * Choose whether the PDF reader should hide user interface elements in the
     * document's window (such as scroll bars and navigation controls), leaving
     * only the document's contents displayed.
     * @param hideWindowUI `true` if the user interface elements should be hidden.
     */
    ViewerPreferences.prototype.setHideWindowUI = function (hideWindowUI) {
        var HideWindowUI = this.dict.context.obj(hideWindowUI);
        this.dict.set(PDFName_1.default.of('HideWindowUI'), HideWindowUI);
    };
    /**
     * Choose whether the PDF reader should resize the document's window to fit
     * the size of the first displayed page.
     * @param fitWindow `true` if the window should be resized.
     */
    ViewerPreferences.prototype.setFitWindow = function (fitWindow) {
        var FitWindow = this.dict.context.obj(fitWindow);
        this.dict.set(PDFName_1.default.of('FitWindow'), FitWindow);
    };
    /**
     * Choose whether the PDF reader should position the document's window in the
     * center of the screen.
     * @param centerWindow `true` if the window should be centered.
     */
    ViewerPreferences.prototype.setCenterWindow = function (centerWindow) {
        var CenterWindow = this.dict.context.obj(centerWindow);
        this.dict.set(PDFName_1.default.of('CenterWindow'), CenterWindow);
    };
    /**
     * Choose whether the window's title bar should display the document `Title`
     * taken from the document metadata (see [[PDFDocument.setTitle]]). If
     * `false`, the title bar should instead display the PDF filename.
     * @param displayTitle `true` if the document title should be displayed.
     */
    ViewerPreferences.prototype.setDisplayDocTitle = function (displayTitle) {
        var DisplayDocTitle = this.dict.context.obj(displayTitle);
        this.dict.set(PDFName_1.default.of('DisplayDocTitle'), DisplayDocTitle);
    };
    /**
     * Choose how the PDF reader should display the document upon exiting
     * full-screen mode. This entry is meaningful only if the value of the
     * `PageMode` entry in the document's [[PDFCatalog]] is `FullScreen`.
     *
     * For example:
     * ```js
     * import { PDFDocument, NonFullScreenPageMode, PDFName } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     *
     * // Set the PageMode
     * pdfDoc.catalog.set(PDFName.of('PageMode'),PDFName.of('FullScreen'))
     *
     * // Set what happens when full-screen is closed
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * viewerPrefs.setNonFullScreenPageMode(NonFullScreenPageMode.UseOutlines)
     * ```
     *
     * @param nonFullScreenPageMode How the document should be displayed upon
     *                              exiting full screen mode.
     */
    ViewerPreferences.prototype.setNonFullScreenPageMode = function (nonFullScreenPageMode) {
        utils_1.assertIsOneOf(nonFullScreenPageMode, 'nonFullScreenPageMode', NonFullScreenPageMode);
        var mode = PDFName_1.default.of(nonFullScreenPageMode);
        this.dict.set(PDFName_1.default.of('NonFullScreenPageMode'), mode);
    };
    /**
     * Choose the predominant reading order for text.
     *
     * This entry has no direct effect on the document's contents or page
     * numbering, but may be used to determine the relative positioning of pages
     * when displayed side by side or printed n-up.
     *
     * For example:
     * ```js
     * import { PDFDocument, ReadingDirection } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * viewerPrefs.setReadingDirection(ReadingDirection.R2L)
     * ```
     *
     * @param readingDirection The reading order for text.
     */
    ViewerPreferences.prototype.setReadingDirection = function (readingDirection) {
        utils_1.assertIsOneOf(readingDirection, 'readingDirection', ReadingDirection);
        var direction = PDFName_1.default.of(readingDirection);
        this.dict.set(PDFName_1.default.of('Direction'), direction);
    };
    /**
     * Choose the page scaling option that should be selected when a print dialog
     * is displayed for this document.
     *
     * For example:
     * ```js
     * import { PDFDocument, PrintScaling } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * viewerPrefs.setPrintScaling(PrintScaling.None)
     * ```
     *
     * @param printScaling The print scaling option.
     */
    ViewerPreferences.prototype.setPrintScaling = function (printScaling) {
        utils_1.assertIsOneOf(printScaling, 'printScaling', PrintScaling);
        var scaling = PDFName_1.default.of(printScaling);
        this.dict.set(PDFName_1.default.of('PrintScaling'), scaling);
    };
    /**
     * Choose the paper handling option that should be selected by default in the
     * print dialog.
     *
     * For example:
     * ```js
     * import { PDFDocument, Duplex } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     * viewerPrefs.setDuplex(Duplex.DuplexFlipShortEdge)
     * ```
     *
     * @param duplex The double or single sided printing option.
     */
    ViewerPreferences.prototype.setDuplex = function (duplex) {
        utils_1.assertIsOneOf(duplex, 'duplex', Duplex);
        var dup = PDFName_1.default.of(duplex);
        this.dict.set(PDFName_1.default.of('Duplex'), dup);
    };
    /**
     * Choose whether the PDF document's page size should be used to select the
     * input paper tray when printing. This setting influences only the preset
     * values used to populate the print dialog presented by a PDF reader.
     *
     * If PickTrayByPDFSize is true, the check box in the print dialog associated
     * with input paper tray should be checked. This setting has no effect on
     * operating systems that do not provide the ability to pick the input tray
     * by size.
     *
     * @param pickTrayByPDFSize `true` if the document's page size should be used
     *                          to select the input paper tray.
     */
    ViewerPreferences.prototype.setPickTrayByPDFSize = function (pickTrayByPDFSize) {
        var PickTrayByPDFSize = this.dict.context.obj(pickTrayByPDFSize);
        this.dict.set(PDFName_1.default.of('PickTrayByPDFSize'), PickTrayByPDFSize);
    };
    /**
     * Choose the page numbers used to initialize the print dialog box when the
     * file is printed. The first page of the PDF file is denoted by 0.
     *
     * For example:
     * ```js
     * import { PDFDocument } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     * const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences()
     *
     * // We can set the default print range to only the first page
     * viewerPrefs.setPrintPageRange({ start: 0, end: 0 })
     *
     * // Or we can supply noncontiguous ranges (e.g. pages 1, 3, and 5-7)
     * viewerPrefs.setPrintPageRange([
     *   { start: 0, end: 0 },
     *   { start: 2, end: 2 },
     *   { start: 4, end: 6 },
     * ])
     * ```
     *
     * @param printPageRange An object or array of objects, each with the
     *                       properties `start` and `end`, denoting a range of
     *                       page indices.
     */
    ViewerPreferences.prototype.setPrintPageRange = function (printPageRange) {
        if (!Array.isArray(printPageRange))
            printPageRange = [printPageRange];
        var flatRange = [];
        for (var idx = 0, len = printPageRange.length; idx < len; idx++) {
            flatRange.push(printPageRange[idx].start);
            flatRange.push(printPageRange[idx].end);
        }
        utils_1.assertEachIs(flatRange, 'printPageRange', ['number']);
        var pageRanges = this.dict.context.obj(flatRange);
        this.dict.set(PDFName_1.default.of('PrintPageRange'), pageRanges);
    };
    /**
     * Choose the default number of copies to be printed when the print dialog is
     * opened for this file.
     * @param numCopies The default number of copies.
     */
    ViewerPreferences.prototype.setNumCopies = function (numCopies) {
        utils_1.assertRange(numCopies, 'numCopies', 1, Number.MAX_VALUE);
        utils_1.assertInteger(numCopies, 'numCopies');
        var NumCopies = this.dict.context.obj(numCopies);
        this.dict.set(PDFName_1.default.of('NumCopies'), NumCopies);
    };
    /** @ignore */
    ViewerPreferences.fromDict = function (dict) {
        return new ViewerPreferences(dict);
    };
    /** @ignore */
    ViewerPreferences.create = function (context) {
        var dict = context.obj({});
        return new ViewerPreferences(dict);
    };
    return ViewerPreferences;
}());
exports.default = ViewerPreferences;
//# sourceMappingURL=ViewerPreferences.js.map