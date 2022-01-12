"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("./errors");
var PDFEmbeddedPage_1 = tslib_1.__importDefault(require("./PDFEmbeddedPage"));
var PDFFont_1 = tslib_1.__importDefault(require("./PDFFont"));
var PDFImage_1 = tslib_1.__importDefault(require("./PDFImage"));
var PDFPage_1 = tslib_1.__importDefault(require("./PDFPage"));
var PDFForm_1 = tslib_1.__importDefault(require("./form/PDFForm"));
var sizes_1 = require("./sizes");
var core_1 = require("../core");
var PDFDocumentOptions_1 = require("./PDFDocumentOptions");
var utils_1 = require("../utils");
var FileEmbedder_1 = tslib_1.__importStar(require("../core/embedders/FileEmbedder"));
var PDFEmbeddedFile_1 = tslib_1.__importDefault(require("./PDFEmbeddedFile"));
var PDFJavaScript_1 = tslib_1.__importDefault(require("./PDFJavaScript"));
var JavaScriptEmbedder_1 = tslib_1.__importDefault(require("../core/embedders/JavaScriptEmbedder"));
/**
 * Represents a PDF document.
 */
var PDFDocument = /** @class */ (function () {
    function PDFDocument(context, ignoreEncryption, updateMetadata) {
        var _this = this;
        /** The default word breaks used in PDFPage.drawText */
        this.defaultWordBreaks = [' '];
        this.computePages = function () {
            var pages = [];
            _this.catalog.Pages().traverse(function (node, ref) {
                if (node instanceof core_1.PDFPageLeaf) {
                    var page = _this.pageMap.get(node);
                    if (!page) {
                        page = PDFPage_1.default.of(node, ref, _this);
                        _this.pageMap.set(node, page);
                    }
                    pages.push(page);
                }
            });
            return pages;
        };
        this.getOrCreateForm = function () {
            var acroForm = _this.catalog.getOrCreateAcroForm();
            return PDFForm_1.default.of(acroForm, _this);
        };
        utils_1.assertIs(context, 'context', [[core_1.PDFContext, 'PDFContext']]);
        utils_1.assertIs(ignoreEncryption, 'ignoreEncryption', ['boolean']);
        this.context = context;
        this.catalog = context.lookup(context.trailerInfo.Root);
        this.isEncrypted = !!context.lookup(context.trailerInfo.Encrypt);
        this.pageCache = utils_1.Cache.populatedBy(this.computePages);
        this.pageMap = new Map();
        this.formCache = utils_1.Cache.populatedBy(this.getOrCreateForm);
        this.fonts = [];
        this.images = [];
        this.embeddedPages = [];
        this.embeddedFiles = [];
        this.javaScripts = [];
        if (!ignoreEncryption && this.isEncrypted)
            throw new errors_1.EncryptedPDFError();
        if (updateMetadata)
            this.updateInfoDict();
    }
    /**
     * Load an existing [[PDFDocument]]. The input data can be provided in
     * multiple formats:
     *
     * | Type          | Contents                                               |
     * | ------------- | ------------------------------------------------------ |
     * | `string`      | A base64 encoded string (or data URI) containing a PDF |
     * | `Uint8Array`  | The raw bytes of a PDF                                 |
     * | `ArrayBuffer` | The raw bytes of a PDF                                 |
     *
     * For example:
     * ```js
     * import { PDFDocument } from 'pdf-lib'
     *
     * // pdf=string
     * const base64 =
     *  'JVBERi0xLjcKJYGBgYEKCjUgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL0xlbm' +
     *  'd0aCAxMDQKPj4Kc3RyZWFtCniccwrhMlAAwaJ0Ln2P1Jyy1JLM5ERdc0MjCwUjE4WQNC4Q' +
     *  '6cNlCFZkqGCqYGSqEJLLZWNuYGZiZmbkYuZsZmlmZGRgZmluDCQNzc3NTM2NzdzMXMxMjQ' +
     *  'ztFEKyuEK0uFxDuAAOERdVCmVuZHN0cmVhbQplbmRvYmoKCjYgMCBvYmoKPDwKL0ZpbHRl' +
     *  'ciAvRmxhdGVEZWNvZGUKL1R5cGUgL09ialN0bQovTiA0Ci9GaXJzdCAyMAovTGVuZ3RoID' +
     *  'IxNQo+PgpzdHJlYW0KeJxVj9GqwjAMhu/zFHkBzTo3nCCCiiKIHPEICuJF3cKoSCu2E8/b' +
     *  '20wPIr1p8v9/8kVhgilmGfawX2CGaVrgcAi0/bsy0lrX7IGWpvJ4iJYEN3gEmrrGBlQwGs' +
     *  'HHO9VBX1wNrxAqMX87RBD5xpJuddqwd82tjAHxzV1U5LPgy52DKXWnr1Lheg+j/c/pzGVr' +
     *  'iqV0VlwZPXGPCJjElw/ybkwUmeoWgxesDXGhHJC/D/iikp1Av80ptKU0FdBEe25pPihAM1' +
     *  'u6ytgaaWfs2Hrz35CJT1+EWmAKZW5kc3RyZWFtCmVuZG9iagoKNyAwIG9iago8PAovU2l6' +
     *  'ZSA4Ci9Sb290IDIgMCBSCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9UeXBlIC9YUmVmCi9MZW' +
     *  '5ndGggMzgKL1cgWyAxIDIgMiBdCi9JbmRleCBbIDAgOCBdCj4+CnN0cmVhbQp4nBXEwREA' +
     *  'EBAEsCwz3vrvRmOOyyOoGhZdutHN2MT55fIAVocD+AplbmRzdHJlYW0KZW5kb2JqCgpzdG' +
     *  'FydHhyZWYKNTEwCiUlRU9G'
     *
     * const dataUri = 'data:application/pdf;base64,' + base64
     *
     * const pdfDoc1 = await PDFDocument.load(base64)
     * const pdfDoc2 = await PDFDocument.load(dataUri)
     *
     * // pdf=Uint8Array
     * import fs from 'fs'
     * const uint8Array = fs.readFileSync('with_update_sections.pdf')
     * const pdfDoc3 = await PDFDocument.load(uint8Array)
     *
     * // pdf=ArrayBuffer
     * const url = 'https://pdf-lib.js.org/assets/with_update_sections.pdf'
     * const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
     * const pdfDoc4 = await PDFDocument.load(arrayBuffer)
     *
     * ```
     *
     * @param pdf The input data containing a PDF document.
     * @param options The options to be used when loading the document.
     * @returns Resolves with a document loaded from the input.
     */
    PDFDocument.load = function (pdf, options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, ignoreEncryption, _b, parseSpeed, _c, throwOnInvalidObject, _d, updateMetadata, _e, capNumbers, bytes, context;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = options.ignoreEncryption, ignoreEncryption = _a === void 0 ? false : _a, _b = options.parseSpeed, parseSpeed = _b === void 0 ? PDFDocumentOptions_1.ParseSpeeds.Slow : _b, _c = options.throwOnInvalidObject, throwOnInvalidObject = _c === void 0 ? false : _c, _d = options.updateMetadata, updateMetadata = _d === void 0 ? true : _d, _e = options.capNumbers, capNumbers = _e === void 0 ? false : _e;
                        utils_1.assertIs(pdf, 'pdf', ['string', Uint8Array, ArrayBuffer]);
                        utils_1.assertIs(ignoreEncryption, 'ignoreEncryption', ['boolean']);
                        utils_1.assertIs(parseSpeed, 'parseSpeed', ['number']);
                        utils_1.assertIs(throwOnInvalidObject, 'throwOnInvalidObject', ['boolean']);
                        bytes = utils_1.toUint8Array(pdf);
                        return [4 /*yield*/, core_1.PDFParser.forBytesWithOptions(bytes, parseSpeed, throwOnInvalidObject, capNumbers).parseDocument()];
                    case 1:
                        context = _f.sent();
                        return [2 /*return*/, new PDFDocument(context, ignoreEncryption, updateMetadata)];
                }
            });
        });
    };
    /**
     * Create a new [[PDFDocument]].
     * @returns Resolves with the newly created document.
     */
    PDFDocument.create = function (options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, updateMetadata, context, pageTree, pageTreeRef, catalog;
            return tslib_1.__generator(this, function (_b) {
                _a = options.updateMetadata, updateMetadata = _a === void 0 ? true : _a;
                context = core_1.PDFContext.create();
                pageTree = core_1.PDFPageTree.withContext(context);
                pageTreeRef = context.register(pageTree);
                catalog = core_1.PDFCatalog.withContextAndPages(context, pageTreeRef);
                context.trailerInfo.Root = context.register(catalog);
                return [2 /*return*/, new PDFDocument(context, false, updateMetadata)];
            });
        });
    };
    /**
     * Register a fontkit instance. This must be done before custom fonts can
     * be embedded. See [here](https://github.com/Hopding/pdf-lib/tree/master#fontkit-installation)
     * for instructions on how to install and register a fontkit instance.
     *
     * > You do **not** need to call this method to embed standard fonts.
     *
     * For example:
     * ```js
     * import { PDFDocument } from 'pdf-lib'
     * import fontkit from '@pdf-lib/fontkit'
     *
     * const pdfDoc = await PDFDocument.create()
     * pdfDoc.registerFontkit(fontkit)
     * ```
     *
     * @param fontkit The fontkit instance to be registered.
     */
    PDFDocument.prototype.registerFontkit = function (fontkit) {
        this.fontkit = fontkit;
    };
    /**
     * Get the [[PDFForm]] containing all interactive fields for this document.
     * For example:
     * ```js
     * const form = pdfDoc.getForm()
     * const fields = form.getFields()
     * fields.forEach(field => {
     *   const type = field.constructor.name
     *   const name = field.getName()
     *   console.log(`${type}: ${name}`)
     * })
     * ```
     * @returns The form for this document.
     */
    PDFDocument.prototype.getForm = function () {
        var form = this.formCache.access();
        if (form.hasXFA()) {
            console.warn('Removing XFA form data as pdf-lib does not support reading or writing XFA');
            form.deleteXFA();
        }
        return form;
    };
    /**
     * Get this document's title metadata. The title appears in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * const title = pdfDoc.getTitle()
     * ```
     * @returns A string containing the title of this document, if it has one.
     */
    PDFDocument.prototype.getTitle = function () {
        var title = this.getInfoDict().lookup(core_1.PDFName.Title);
        if (!title)
            return undefined;
        assertIsLiteralOrHexString(title);
        return title.decodeText();
    };
    /**
     * Get this document's author metadata. The author appears in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * const author = pdfDoc.getAuthor()
     * ```
     * @returns A string containing the author of this document, if it has one.
     */
    PDFDocument.prototype.getAuthor = function () {
        var author = this.getInfoDict().lookup(core_1.PDFName.Author);
        if (!author)
            return undefined;
        assertIsLiteralOrHexString(author);
        return author.decodeText();
    };
    /**
     * Get this document's subject metadata. The subject appears in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * const subject = pdfDoc.getSubject()
     * ```
     * @returns A string containing the subject of this document, if it has one.
     */
    PDFDocument.prototype.getSubject = function () {
        var subject = this.getInfoDict().lookup(core_1.PDFName.Subject);
        if (!subject)
            return undefined;
        assertIsLiteralOrHexString(subject);
        return subject.decodeText();
    };
    /**
     * Get this document's keywords metadata. The keywords appear in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * const keywords = pdfDoc.getKeywords()
     * ```
     * @returns A string containing the keywords of this document, if it has any.
     */
    PDFDocument.prototype.getKeywords = function () {
        var keywords = this.getInfoDict().lookup(core_1.PDFName.Keywords);
        if (!keywords)
            return undefined;
        assertIsLiteralOrHexString(keywords);
        return keywords.decodeText();
    };
    /**
     * Get this document's creator metadata. The creator appears in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * const creator = pdfDoc.getCreator()
     * ```
     * @returns A string containing the creator of this document, if it has one.
     */
    PDFDocument.prototype.getCreator = function () {
        var creator = this.getInfoDict().lookup(core_1.PDFName.Creator);
        if (!creator)
            return undefined;
        assertIsLiteralOrHexString(creator);
        return creator.decodeText();
    };
    /**
     * Get this document's producer metadata. The producer appears in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * const producer = pdfDoc.getProducer()
     * ```
     * @returns A string containing the producer of this document, if it has one.
     */
    PDFDocument.prototype.getProducer = function () {
        var producer = this.getInfoDict().lookup(core_1.PDFName.Producer);
        if (!producer)
            return undefined;
        assertIsLiteralOrHexString(producer);
        return producer.decodeText();
    };
    /**
     * Get this document's creation date metadata. The creation date appears in
     * the "Document Properties" section of most PDF readers. For example:
     * ```js
     * const creationDate = pdfDoc.getCreationDate()
     * ```
     * @returns A Date containing the creation date of this document,
     *          if it has one.
     */
    PDFDocument.prototype.getCreationDate = function () {
        var creationDate = this.getInfoDict().lookup(core_1.PDFName.CreationDate);
        if (!creationDate)
            return undefined;
        assertIsLiteralOrHexString(creationDate);
        return creationDate.decodeDate();
    };
    /**
     * Get this document's modification date metadata. The modification date
     * appears in the "Document Properties" section of most PDF readers.
     * For example:
     * ```js
     * const modification = pdfDoc.getModificationDate()
     * ```
     * @returns A Date containing the modification date of this document,
     *          if it has one.
     */
    PDFDocument.prototype.getModificationDate = function () {
        var modificationDate = this.getInfoDict().lookup(core_1.PDFName.ModDate);
        if (!modificationDate)
            return undefined;
        assertIsLiteralOrHexString(modificationDate);
        return modificationDate.decodeDate();
    };
    /**
     * Set this document's title metadata. The title will appear in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * pdfDoc.setTitle('🥚 The Life of an Egg 🍳')
     * ```
     *
     * To display the title in the window's title bar, set the
     * `showInWindowTitleBar` option to `true` (works for _most_ PDF readers).
     * For example:
     * ```js
     * pdfDoc.setTitle('🥚 The Life of an Egg 🍳', { showInWindowTitleBar: true })
     * ```
     *
     * @param title The title of this document.
     * @param options The options to be used when setting the title.
     */
    PDFDocument.prototype.setTitle = function (title, options) {
        utils_1.assertIs(title, 'title', ['string']);
        var key = core_1.PDFName.of('Title');
        this.getInfoDict().set(key, core_1.PDFHexString.fromText(title));
        // Indicate that readers should display the title rather than the filename
        if (options === null || options === void 0 ? void 0 : options.showInWindowTitleBar) {
            var prefs = this.catalog.getOrCreateViewerPreferences();
            prefs.setDisplayDocTitle(true);
        }
    };
    /**
     * Set this document's author metadata. The author will appear in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * pdfDoc.setAuthor('Humpty Dumpty')
     * ```
     * @param author The author of this document.
     */
    PDFDocument.prototype.setAuthor = function (author) {
        utils_1.assertIs(author, 'author', ['string']);
        var key = core_1.PDFName.of('Author');
        this.getInfoDict().set(key, core_1.PDFHexString.fromText(author));
    };
    /**
     * Set this document's subject metadata. The subject will appear in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * pdfDoc.setSubject('📘 An Epic Tale of Woe 📖')
     * ```
     * @param subject The subject of this document.
     */
    PDFDocument.prototype.setSubject = function (subject) {
        utils_1.assertIs(subject, 'author', ['string']);
        var key = core_1.PDFName.of('Subject');
        this.getInfoDict().set(key, core_1.PDFHexString.fromText(subject));
    };
    /**
     * Set this document's keyword metadata. These keywords will appear in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * pdfDoc.setKeywords(['eggs', 'wall', 'fall', 'king', 'horses', 'men'])
     * ```
     * @param keywords An array of keywords associated with this document.
     */
    PDFDocument.prototype.setKeywords = function (keywords) {
        utils_1.assertIs(keywords, 'keywords', [Array]);
        var key = core_1.PDFName.of('Keywords');
        this.getInfoDict().set(key, core_1.PDFHexString.fromText(keywords.join(' ')));
    };
    /**
     * Set this document's creator metadata. The creator will appear in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * pdfDoc.setCreator('PDF App 9000 🤖')
     * ```
     * @param creator The creator of this document.
     */
    PDFDocument.prototype.setCreator = function (creator) {
        utils_1.assertIs(creator, 'creator', ['string']);
        var key = core_1.PDFName.of('Creator');
        this.getInfoDict().set(key, core_1.PDFHexString.fromText(creator));
    };
    /**
     * Set this document's producer metadata. The producer will appear in the
     * "Document Properties" section of most PDF readers. For example:
     * ```js
     * pdfDoc.setProducer('PDF App 9000 🤖')
     * ```
     * @param producer The producer of this document.
     */
    PDFDocument.prototype.setProducer = function (producer) {
        utils_1.assertIs(producer, 'creator', ['string']);
        var key = core_1.PDFName.of('Producer');
        this.getInfoDict().set(key, core_1.PDFHexString.fromText(producer));
    };
    /**
     * Set this document's language metadata. The language will appear in the
     * "Document Properties" section of some PDF readers. For example:
     * ```js
     * pdfDoc.setLanguage('en-us')
     * ```
     *
     * @param language An RFC 3066 _Language-Tag_ denoting the language of this
     *                 document, or an empty string if the language is unknown.
     */
    PDFDocument.prototype.setLanguage = function (language) {
        utils_1.assertIs(language, 'language', ['string']);
        var key = core_1.PDFName.of('Lang');
        this.catalog.set(key, core_1.PDFString.of(language));
    };
    /**
     * Set this document's creation date metadata. The creation date will appear
     * in the "Document Properties" section of most PDF readers. For example:
     * ```js
     * pdfDoc.setCreationDate(new Date())
     * ```
     * @param creationDate The date this document was created.
     */
    PDFDocument.prototype.setCreationDate = function (creationDate) {
        utils_1.assertIs(creationDate, 'creationDate', [[Date, 'Date']]);
        var key = core_1.PDFName.of('CreationDate');
        this.getInfoDict().set(key, core_1.PDFString.fromDate(creationDate));
    };
    /**
     * Set this document's modification date metadata. The modification date will
     * appear in the "Document Properties" section of most PDF readers. For
     * example:
     * ```js
     * pdfDoc.setModificationDate(new Date())
     * ```
     * @param modificationDate The date this document was last modified.
     */
    PDFDocument.prototype.setModificationDate = function (modificationDate) {
        utils_1.assertIs(modificationDate, 'modificationDate', [[Date, 'Date']]);
        var key = core_1.PDFName.of('ModDate');
        this.getInfoDict().set(key, core_1.PDFString.fromDate(modificationDate));
    };
    /**
     * Get the number of pages contained in this document. For example:
     * ```js
     * const totalPages = pdfDoc.getPageCount()
     * ```
     * @returns The number of pages in this document.
     */
    PDFDocument.prototype.getPageCount = function () {
        if (this.pageCount === undefined)
            this.pageCount = this.getPages().length;
        return this.pageCount;
    };
    /**
     * Get an array of all the pages contained in this document. The pages are
     * stored in the array in the same order that they are rendered in the
     * document. For example:
     * ```js
     * const pages = pdfDoc.getPages()
     * pages[0]   // The first page of the document
     * pages[2]   // The third page of the document
     * pages[197] // The 198th page of the document
     * ```
     * @returns An array of all the pages contained in this document.
     */
    PDFDocument.prototype.getPages = function () {
        return this.pageCache.access();
    };
    /**
     * Get the page rendered at a particular `index` of the document. For example:
     * ```js
     * pdfDoc.getPage(0)   // The first page of the document
     * pdfDoc.getPage(2)   // The third page of the document
     * pdfDoc.getPage(197) // The 198th page of the document
     * ```
     * @returns The [[PDFPage]] rendered at the given `index` of the document.
     */
    PDFDocument.prototype.getPage = function (index) {
        var pages = this.getPages();
        utils_1.assertRange(index, 'index', 0, pages.length - 1);
        return pages[index];
    };
    /**
     * Get an array of indices for all the pages contained in this document. The
     * array will contain a range of integers from
     * `0..pdfDoc.getPageCount() - 1`. For example:
     * ```js
     * const pdfDoc = await PDFDocument.create()
     * pdfDoc.addPage()
     * pdfDoc.addPage()
     * pdfDoc.addPage()
     *
     * const indices = pdfDoc.getPageIndices()
     * indices // => [0, 1, 2]
     * ```
     * @returns An array of indices for all pages contained in this document.
     */
    PDFDocument.prototype.getPageIndices = function () {
        return utils_1.range(0, this.getPageCount());
    };
    /**
     * Remove the page at a given index from this document. For example:
     * ```js
     * pdfDoc.removePage(0)   // Remove the first page of the document
     * pdfDoc.removePage(2)   // Remove the third page of the document
     * pdfDoc.removePage(197) // Remove the 198th page of the document
     * ```
     * Once a page has been removed, it will no longer be rendered at that index
     * in the document.
     * @param index The index of the page to be removed.
     */
    PDFDocument.prototype.removePage = function (index) {
        var pageCount = this.getPageCount();
        if (this.pageCount === 0)
            throw new errors_1.RemovePageFromEmptyDocumentError();
        utils_1.assertRange(index, 'index', 0, pageCount - 1);
        this.catalog.removeLeafNode(index);
        this.pageCount = pageCount - 1;
    };
    /**
     * Add a page to the end of this document. This method accepts three
     * different value types for the `page` parameter:
     *
     * | Type               | Behavior                                                                            |
     * | ------------------ | ----------------------------------------------------------------------------------- |
     * | `undefined`        | Create a new page and add it to the end of this document                            |
     * | `[number, number]` | Create a new page with the given dimensions and add it to the end of this document  |
     * | `PDFPage`          | Add the existing page to the end of this document                                   |
     *
     * For example:
     * ```js
     * // page=undefined
     * const newPage = pdfDoc.addPage()
     *
     * // page=[number, number]
     * import { PageSizes } from 'pdf-lib'
     * const newPage1 = pdfDoc.addPage(PageSizes.A7)
     * const newPage2 = pdfDoc.addPage(PageSizes.Letter)
     * const newPage3 = pdfDoc.addPage([500, 750])
     *
     * // page=PDFPage
     * const pdfDoc1 = await PDFDocument.create()
     * const pdfDoc2 = await PDFDocument.load(...)
     * const [existingPage] = await pdfDoc1.copyPages(pdfDoc2, [0])
     * pdfDoc1.addPage(existingPage)
     * ```
     *
     * @param page Optionally, the desired dimensions or existing page.
     * @returns The newly created (or existing) page.
     */
    PDFDocument.prototype.addPage = function (page) {
        utils_1.assertIs(page, 'page', ['undefined', [PDFPage_1.default, 'PDFPage'], Array]);
        return this.insertPage(this.getPageCount(), page);
    };
    /**
     * Insert a page at a given index within this document. This method accepts
     * three different value types for the `page` parameter:
     *
     * | Type               | Behavior                                                                       |
     * | ------------------ | ------------------------------------------------------------------------------ |
     * | `undefined`        | Create a new page and insert it into this document                             |
     * | `[number, number]` | Create a new page with the given dimensions and insert it into this document   |
     * | `PDFPage`          | Insert the existing page into this document                                    |
     *
     * For example:
     * ```js
     * // page=undefined
     * const newPage = pdfDoc.insertPage(2)
     *
     * // page=[number, number]
     * import { PageSizes } from 'pdf-lib'
     * const newPage1 = pdfDoc.insertPage(2, PageSizes.A7)
     * const newPage2 = pdfDoc.insertPage(0, PageSizes.Letter)
     * const newPage3 = pdfDoc.insertPage(198, [500, 750])
     *
     * // page=PDFPage
     * const pdfDoc1 = await PDFDocument.create()
     * const pdfDoc2 = await PDFDocument.load(...)
     * const [existingPage] = await pdfDoc1.copyPages(pdfDoc2, [0])
     * pdfDoc1.insertPage(0, existingPage)
     * ```
     *
     * @param index The index at which the page should be inserted (zero-based).
     * @param page Optionally, the desired dimensions or existing page.
     * @returns The newly created (or existing) page.
     */
    PDFDocument.prototype.insertPage = function (index, page) {
        var pageCount = this.getPageCount();
        utils_1.assertRange(index, 'index', 0, pageCount);
        utils_1.assertIs(page, 'page', ['undefined', [PDFPage_1.default, 'PDFPage'], Array]);
        if (!page || Array.isArray(page)) {
            var dims = Array.isArray(page) ? page : sizes_1.PageSizes.A4;
            page = PDFPage_1.default.create(this);
            page.setSize.apply(page, dims);
        }
        else if (page.doc !== this) {
            throw new errors_1.ForeignPageError();
        }
        var parentRef = this.catalog.insertLeafNode(page.ref, index);
        page.node.setParent(parentRef);
        this.pageMap.set(page.node, page);
        this.pageCache.invalidate();
        this.pageCount = pageCount + 1;
        return page;
    };
    /**
     * Copy pages from a source document into this document. Allows pages to be
     * copied between different [[PDFDocument]] instances. For example:
     * ```js
     * const pdfDoc = await PDFDocument.create()
     * const srcDoc = await PDFDocument.load(...)
     *
     * const copiedPages = await pdfDoc.copyPages(srcDoc, [0, 3, 89])
     * const [firstPage, fourthPage, ninetiethPage] = copiedPages;
     *
     * pdfDoc.addPage(fourthPage)
     * pdfDoc.insertPage(0, ninetiethPage)
     * pdfDoc.addPage(firstPage)
     * ```
     * @param srcDoc The document from which pages should be copied.
     * @param indices The indices of the pages that should be copied.
     * @returns Resolves with an array of pages copied into this document.
     */
    PDFDocument.prototype.copyPages = function (srcDoc, indices) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var copier, srcPages, copiedPages, idx, len, srcPage, copiedPage, ref;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        utils_1.assertIs(srcDoc, 'srcDoc', [[PDFDocument, 'PDFDocument']]);
                        utils_1.assertIs(indices, 'indices', [Array]);
                        return [4 /*yield*/, srcDoc.flush()];
                    case 1:
                        _a.sent();
                        copier = core_1.PDFObjectCopier.for(srcDoc.context, this.context);
                        srcPages = srcDoc.getPages();
                        copiedPages = new Array(indices.length);
                        for (idx = 0, len = indices.length; idx < len; idx++) {
                            srcPage = srcPages[indices[idx]];
                            copiedPage = copier.copy(srcPage.node);
                            ref = this.context.register(copiedPage);
                            copiedPages[idx] = PDFPage_1.default.of(copiedPage, ref, this);
                        }
                        return [2 /*return*/, copiedPages];
                }
            });
        });
    };
    /**
     * Get a copy of this document.
     *
     * For example:
     * ```js
     * const srcDoc = await PDFDocument.load(...)
     * const pdfDoc = await srcDoc.copy()
     * ```
     *
     * > **NOTE:**  This method won't copy all information over to the new
     * > document (acroforms, outlines, etc...).
     *
     * @returns Resolves with a copy this document.
     */
    PDFDocument.prototype.copy = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var pdfCopy, contentPages, idx, len;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PDFDocument.create()];
                    case 1:
                        pdfCopy = _a.sent();
                        return [4 /*yield*/, pdfCopy.copyPages(this, this.getPageIndices())];
                    case 2:
                        contentPages = _a.sent();
                        for (idx = 0, len = contentPages.length; idx < len; idx++) {
                            pdfCopy.addPage(contentPages[idx]);
                        }
                        if (this.getAuthor() !== undefined) {
                            pdfCopy.setAuthor(this.getAuthor());
                        }
                        if (this.getCreationDate() !== undefined) {
                            pdfCopy.setCreationDate(this.getCreationDate());
                        }
                        if (this.getCreator() !== undefined) {
                            pdfCopy.setCreator(this.getCreator());
                        }
                        if (this.getModificationDate() !== undefined) {
                            pdfCopy.setModificationDate(this.getModificationDate());
                        }
                        if (this.getProducer() !== undefined) {
                            pdfCopy.setProducer(this.getProducer());
                        }
                        if (this.getSubject() !== undefined) {
                            pdfCopy.setSubject(this.getSubject());
                        }
                        if (this.getTitle() !== undefined) {
                            pdfCopy.setTitle(this.getTitle());
                        }
                        pdfCopy.defaultWordBreaks = this.defaultWordBreaks;
                        return [2 /*return*/, pdfCopy];
                }
            });
        });
    };
    /**
     * Add JavaScript to this document. The supplied `script` is executed when the
     * document is opened. The `script` can be used to perform some operation
     * when the document is opened (e.g. logging to the console), or it can be
     * used to define a function that can be referenced later in a JavaScript
     * action. For example:
     * ```js
     * // Show "Hello World!" in the console when the PDF is opened
     * pdfDoc.addJavaScript(
     *   'main',
     *   'console.show(); console.println("Hello World!");'
     * );
     *
     * // Define a function named "foo" that can be called in JavaScript Actions
     * pdfDoc.addJavaScript(
     *   'foo',
     *   'function foo() { return "foo"; }'
     * );
     * ```
     * See the [JavaScript for Acrobat API Reference](https://www.adobe.com/content/dam/acom/en/devnet/acrobat/pdfs/js_api_reference.pdf)
     * for details.
     * @param name The name of the script. Must be unique per document.
     * @param script The JavaScript to execute.
     */
    PDFDocument.prototype.addJavaScript = function (name, script) {
        utils_1.assertIs(name, 'name', ['string']);
        utils_1.assertIs(script, 'script', ['string']);
        var embedder = JavaScriptEmbedder_1.default.for(script, name);
        var ref = this.context.nextRef();
        var javaScript = PDFJavaScript_1.default.of(ref, this, embedder);
        this.javaScripts.push(javaScript);
    };
    /**
     * Add an attachment to this document. Attachments are visible in the
     * "Attachments" panel of Adobe Acrobat and some other PDF readers. Any
     * type of file can be added as an attachment. This includes, but is not
     * limited to, `.png`, `.jpg`, `.pdf`, `.csv`, `.docx`, and `.xlsx` files.
     *
     * The input data can be provided in multiple formats:
     *
     * | Type          | Contents                                                       |
     * | ------------- | -------------------------------------------------------------- |
     * | `string`      | A base64 encoded string (or data URI) containing an attachment |
     * | `Uint8Array`  | The raw bytes of an attachment                                 |
     * | `ArrayBuffer` | The raw bytes of an attachment                                 |
     *
     * For example:
     * ```js
     * // attachment=string
     * await pdfDoc.attach('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...', 'cat_riding_unicorn.jpg', {
     *   mimeType: 'image/jpeg',
     *   description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
     *   creationDate: new Date('2019/12/01'),
     *   modificationDate: new Date('2020/04/19'),
     * })
     * await pdfDoc.attach('data:image/jpeg;base64,/9j/4AAQ...', 'cat_riding_unicorn.jpg', {
     *   mimeType: 'image/jpeg',
     *   description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
     *   creationDate: new Date('2019/12/01'),
     *   modificationDate: new Date('2020/04/19'),
     * })
     *
     * // attachment=Uint8Array
     * import fs from 'fs'
     * const uint8Array = fs.readFileSync('cat_riding_unicorn.jpg')
     * await pdfDoc.attach(uint8Array, 'cat_riding_unicorn.jpg', {
     *   mimeType: 'image/jpeg',
     *   description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
     *   creationDate: new Date('2019/12/01'),
     *   modificationDate: new Date('2020/04/19'),
     * })
     *
     * // attachment=ArrayBuffer
     * const url = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
     * const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
     * await pdfDoc.attach(arrayBuffer, 'cat_riding_unicorn.jpg', {
     *   mimeType: 'image/jpeg',
     *   description: 'Cool cat riding a unicorn! 🦄🐈🕶️',
     *   creationDate: new Date('2019/12/01'),
     *   modificationDate: new Date('2020/04/19'),
     * })
     * ```
     *
     * @param attachment The input data containing the file to be attached.
     * @param name The name of the file to be attached.
     * @returns Resolves when the attachment is complete.
     */
    PDFDocument.prototype.attach = function (attachment, name, options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var bytes, embedder, ref, embeddedFile;
            return tslib_1.__generator(this, function (_a) {
                utils_1.assertIs(attachment, 'attachment', ['string', Uint8Array, ArrayBuffer]);
                utils_1.assertIs(name, 'name', ['string']);
                utils_1.assertOrUndefined(options.mimeType, 'mimeType', ['string']);
                utils_1.assertOrUndefined(options.description, 'description', ['string']);
                utils_1.assertOrUndefined(options.creationDate, 'options.creationDate', [Date]);
                utils_1.assertOrUndefined(options.modificationDate, 'options.modificationDate', [
                    Date,
                ]);
                utils_1.assertIsOneOfOrUndefined(options.afRelationship, 'options.afRelationship', FileEmbedder_1.AFRelationship);
                bytes = utils_1.toUint8Array(attachment);
                embedder = FileEmbedder_1.default.for(bytes, name, options);
                ref = this.context.nextRef();
                embeddedFile = PDFEmbeddedFile_1.default.of(ref, this, embedder);
                this.embeddedFiles.push(embeddedFile);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Embed a font into this document. The input data can be provided in multiple
     * formats:
     *
     * | Type            | Contents                                                |
     * | --------------- | ------------------------------------------------------- |
     * | `StandardFonts` | One of the standard 14 fonts                            |
     * | `string`        | A base64 encoded string (or data URI) containing a font |
     * | `Uint8Array`    | The raw bytes of a font                                 |
     * | `ArrayBuffer`   | The raw bytes of a font                                 |
     *
     * For example:
     * ```js
     * // font=StandardFonts
     * import { StandardFonts } from 'pdf-lib'
     * const font1 = await pdfDoc.embedFont(StandardFonts.Helvetica)
     *
     * // font=string
     * const font2 = await pdfDoc.embedFont('AAEAAAAVAQAABABQRFNJRx/upe...')
     * const font3 = await pdfDoc.embedFont('data:font/opentype;base64,AAEAAA...')
     *
     * // font=Uint8Array
     * import fs from 'fs'
     * const font4 = await pdfDoc.embedFont(fs.readFileSync('Ubuntu-R.ttf'))
     *
     * // font=ArrayBuffer
     * const url = 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf'
     * const ubuntuBytes = await fetch(url).then(res => res.arrayBuffer())
     * const font5 = await pdfDoc.embedFont(ubuntuBytes)
     * ```
     * See also: [[registerFontkit]]
     * @param font The input data for a font.
     * @param options The options to be used when embedding the font.
     * @returns Resolves with the embedded font.
     */
    PDFDocument.prototype.embedFont = function (font, options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, subset, customName, features, embedder, bytes, fontkit, _b, ref, pdfFont;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.subset, subset = _a === void 0 ? false : _a, customName = options.customName, features = options.features;
                        utils_1.assertIs(font, 'font', ['string', Uint8Array, ArrayBuffer]);
                        utils_1.assertIs(subset, 'subset', ['boolean']);
                        if (!utils_1.isStandardFont(font)) return [3 /*break*/, 1];
                        embedder = core_1.StandardFontEmbedder.for(font, customName);
                        return [3 /*break*/, 7];
                    case 1:
                        if (!utils_1.canBeConvertedToUint8Array(font)) return [3 /*break*/, 6];
                        bytes = utils_1.toUint8Array(font);
                        fontkit = this.assertFontkit();
                        if (!subset) return [3 /*break*/, 3];
                        return [4 /*yield*/, core_1.CustomFontSubsetEmbedder.for(fontkit, bytes, customName, features)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, core_1.CustomFontEmbedder.for(fontkit, bytes, customName, features)];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        embedder = _b;
                        return [3 /*break*/, 7];
                    case 6: throw new TypeError('`font` must be one of `StandardFonts | string | Uint8Array | ArrayBuffer`');
                    case 7:
                        ref = this.context.nextRef();
                        pdfFont = PDFFont_1.default.of(ref, this, embedder);
                        this.fonts.push(pdfFont);
                        return [2 /*return*/, pdfFont];
                }
            });
        });
    };
    /**
     * Embed a standard font into this document.
     * For example:
     * ```js
     * import { StandardFonts } from 'pdf-lib'
     * const helveticaFont = pdfDoc.embedFont(StandardFonts.Helvetica)
     * ```
     * @param font The standard font to be embedded.
     * @param customName The name to be used when embedding the font.
     * @returns The embedded font.
     */
    PDFDocument.prototype.embedStandardFont = function (font, customName) {
        utils_1.assertIs(font, 'font', ['string']);
        if (!utils_1.isStandardFont(font)) {
            throw new TypeError('`font` must be one of type `StandardFonts`');
        }
        var embedder = core_1.StandardFontEmbedder.for(font, customName);
        var ref = this.context.nextRef();
        var pdfFont = PDFFont_1.default.of(ref, this, embedder);
        this.fonts.push(pdfFont);
        return pdfFont;
    };
    /**
     * Embed a JPEG image into this document. The input data can be provided in
     * multiple formats:
     *
     * | Type          | Contents                                                      |
     * | ------------- | ------------------------------------------------------------- |
     * | `string`      | A base64 encoded string (or data URI) containing a JPEG image |
     * | `Uint8Array`  | The raw bytes of a JPEG image                                 |
     * | `ArrayBuffer` | The raw bytes of a JPEG image                                 |
     *
     * For example:
     * ```js
     * // jpg=string
     * const image1 = await pdfDoc.embedJpg('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...')
     * const image2 = await pdfDoc.embedJpg('data:image/jpeg;base64,/9j/4AAQ...')
     *
     * // jpg=Uint8Array
     * import fs from 'fs'
     * const uint8Array = fs.readFileSync('cat_riding_unicorn.jpg')
     * const image3 = await pdfDoc.embedJpg(uint8Array)
     *
     * // jpg=ArrayBuffer
     * const url = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
     * const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
     * const image4 = await pdfDoc.embedJpg(arrayBuffer)
     * ```
     *
     * @param jpg The input data for a JPEG image.
     * @returns Resolves with the embedded image.
     */
    PDFDocument.prototype.embedJpg = function (jpg) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var bytes, embedder, ref, pdfImage;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        utils_1.assertIs(jpg, 'jpg', ['string', Uint8Array, ArrayBuffer]);
                        bytes = utils_1.toUint8Array(jpg);
                        return [4 /*yield*/, core_1.JpegEmbedder.for(bytes)];
                    case 1:
                        embedder = _a.sent();
                        ref = this.context.nextRef();
                        pdfImage = PDFImage_1.default.of(ref, this, embedder);
                        this.images.push(pdfImage);
                        return [2 /*return*/, pdfImage];
                }
            });
        });
    };
    /**
     * Embed a PNG image into this document. The input data can be provided in
     * multiple formats:
     *
     * | Type          | Contents                                                     |
     * | ------------- | ------------------------------------------------------------ |
     * | `string`      | A base64 encoded string (or data URI) containing a PNG image |
     * | `Uint8Array`  | The raw bytes of a PNG image                                 |
     * | `ArrayBuffer` | The raw bytes of a PNG image                                 |
     *
     * For example:
     * ```js
     * // png=string
     * const image1 = await pdfDoc.embedPng('iVBORw0KGgoAAAANSUhEUgAAAlgAAAF3...')
     * const image2 = await pdfDoc.embedPng('data:image/png;base64,iVBORw0KGg...')
     *
     * // png=Uint8Array
     * import fs from 'fs'
     * const uint8Array = fs.readFileSync('small_mario.png')
     * const image3 = await pdfDoc.embedPng(uint8Array)
     *
     * // png=ArrayBuffer
     * const url = 'https://pdf-lib.js.org/assets/small_mario.png'
     * const arrayBuffer = await fetch(url).then(res => res.arrayBuffer())
     * const image4 = await pdfDoc.embedPng(arrayBuffer)
     * ```
     *
     * @param png The input data for a PNG image.
     * @returns Resolves with the embedded image.
     */
    PDFDocument.prototype.embedPng = function (png) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var bytes, embedder, ref, pdfImage;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        utils_1.assertIs(png, 'png', ['string', Uint8Array, ArrayBuffer]);
                        bytes = utils_1.toUint8Array(png);
                        return [4 /*yield*/, core_1.PngEmbedder.for(bytes)];
                    case 1:
                        embedder = _a.sent();
                        ref = this.context.nextRef();
                        pdfImage = PDFImage_1.default.of(ref, this, embedder);
                        this.images.push(pdfImage);
                        return [2 /*return*/, pdfImage];
                }
            });
        });
    };
    /**
     * Embed one or more PDF pages into this document.
     *
     * For example:
     * ```js
     * const pdfDoc = await PDFDocument.create()
     *
     * const sourcePdfUrl = 'https://pdf-lib.js.org/assets/with_large_page_count.pdf'
     * const sourcePdf = await fetch(sourcePdfUrl).then((res) => res.arrayBuffer())
     *
     * // Embed page 74 of `sourcePdf` into `pdfDoc`
     * const [embeddedPage] = await pdfDoc.embedPdf(sourcePdf, [73])
     * ```
     *
     * See [[PDFDocument.load]] for examples of the allowed input data formats.
     *
     * @param pdf The input data containing a PDF document.
     * @param indices The indices of the pages that should be embedded.
     * @returns Resolves with an array of the embedded pages.
     */
    PDFDocument.prototype.embedPdf = function (pdf, indices) {
        if (indices === void 0) { indices = [0]; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var srcDoc, _a, srcPages;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        utils_1.assertIs(pdf, 'pdf', [
                            'string',
                            Uint8Array,
                            ArrayBuffer,
                            [PDFDocument, 'PDFDocument'],
                        ]);
                        utils_1.assertIs(indices, 'indices', [Array]);
                        if (!(pdf instanceof PDFDocument)) return [3 /*break*/, 1];
                        _a = pdf;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, PDFDocument.load(pdf)];
                    case 2:
                        _a = _b.sent();
                        _b.label = 3;
                    case 3:
                        srcDoc = _a;
                        srcPages = utils_1.pluckIndices(srcDoc.getPages(), indices);
                        return [2 /*return*/, this.embedPages(srcPages)];
                }
            });
        });
    };
    /**
     * Embed a single PDF page into this document.
     *
     * For example:
     * ```js
     * const pdfDoc = await PDFDocument.create()
     *
     * const sourcePdfUrl = 'https://pdf-lib.js.org/assets/with_large_page_count.pdf'
     * const sourceBuffer = await fetch(sourcePdfUrl).then((res) => res.arrayBuffer())
     * const sourcePdfDoc = await PDFDocument.load(sourceBuffer)
     * const sourcePdfPage = sourcePdfDoc.getPages()[73]
     *
     * const embeddedPage = await pdfDoc.embedPage(
     *   sourcePdfPage,
     *
     *   // Clip a section of the source page so that we only embed part of it
     *   { left: 100, right: 450, bottom: 330, top: 570 },
     *
     *   // Translate all drawings of the embedded page by (10, 200) units
     *   [1, 0, 0, 1, 10, 200],
     * )
     * ```
     *
     * @param page The page to be embedded.
     * @param boundingBox
     * Optionally, an area of the source page that should be embedded
     * (defaults to entire page).
     * @param transformationMatrix
     * Optionally, a transformation matrix that is always applied to the embedded
     * page anywhere it is drawn.
     * @returns Resolves with the embedded pdf page.
     */
    PDFDocument.prototype.embedPage = function (page, boundingBox, transformationMatrix) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var embeddedPage;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        utils_1.assertIs(page, 'page', [[PDFPage_1.default, 'PDFPage']]);
                        return [4 /*yield*/, this.embedPages([page], [boundingBox], [transformationMatrix])];
                    case 1:
                        embeddedPage = (_a.sent())[0];
                        return [2 /*return*/, embeddedPage];
                }
            });
        });
    };
    /**
     * Embed one or more PDF pages into this document.
     *
     * For example:
     * ```js
     * const pdfDoc = await PDFDocument.create()
     *
     * const sourcePdfUrl = 'https://pdf-lib.js.org/assets/with_large_page_count.pdf'
     * const sourceBuffer = await fetch(sourcePdfUrl).then((res) => res.arrayBuffer())
     * const sourcePdfDoc = await PDFDocument.load(sourceBuffer)
     *
     * const page1 = sourcePdfDoc.getPages()[0]
     * const page2 = sourcePdfDoc.getPages()[52]
     * const page3 = sourcePdfDoc.getPages()[73]
     *
     * const embeddedPages = await pdfDoc.embedPages([page1, page2, page3])
     * ```
     *
     * @param page
     * The pages to be embedded (they must all share the same context).
     * @param boundingBoxes
     * Optionally, an array of clipping boundaries - one for each page
     * (defaults to entirety of each page).
     * @param transformationMatrices
     * Optionally, an array of transformation matrices - one for each page
     * (each page's transformation will apply anywhere it is drawn).
     * @returns Resolves with an array of the embedded pdf pages.
     */
    PDFDocument.prototype.embedPages = function (pages, boundingBoxes, transformationMatrices) {
        if (boundingBoxes === void 0) { boundingBoxes = []; }
        if (transformationMatrices === void 0) { transformationMatrices = []; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var idx, len, currPage, nextPage, context, maybeCopyPage, embeddedPages, idx, len, page, box, matrix, embedder, ref;
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (pages.length === 0)
                            return [2 /*return*/, []];
                        // Assert all pages have the same context
                        for (idx = 0, len = pages.length - 1; idx < len; idx++) {
                            currPage = pages[idx];
                            nextPage = pages[idx + 1];
                            if (currPage.node.context !== nextPage.node.context) {
                                throw new core_1.PageEmbeddingMismatchedContextError();
                            }
                        }
                        context = pages[0].node.context;
                        maybeCopyPage = context === this.context
                            ? function (p) { return p; }
                            : core_1.PDFObjectCopier.for(context, this.context).copy;
                        embeddedPages = new Array(pages.length);
                        idx = 0, len = pages.length;
                        _b.label = 1;
                    case 1:
                        if (!(idx < len)) return [3 /*break*/, 4];
                        page = maybeCopyPage(pages[idx].node);
                        box = boundingBoxes[idx];
                        matrix = transformationMatrices[idx];
                        return [4 /*yield*/, core_1.PDFPageEmbedder.for(page, box, matrix)];
                    case 2:
                        embedder = _b.sent();
                        ref = this.context.nextRef();
                        embeddedPages[idx] = PDFEmbeddedPage_1.default.of(ref, this, embedder);
                        _b.label = 3;
                    case 3:
                        idx++;
                        return [3 /*break*/, 1];
                    case 4:
                        (_a = this.embeddedPages).push.apply(_a, embeddedPages);
                        return [2 /*return*/, embeddedPages];
                }
            });
        });
    };
    /**
     * > **NOTE:** You shouldn't need to call this method directly. The [[save]]
     * > and [[saveAsBase64]] methods will automatically ensure that all embedded
     * > assets are flushed before serializing the document.
     *
     * Flush all embedded fonts, PDF pages, and images to this document's
     * [[context]].
     *
     * @returns Resolves when the flush is complete.
     */
    PDFDocument.prototype.flush = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.embedAll(this.fonts)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.embedAll(this.images)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.embedAll(this.embeddedPages)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.embedAll(this.embeddedFiles)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.embedAll(this.javaScripts)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Serialize this document to an array of bytes making up a PDF file.
     * For example:
     * ```js
     * const pdfBytes = await pdfDoc.save()
     * ```
     *
     * There are a number of things you can do with the serialized document,
     * depending on the JavaScript environment you're running in:
     * * Write it to a file in Node or React Native
     * * Download it as a Blob in the browser
     * * Render it in an `iframe`
     *
     * @param options The options to be used when saving the document.
     * @returns Resolves with the bytes of the serialized document.
     */
    PDFDocument.prototype.save = function (options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, useObjectStreams, _b, addDefaultPage, _c, objectsPerTick, _d, updateFieldAppearances, form, Writer;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = options.useObjectStreams, useObjectStreams = _a === void 0 ? true : _a, _b = options.addDefaultPage, addDefaultPage = _b === void 0 ? true : _b, _c = options.objectsPerTick, objectsPerTick = _c === void 0 ? 50 : _c, _d = options.updateFieldAppearances, updateFieldAppearances = _d === void 0 ? true : _d;
                        utils_1.assertIs(useObjectStreams, 'useObjectStreams', ['boolean']);
                        utils_1.assertIs(addDefaultPage, 'addDefaultPage', ['boolean']);
                        utils_1.assertIs(objectsPerTick, 'objectsPerTick', ['number']);
                        utils_1.assertIs(updateFieldAppearances, 'updateFieldAppearances', ['boolean']);
                        if (addDefaultPage && this.getPageCount() === 0)
                            this.addPage();
                        if (updateFieldAppearances) {
                            form = this.formCache.getValue();
                            if (form)
                                form.updateFieldAppearances();
                        }
                        return [4 /*yield*/, this.flush()];
                    case 1:
                        _e.sent();
                        Writer = useObjectStreams ? core_1.PDFStreamWriter : core_1.PDFWriter;
                        return [2 /*return*/, Writer.forContext(this.context, objectsPerTick).serializeToBuffer()];
                }
            });
        });
    };
    /**
     * Serialize this document to a base64 encoded string or data URI making up a
     * PDF file. For example:
     * ```js
     * const base64String = await pdfDoc.saveAsBase64()
     * base64String // => 'JVBERi0xLjcKJYGBgYEKC...'
     *
     * const base64DataUri = await pdfDoc.saveAsBase64({ dataUri: true })
     * base64DataUri // => 'data:application/pdf;base64,JVBERi0xLjcKJYGBgYEKC...'
     * ```
     *
     * @param options The options to be used when saving the document.
     * @returns Resolves with a base64 encoded string or data URI of the
     *          serialized document.
     */
    PDFDocument.prototype.saveAsBase64 = function (options) {
        if (options === void 0) { options = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, dataUri, otherOptions, bytes, base64;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = options.dataUri, dataUri = _a === void 0 ? false : _a, otherOptions = tslib_1.__rest(options, ["dataUri"]);
                        utils_1.assertIs(dataUri, 'dataUri', ['boolean']);
                        return [4 /*yield*/, this.save(otherOptions)];
                    case 1:
                        bytes = _b.sent();
                        base64 = utils_1.encodeToBase64(bytes);
                        return [2 /*return*/, dataUri ? "data:application/pdf;base64," + base64 : base64];
                }
            });
        });
    };
    PDFDocument.prototype.findPageForAnnotationRef = function (ref) {
        var pages = this.getPages();
        for (var idx = 0, len = pages.length; idx < len; idx++) {
            var page = pages[idx];
            var annotations = page.node.Annots();
            if ((annotations === null || annotations === void 0 ? void 0 : annotations.indexOf(ref)) !== undefined) {
                return page;
            }
        }
        return undefined;
    };
    PDFDocument.prototype.embedAll = function (embeddables) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var idx, len;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        idx = 0, len = embeddables.length;
                        _a.label = 1;
                    case 1:
                        if (!(idx < len)) return [3 /*break*/, 4];
                        return [4 /*yield*/, embeddables[idx].embed()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        idx++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PDFDocument.prototype.updateInfoDict = function () {
        var pdfLib = "pdf-lib (https://github.com/Hopding/pdf-lib)";
        var now = new Date();
        var info = this.getInfoDict();
        this.setProducer(pdfLib);
        this.setModificationDate(now);
        if (!info.get(core_1.PDFName.of('Creator')))
            this.setCreator(pdfLib);
        if (!info.get(core_1.PDFName.of('CreationDate')))
            this.setCreationDate(now);
    };
    PDFDocument.prototype.getInfoDict = function () {
        var existingInfo = this.context.lookup(this.context.trailerInfo.Info);
        if (existingInfo instanceof core_1.PDFDict)
            return existingInfo;
        var newInfo = this.context.obj({});
        this.context.trailerInfo.Info = this.context.register(newInfo);
        return newInfo;
    };
    PDFDocument.prototype.assertFontkit = function () {
        if (!this.fontkit)
            throw new errors_1.FontkitNotRegisteredError();
        return this.fontkit;
    };
    return PDFDocument;
}());
exports.default = PDFDocument;
/* tslint:disable-next-line only-arrow-functions */
function assertIsLiteralOrHexString(pdfObject) {
    if (!(pdfObject instanceof core_1.PDFHexString) &&
        !(pdfObject instanceof core_1.PDFString)) {
        throw new core_1.UnexpectedObjectTypeError([core_1.PDFHexString, core_1.PDFString], pdfObject);
    }
}
//# sourceMappingURL=PDFDocument.js.map