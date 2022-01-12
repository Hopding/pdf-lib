"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var colors_1 = require("./colors");
var operations_1 = require("./operations");
var operators_1 = require("./operators");
var PDFDocument_1 = tslib_1.__importDefault(require("./PDFDocument"));
var PDFEmbeddedPage_1 = tslib_1.__importDefault(require("./PDFEmbeddedPage"));
var PDFFont_1 = tslib_1.__importDefault(require("./PDFFont"));
var PDFImage_1 = tslib_1.__importDefault(require("./PDFImage"));
var PDFPageOptions_1 = require("./PDFPageOptions");
var rotations_1 = require("./rotations");
var StandardFonts_1 = require("./StandardFonts");
var core_1 = require("../core");
var utils_1 = require("../utils");
/**
 * Represents a single page of a [[PDFDocument]].
 */
var PDFPage = /** @class */ (function () {
    function PDFPage(leafNode, ref, doc) {
        this.fontSize = 24;
        this.fontColor = colors_1.rgb(0, 0, 0);
        this.lineHeight = 24;
        this.x = 0;
        this.y = 0;
        utils_1.assertIs(leafNode, 'leafNode', [[core_1.PDFPageLeaf, 'PDFPageLeaf']]);
        utils_1.assertIs(ref, 'ref', [[core_1.PDFRef, 'PDFRef']]);
        utils_1.assertIs(doc, 'doc', [[PDFDocument_1.default, 'PDFDocument']]);
        this.node = leafNode;
        this.ref = ref;
        this.doc = doc;
    }
    /**
     * Rotate this page by a multiple of 90 degrees. For example:
     * ```js
     * import { degrees } from 'pdf-lib'
     *
     * page.setRotation(degrees(-90))
     * page.setRotation(degrees(0))
     * page.setRotation(degrees(90))
     * page.setRotation(degrees(180))
     * page.setRotation(degrees(270))
     * ```
     * @param angle The angle to rotate this page.
     */
    PDFPage.prototype.setRotation = function (angle) {
        var degreesAngle = rotations_1.toDegrees(angle);
        utils_1.assertMultiple(degreesAngle, 'degreesAngle', 90);
        this.node.set(core_1.PDFName.of('Rotate'), this.doc.context.obj(degreesAngle));
    };
    /**
     * Get this page's rotation angle in degrees. For example:
     * ```js
     * const rotationAngle = page.getRotation().angle;
     * ```
     * @returns The rotation angle of the page in degrees (always a multiple of
     *          90 degrees).
     */
    PDFPage.prototype.getRotation = function () {
        var Rotate = this.node.Rotate();
        return rotations_1.degrees(Rotate ? Rotate.asNumber() : 0);
    };
    /**
     * Resize this page by increasing or decreasing its width and height. For
     * example:
     * ```js
     * page.setSize(250, 500)
     * page.setSize(page.getWidth() + 50, page.getHeight() + 100)
     * page.setSize(page.getWidth() - 50, page.getHeight() - 100)
     * ```
     *
     * Note that the PDF specification does not allow for pages to have explicit
     * widths and heights. Instead it defines the "size" of a page in terms of
     * five rectangles: the MediaBox, CropBox, BleedBox, TrimBox, and ArtBox. As a
     * result, this method cannot directly change the width and height of a page.
     * Instead, it works by adjusting these five boxes.
     *
     * This method performs the following steps:
     *   1. Set width & height of MediaBox.
     *   2. Set width & height of CropBox, if it has same dimensions as MediaBox.
     *   3. Set width & height of BleedBox, if it has same dimensions as MediaBox.
     *   4. Set width & height of TrimBox, if it has same dimensions as MediaBox.
     *   5. Set width & height of ArtBox, if it has same dimensions as MediaBox.
     *
     * This approach works well for most PDF documents as all PDF pages must
     * have a MediaBox, but relatively few have a CropBox, BleedBox, TrimBox, or
     * ArtBox. And when they do have these additional boxes, they often have the
     * same dimensions as the MediaBox. However, if you find this method does not
     * work for your document, consider setting the boxes directly:
     *   * [[PDFPage.setMediaBox]]
     *   * [[PDFPage.setCropBox]]
     *   * [[PDFPage.setBleedBox]]
     *   * [[PDFPage.setTrimBox]]
     *   * [[PDFPage.setArtBox]]
     *
     * @param width The new width of the page.
     * @param height The new height of the page.
     */
    PDFPage.prototype.setSize = function (width, height) {
        utils_1.assertIs(width, 'width', ['number']);
        utils_1.assertIs(height, 'height', ['number']);
        var mediaBox = this.getMediaBox();
        this.setMediaBox(mediaBox.x, mediaBox.y, width, height);
        var cropBox = this.getCropBox();
        var bleedBox = this.getBleedBox();
        var trimBox = this.getTrimBox();
        var artBox = this.getArtBox();
        var hasCropBox = this.node.CropBox();
        var hasBleedBox = this.node.BleedBox();
        var hasTrimBox = this.node.TrimBox();
        var hasArtBox = this.node.ArtBox();
        if (hasCropBox && utils_1.rectanglesAreEqual(cropBox, mediaBox)) {
            this.setCropBox(mediaBox.x, mediaBox.y, width, height);
        }
        if (hasBleedBox && utils_1.rectanglesAreEqual(bleedBox, mediaBox)) {
            this.setBleedBox(mediaBox.x, mediaBox.y, width, height);
        }
        if (hasTrimBox && utils_1.rectanglesAreEqual(trimBox, mediaBox)) {
            this.setTrimBox(mediaBox.x, mediaBox.y, width, height);
        }
        if (hasArtBox && utils_1.rectanglesAreEqual(artBox, mediaBox)) {
            this.setArtBox(mediaBox.x, mediaBox.y, width, height);
        }
    };
    /**
     * Resize this page by increasing or decreasing its width. For example:
     * ```js
     * page.setWidth(250)
     * page.setWidth(page.getWidth() + 50)
     * page.setWidth(page.getWidth() - 50)
     * ```
     *
     * This method uses [[PDFPage.setSize]] to set the page's width.
     *
     * @param width The new width of the page.
     */
    PDFPage.prototype.setWidth = function (width) {
        utils_1.assertIs(width, 'width', ['number']);
        this.setSize(width, this.getSize().height);
    };
    /**
     * Resize this page by increasing or decreasing its height. For example:
     * ```js
     * page.setHeight(500)
     * page.setHeight(page.getWidth() + 100)
     * page.setHeight(page.getWidth() - 100)
     * ```
     *
     * This method uses [[PDFPage.setSize]] to set the page's height.
     *
     * @param height The new height of the page.
     */
    PDFPage.prototype.setHeight = function (height) {
        utils_1.assertIs(height, 'height', ['number']);
        this.setSize(this.getSize().width, height);
    };
    /**
     * Set the MediaBox of this page. For example:
     * ```js
     * const mediaBox = page.getMediaBox()
     *
     * page.setMediaBox(0, 0, 250, 500)
     * page.setMediaBox(mediaBox.x, mediaBox.y, 50, 100)
     * page.setMediaBox(15, 5, mediaBox.width - 50, mediaBox.height - 100)
     * ```
     *
     * See [[PDFPage.getMediaBox]] for details about what the MediaBox represents.
     *
     * @param x The x coordinate of the lower left corner of the new MediaBox.
     * @param y The y coordinate of the lower left corner of the new MediaBox.
     * @param width The width of the new MediaBox.
     * @param height The height of the new MediaBox.
     */
    PDFPage.prototype.setMediaBox = function (x, y, width, height) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        utils_1.assertIs(width, 'width', ['number']);
        utils_1.assertIs(height, 'height', ['number']);
        var mediaBox = this.doc.context.obj([x, y, x + width, y + height]);
        this.node.set(core_1.PDFName.MediaBox, mediaBox);
    };
    /**
     * Set the CropBox of this page. For example:
     * ```js
     * const cropBox = page.getCropBox()
     *
     * page.setCropBox(0, 0, 250, 500)
     * page.setCropBox(cropBox.x, cropBox.y, 50, 100)
     * page.setCropBox(15, 5, cropBox.width - 50, cropBox.height - 100)
     * ```
     *
     * See [[PDFPage.getCropBox]] for details about what the CropBox represents.
     *
     * @param x The x coordinate of the lower left corner of the new CropBox.
     * @param y The y coordinate of the lower left corner of the new CropBox.
     * @param width The width of the new CropBox.
     * @param height The height of the new CropBox.
     */
    PDFPage.prototype.setCropBox = function (x, y, width, height) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        utils_1.assertIs(width, 'width', ['number']);
        utils_1.assertIs(height, 'height', ['number']);
        var cropBox = this.doc.context.obj([x, y, x + width, y + height]);
        this.node.set(core_1.PDFName.CropBox, cropBox);
    };
    /**
     * Set the BleedBox of this page. For example:
     * ```js
     * const bleedBox = page.getBleedBox()
     *
     * page.setBleedBox(0, 0, 250, 500)
     * page.setBleedBox(bleedBox.x, bleedBox.y, 50, 100)
     * page.setBleedBox(15, 5, bleedBox.width - 50, bleedBox.height - 100)
     * ```
     *
     * See [[PDFPage.getBleedBox]] for details about what the BleedBox represents.
     *
     * @param x The x coordinate of the lower left corner of the new BleedBox.
     * @param y The y coordinate of the lower left corner of the new BleedBox.
     * @param width The width of the new BleedBox.
     * @param height The height of the new BleedBox.
     */
    PDFPage.prototype.setBleedBox = function (x, y, width, height) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        utils_1.assertIs(width, 'width', ['number']);
        utils_1.assertIs(height, 'height', ['number']);
        var bleedBox = this.doc.context.obj([x, y, x + width, y + height]);
        this.node.set(core_1.PDFName.BleedBox, bleedBox);
    };
    /**
     * Set the TrimBox of this page. For example:
     * ```js
     * const trimBox = page.getTrimBox()
     *
     * page.setTrimBox(0, 0, 250, 500)
     * page.setTrimBox(trimBox.x, trimBox.y, 50, 100)
     * page.setTrimBox(15, 5, trimBox.width - 50, trimBox.height - 100)
     * ```
     *
     * See [[PDFPage.getTrimBox]] for details about what the TrimBox represents.
     *
     * @param x The x coordinate of the lower left corner of the new TrimBox.
     * @param y The y coordinate of the lower left corner of the new TrimBox.
     * @param width The width of the new TrimBox.
     * @param height The height of the new TrimBox.
     */
    PDFPage.prototype.setTrimBox = function (x, y, width, height) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        utils_1.assertIs(width, 'width', ['number']);
        utils_1.assertIs(height, 'height', ['number']);
        var trimBox = this.doc.context.obj([x, y, x + width, y + height]);
        this.node.set(core_1.PDFName.TrimBox, trimBox);
    };
    /**
     * Set the ArtBox of this page. For example:
     * ```js
     * const artBox = page.getArtBox()
     *
     * page.setArtBox(0, 0, 250, 500)
     * page.setArtBox(artBox.x, artBox.y, 50, 100)
     * page.setArtBox(15, 5, artBox.width - 50, artBox.height - 100)
     * ```
     *
     * See [[PDFPage.getArtBox]] for details about what the ArtBox represents.
     *
     * @param x The x coordinate of the lower left corner of the new ArtBox.
     * @param y The y coordinate of the lower left corner of the new ArtBox.
     * @param width The width of the new ArtBox.
     * @param height The height of the new ArtBox.
     */
    PDFPage.prototype.setArtBox = function (x, y, width, height) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        utils_1.assertIs(width, 'width', ['number']);
        utils_1.assertIs(height, 'height', ['number']);
        var artBox = this.doc.context.obj([x, y, x + width, y + height]);
        this.node.set(core_1.PDFName.ArtBox, artBox);
    };
    /**
     * Get this page's width and height. For example:
     * ```js
     * const { width, height } = page.getSize()
     * ```
     *
     * This method uses [[PDFPage.getMediaBox]] to obtain the page's
     * width and height.
     *
     * @returns The width and height of the page.
     */
    PDFPage.prototype.getSize = function () {
        var _a = this.getMediaBox(), width = _a.width, height = _a.height;
        return { width: width, height: height };
    };
    /**
     * Get this page's width. For example:
     * ```js
     * const width = page.getWidth()
     * ```
     *
     * This method uses [[PDFPage.getSize]] to obtain the page's size.
     *
     * @returns The width of the page.
     */
    PDFPage.prototype.getWidth = function () {
        return this.getSize().width;
    };
    /**
     * Get this page's height. For example:
     * ```js
     * const height = page.getHeight()
     * ```
     *
     * This method uses [[PDFPage.getSize]] to obtain the page's size.
     *
     * @returns The height of the page.
     */
    PDFPage.prototype.getHeight = function () {
        return this.getSize().height;
    };
    /**
     * Get the rectangle defining this page's MediaBox. For example:
     * ```js
     * const { x, y, width, height } = page.getMediaBox()
     * ```
     *
     * The MediaBox of a page defines the boundaries of the physical medium on
     * which the page is to be displayed/printed. It may include extended area
     * surrounding the page content for bleed marks, printing marks, etc...
     * It may also include areas close to the edges of the medium that cannot be
     * marked because of physical limitations of the output device. Content
     * falling outside this boundary may safely be discarded without affecting
     * the meaning of the PDF file.
     *
     * @returns An object defining the lower left corner of the MediaBox and its
     *          width & height.
     */
    PDFPage.prototype.getMediaBox = function () {
        var mediaBox = this.node.MediaBox();
        return mediaBox.asRectangle();
    };
    /**
     * Get the rectangle defining this page's CropBox. For example:
     * ```js
     * const { x, y, width, height } = page.getCropBox()
     * ```
     *
     * The CropBox of a page defines the region to which the contents of the page
     * shall be clipped when displayed or printed. Unlike the other boxes, the
     * CropBox does not necessarily represent the physical page geometry. It
     * merely imposes clipping on the page contents.
     *
     * The CropBox's default value is the page's MediaBox.
     *
     * @returns An object defining the lower left corner of the CropBox and its
     *          width & height.
     */
    PDFPage.prototype.getCropBox = function () {
        var _a;
        var cropBox = this.node.CropBox();
        return (_a = cropBox === null || cropBox === void 0 ? void 0 : cropBox.asRectangle()) !== null && _a !== void 0 ? _a : this.getMediaBox();
    };
    /**
     * Get the rectangle defining this page's BleedBox. For example:
     * ```js
     * const { x, y, width, height } = page.getBleedBox()
     * ```
     *
     * The BleedBox of a page defines the region to which the contents of the
     * page shall be clipped when output in a production environment. This may
     * include any extra bleed area needed to accommodate the physical
     * limitations of cutting, folding, and trimming equipment. The actual
     * printed page may include printing marks that fall outside the BleedBox.
     *
     * The BleedBox's default value is the page's CropBox.
     *
     * @returns An object defining the lower left corner of the BleedBox and its
     *          width & height.
     */
    PDFPage.prototype.getBleedBox = function () {
        var _a;
        var bleedBox = this.node.BleedBox();
        return (_a = bleedBox === null || bleedBox === void 0 ? void 0 : bleedBox.asRectangle()) !== null && _a !== void 0 ? _a : this.getCropBox();
    };
    /**
     * Get the rectangle defining this page's TrimBox. For example:
     * ```js
     * const { x, y, width, height } = page.getTrimBox()
     * ```
     *
     * The TrimBox of a page defines the intended dimensions of the finished
     * page after trimming. It may be smaller than the MediaBox to allow for
     * production-related content, such as printing instructions, cut marks, or
     * color bars.
     *
     * The TrimBox's default value is the page's CropBox.
     *
     * @returns An object defining the lower left corner of the TrimBox and its
     *          width & height.
     */
    PDFPage.prototype.getTrimBox = function () {
        var _a;
        var trimBox = this.node.TrimBox();
        return (_a = trimBox === null || trimBox === void 0 ? void 0 : trimBox.asRectangle()) !== null && _a !== void 0 ? _a : this.getCropBox();
    };
    /**
     * Get the rectangle defining this page's ArtBox. For example:
     * ```js
     * const { x, y, width, height } = page.getArtBox()
     * ```
     *
     * The ArtBox of a page defines the extent of the page's meaningful content
     * (including potential white space).
     *
     * The ArtBox's default value is the page's CropBox.
     *
     * @returns An object defining the lower left corner of the ArtBox and its
     *          width & height.
     */
    PDFPage.prototype.getArtBox = function () {
        var _a;
        var artBox = this.node.ArtBox();
        return (_a = artBox === null || artBox === void 0 ? void 0 : artBox.asRectangle()) !== null && _a !== void 0 ? _a : this.getCropBox();
    };
    /**
     * Translate this page's content to a new location on the page. This operation
     * is often useful after resizing the page with [[setSize]]. For example:
     * ```js
     * // Add 50 units of whitespace to the top and right of the page
     * page.setSize(page.getWidth() + 50, page.getHeight() + 50)
     *
     * // Move the page's content from the lower-left corner of the page
     * // to the top-right corner.
     * page.translateContent(50, 50)
     *
     * // Now there are 50 units of whitespace to the left and bottom of the page
     * ```
     * See also: [[resetPosition]]
     * @param x The new position on the x-axis for this page's content.
     * @param y The new position on the y-axis for this page's content.
     */
    PDFPage.prototype.translateContent = function (x, y) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        this.node.normalize();
        this.getContentStream();
        var start = this.createContentStream(operators_1.pushGraphicsState(), operators_1.translate(x, y));
        var startRef = this.doc.context.register(start);
        var end = this.createContentStream(operators_1.popGraphicsState());
        var endRef = this.doc.context.register(end);
        this.node.wrapContentStreams(startRef, endRef);
    };
    /**
     * Scale the size, content, and annotations of a page.
     *
     * For example:
     * ```js
     * page.scale(0.5, 0.5);
     * ```
     *
     * @param x The factor by which the width for the page should be scaled
     *          (e.g. `0.5` is 50%).
     * @param y The factor by which the height for the page should be scaled
     *          (e.g. `2.0` is 200%).
     */
    PDFPage.prototype.scale = function (x, y) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        this.setSize(this.getWidth() * x, this.getHeight() * y);
        this.scaleContent(x, y);
        this.scaleAnnotations(x, y);
    };
    /**
     * Scale the content of a page. This is useful after resizing an existing
     * page. This scales only the content, not the annotations.
     *
     * For example:
     * ```js
     * // Bisect the size of the page
     * page.setSize(page.getWidth() / 2, page.getHeight() / 2);
     *
     * // Scale the content of the page down by 50% in x and y
     * page.scaleContent(0.5, 0.5);
     * ```
     * See also: [[scaleAnnotations]]
     * @param x The factor by which the x-axis for the content should be scaled
     *          (e.g. `0.5` is 50%).
     * @param y The factor by which the y-axis for the content should be scaled
     *          (e.g. `2.0` is 200%).
     */
    PDFPage.prototype.scaleContent = function (x, y) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        this.node.normalize();
        this.getContentStream();
        var start = this.createContentStream(operators_1.pushGraphicsState(), operators_1.scale(x, y));
        var startRef = this.doc.context.register(start);
        var end = this.createContentStream(operators_1.popGraphicsState());
        var endRef = this.doc.context.register(end);
        this.node.wrapContentStreams(startRef, endRef);
    };
    /**
     * Scale the annotations of a page. This is useful if you want to scale a
     * page with comments or other annotations.
     * ```js
     * // Scale the content of the page down by 50% in x and y
     * page.scaleContent(0.5, 0.5);
     *
     * // Scale the content of the page down by 50% in x and y
     * page.scaleAnnotations(0.5, 0.5);
     * ```
     * See also: [[scaleContent]]
     * @param x The factor by which the x-axis for the annotations should be
     *          scaled (e.g. `0.5` is 50%).
     * @param y The factor by which the y-axis for the annotations should be
     *          scaled (e.g. `2.0` is 200%).
     */
    PDFPage.prototype.scaleAnnotations = function (x, y) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        var annots = this.node.Annots();
        if (!annots)
            return;
        for (var idx = 0; idx < annots.size(); idx++) {
            var annot = annots.lookup(idx);
            if (annot instanceof core_1.PDFDict)
                this.scaleAnnot(annot, x, y);
        }
    };
    /**
     * Reset the x and y coordinates of this page to `(0, 0)`. This operation is
     * often useful after calling [[translateContent]]. For example:
     * ```js
     * // Shift the page's contents up and to the right by 50 units
     * page.translateContent(50, 50)
     *
     * // This text will shifted - it will be drawn at (50, 50)
     * page.drawText('I am shifted')
     *
     * // Move back to (0, 0)
     * page.resetPosition()
     *
     * // This text will not be shifted - it will be drawn at (0, 0)
     * page.drawText('I am not shifted')
     * ```
     */
    PDFPage.prototype.resetPosition = function () {
        this.getContentStream(false);
        this.x = 0;
        this.y = 0;
    };
    /**
     * Choose a default font for this page. The default font will be used whenever
     * text is drawn on this page and no font is specified. For example:
     * ```js
     * import { StandardFonts } from 'pdf-lib'
     *
     * const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
     * const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const courierFont = await pdfDoc.embedFont(StandardFonts.Courier)
     *
     * const page = pdfDoc.addPage()
     *
     * page.setFont(helveticaFont)
     * page.drawText('I will be drawn in Helvetica')
     *
     * page.setFont(timesRomanFont)
     * page.drawText('I will be drawn in Courier', { font: courierFont })
     * ```
     * @param font The default font to be used when drawing text on this page.
     */
    PDFPage.prototype.setFont = function (font) {
        // TODO: Reuse image Font name if we've already added this image to Resources.Fonts
        utils_1.assertIs(font, 'font', [[PDFFont_1.default, 'PDFFont']]);
        this.font = font;
        this.fontKey = this.node.newFontDictionary(this.font.name, this.font.ref);
    };
    /**
     * Choose a default font size for this page. The default font size will be
     * used whenever text is drawn on this page and no font size is specified.
     * For example:
     * ```js
     * page.setFontSize(12)
     * page.drawText('I will be drawn in size 12')
     *
     * page.setFontSize(36)
     * page.drawText('I will be drawn in size 24', { fontSize: 24 })
     * ```
     * @param fontSize The default font size to be used when drawing text on this
     *                 page.
     */
    PDFPage.prototype.setFontSize = function (fontSize) {
        utils_1.assertIs(fontSize, 'fontSize', ['number']);
        this.fontSize = fontSize;
    };
    /**
     * Choose a default font color for this page. The default font color will be
     * used whenever text is drawn on this page and no font color is specified.
     * For example:
     * ```js
     * import { rgb, cmyk, grayscale } from 'pdf-lib'
     *
     * page.setFontColor(rgb(0.97, 0.02, 0.97))
     * page.drawText('I will be drawn in pink')
     *
     * page.setFontColor(cmyk(0.4, 0.7, 0.39, 0.15))
     * page.drawText('I will be drawn in gray', { color: grayscale(0.5) })
     * ```
     * @param fontColor The default font color to be used when drawing text on
     *                  this page.
     */
    PDFPage.prototype.setFontColor = function (fontColor) {
        utils_1.assertIs(fontColor, 'fontColor', [[Object, 'Color']]);
        this.fontColor = fontColor;
    };
    /**
     * Choose a default line height for this page. The default line height will be
     * used whenever text is drawn on this page and no line height is specified.
     * For example:
     * ```js
     * page.setLineHeight(12);
     * page.drawText('These lines will be vertically \n separated by 12 units')
     *
     * page.setLineHeight(36);
     * page.drawText('These lines will be vertically \n separated by 24 units', {
     *   lineHeight: 24
     * })
     * ```
     * @param lineHeight The default line height to be used when drawing text on
     *                   this page.
     */
    PDFPage.prototype.setLineHeight = function (lineHeight) {
        utils_1.assertIs(lineHeight, 'lineHeight', ['number']);
        this.lineHeight = lineHeight;
    };
    /**
     * Get the default position of this page. For example:
     * ```js
     * const { x, y } = page.getPosition()
     * ```
     * @returns The default position of the page.
     */
    PDFPage.prototype.getPosition = function () {
        return { x: this.x, y: this.y };
    };
    /**
     * Get the default x coordinate of this page. For example:
     * ```js
     * const x = page.getX()
     * ```
     * @returns The default x coordinate of the page.
     */
    PDFPage.prototype.getX = function () {
        return this.x;
    };
    /**
     * Get the default y coordinate of this page. For example:
     * ```js
     * const y = page.getY()
     * ```
     * @returns The default y coordinate of the page.
     */
    PDFPage.prototype.getY = function () {
        return this.y;
    };
    /**
     * Change the default position of this page. For example:
     * ```js
     * page.moveTo(0, 0)
     * page.drawText('I will be drawn at the origin')
     *
     * page.moveTo(0, 25)
     * page.drawText('I will be drawn 25 units up')
     *
     * page.moveTo(25, 25)
     * page.drawText('I will be drawn 25 units up and 25 units to the right')
     * ```
     * @param x The new default position on the x-axis for this page.
     * @param y The new default position on the y-axis for this page.
     */
    PDFPage.prototype.moveTo = function (x, y) {
        utils_1.assertIs(x, 'x', ['number']);
        utils_1.assertIs(y, 'y', ['number']);
        this.x = x;
        this.y = y;
    };
    /**
     * Change the default position of this page to be further down the y-axis.
     * For example:
     * ```js
     * page.moveTo(50, 50)
     * page.drawText('I will be drawn at (50, 50)')
     *
     * page.moveDown(10)
     * page.drawText('I will be drawn at (50, 40)')
     * ```
     * @param yDecrease The amount by which the page's default position along the
     *                  y-axis should be decreased.
     */
    PDFPage.prototype.moveDown = function (yDecrease) {
        utils_1.assertIs(yDecrease, 'yDecrease', ['number']);
        this.y -= yDecrease;
    };
    /**
     * Change the default position of this page to be further up the y-axis.
     * For example:
     * ```js
     * page.moveTo(50, 50)
     * page.drawText('I will be drawn at (50, 50)')
     *
     * page.moveUp(10)
     * page.drawText('I will be drawn at (50, 60)')
     * ```
     * @param yIncrease The amount by which the page's default position along the
     *                  y-axis should be increased.
     */
    PDFPage.prototype.moveUp = function (yIncrease) {
        utils_1.assertIs(yIncrease, 'yIncrease', ['number']);
        this.y += yIncrease;
    };
    /**
     * Change the default position of this page to be further left on the x-axis.
     * For example:
     * ```js
     * page.moveTo(50, 50)
     * page.drawText('I will be drawn at (50, 50)')
     *
     * page.moveLeft(10)
     * page.drawText('I will be drawn at (40, 50)')
     * ```
     * @param xDecrease The amount by which the page's default position along the
     *                  x-axis should be decreased.
     */
    PDFPage.prototype.moveLeft = function (xDecrease) {
        utils_1.assertIs(xDecrease, 'xDecrease', ['number']);
        this.x -= xDecrease;
    };
    /**
     * Change the default position of this page to be further right on the y-axis.
     * For example:
     * ```js
     * page.moveTo(50, 50)
     * page.drawText('I will be drawn at (50, 50)')
     *
     * page.moveRight(10)
     * page.drawText('I will be drawn at (60, 50)')
     * ```
     * @param xIncrease The amount by which the page's default position along the
     *                  x-axis should be increased.
     */
    PDFPage.prototype.moveRight = function (xIncrease) {
        utils_1.assertIs(xIncrease, 'xIncrease', ['number']);
        this.x += xIncrease;
    };
    /**
     * Push one or more operators to the end of this page's current content
     * stream. For example:
     * ```js
     * import {
     *   pushGraphicsState,
     *   moveTo,
     *   lineTo,
     *   closePath,
     *   setFillingColor,
     *   rgb,
     *   fill,
     *   popGraphicsState,
     * } from 'pdf-lib'
     *
     * // Draw a green triangle in the lower-left corner of the page
     * page.pushOperators(
     *   pushGraphicsState(),
     *   moveTo(0, 0),
     *   lineTo(100, 0),
     *   lineTo(50, 100),
     *   closePath(),
     *   setFillingColor(rgb(0.0, 1.0, 0.0)),
     *   fill(),
     *   popGraphicsState(),
     * )
     * ```
     * @param operator The operators to be pushed.
     */
    PDFPage.prototype.pushOperators = function () {
        var operator = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operator[_i] = arguments[_i];
        }
        utils_1.assertEachIs(operator, 'operator', [[core_1.PDFOperator, 'PDFOperator']]);
        var contentStream = this.getContentStream();
        contentStream.push.apply(contentStream, operator);
    };
    /**
     * Draw one or more lines of text on this page. For example:
     * ```js
     * import { StandardFonts, rgb } from 'pdf-lib'
     *
     * const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
     *
     * const page = pdfDoc.addPage()
     *
     * page.setFont(helveticaFont)
     *
     * page.moveTo(5, 200)
     * page.drawText('The Life of an Egg', { size: 36 })
     *
     * page.moveDown(36)
     * page.drawText('An Epic Tale of Woe', { size: 30 })
     *
     * page.drawText(
     *   `Humpty Dumpty sat on a wall \n` +
     *   `Humpty Dumpty had a great fall; \n` +
     *   `All the king's horses and all the king's men \n` +
     *   `Couldn't put Humpty together again. \n`,
     *   {
     *     x: 25,
     *     y: 100,
     *     font: timesRomanFont,
     *     size: 24,
     *     color: rgb(1, 0, 0),
     *     lineHeight: 24,
     *     opacity: 0.75,
     *   },
     * )
     * ```
     * @param text The text to be drawn.
     * @param options The options to be used when drawing the text.
     */
    PDFPage.prototype.drawText = function (text, options) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (options === void 0) { options = {}; }
        utils_1.assertIs(text, 'text', ['string']);
        utils_1.assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
        utils_1.assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
        utils_1.assertOrUndefined(options.font, 'options.font', [[PDFFont_1.default, 'PDFFont']]);
        utils_1.assertOrUndefined(options.size, 'options.size', ['number']);
        utils_1.assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.x, 'options.x', ['number']);
        utils_1.assertOrUndefined(options.y, 'options.y', ['number']);
        utils_1.assertOrUndefined(options.lineHeight, 'options.lineHeight', ['number']);
        utils_1.assertOrUndefined(options.maxWidth, 'options.maxWidth', ['number']);
        utils_1.assertOrUndefined(options.wordBreaks, 'options.wordBreaks', [Array]);
        utils_1.assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', PDFPageOptions_1.BlendMode);
        var _h = this.setOrEmbedFont(options.font), oldFont = _h.oldFont, newFont = _h.newFont, newFontKey = _h.newFontKey;
        var fontSize = options.size || this.fontSize;
        var wordBreaks = options.wordBreaks || this.doc.defaultWordBreaks;
        var textWidth = function (t) { return newFont.widthOfTextAtSize(t, fontSize); };
        var lines = options.maxWidth === undefined
            ? utils_1.lineSplit(utils_1.cleanText(text))
            : utils_1.breakTextIntoLines(text, wordBreaks, options.maxWidth, textWidth);
        var encodedLines = new Array(lines.length);
        for (var idx = 0, len = lines.length; idx < len; idx++) {
            encodedLines[idx] = newFont.encodeText(lines[idx]);
        }
        var graphicsStateKey = this.maybeEmbedGraphicsState({
            opacity: options.opacity,
            blendMode: options.blendMode,
        });
        var contentStream = this.getContentStream();
        contentStream.push.apply(contentStream, operations_1.drawLinesOfText(encodedLines, {
            color: (_a = options.color) !== null && _a !== void 0 ? _a : this.fontColor,
            font: newFontKey,
            size: fontSize,
            rotate: (_b = options.rotate) !== null && _b !== void 0 ? _b : rotations_1.degrees(0),
            xSkew: (_c = options.xSkew) !== null && _c !== void 0 ? _c : rotations_1.degrees(0),
            ySkew: (_d = options.ySkew) !== null && _d !== void 0 ? _d : rotations_1.degrees(0),
            x: (_e = options.x) !== null && _e !== void 0 ? _e : this.x,
            y: (_f = options.y) !== null && _f !== void 0 ? _f : this.y,
            lineHeight: (_g = options.lineHeight) !== null && _g !== void 0 ? _g : this.lineHeight,
            graphicsState: graphicsStateKey,
        }));
        if (options.font) {
            if (oldFont)
                this.setFont(oldFont);
            else
                this.resetFont();
        }
    };
    /**
     * Draw an image on this page. For example:
     * ```js
     * import { degrees } from 'pdf-lib'
     *
     * const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
     * const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer())
     *
     * const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
     * const jpgDims = jpgImage.scale(0.5)
     *
     * const page = pdfDoc.addPage()
     *
     * page.drawImage(jpgImage, {
     *   x: 25,
     *   y: 25,
     *   width: jpgDims.width,
     *   height: jpgDims.height,
     *   rotate: degrees(30),
     *   opacity: 0.75,
     * })
     * ```
     * @param image The image to be drawn.
     * @param options The options to be used when drawing the image.
     */
    PDFPage.prototype.drawImage = function (image, options) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (options === void 0) { options = {}; }
        // TODO: Reuse image XObject name if we've already added this image to Resources.XObjects
        utils_1.assertIs(image, 'image', [[PDFImage_1.default, 'PDFImage']]);
        utils_1.assertOrUndefined(options.x, 'options.x', ['number']);
        utils_1.assertOrUndefined(options.y, 'options.y', ['number']);
        utils_1.assertOrUndefined(options.width, 'options.width', ['number']);
        utils_1.assertOrUndefined(options.height, 'options.height', ['number']);
        utils_1.assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);
        utils_1.assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
        utils_1.assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', PDFPageOptions_1.BlendMode);
        var xObjectKey = this.node.newXObject('Image', image.ref);
        var graphicsStateKey = this.maybeEmbedGraphicsState({
            opacity: options.opacity,
            blendMode: options.blendMode,
        });
        var contentStream = this.getContentStream();
        contentStream.push.apply(contentStream, operations_1.drawImage(xObjectKey, {
            x: (_a = options.x) !== null && _a !== void 0 ? _a : this.x,
            y: (_b = options.y) !== null && _b !== void 0 ? _b : this.y,
            width: (_c = options.width) !== null && _c !== void 0 ? _c : image.size().width,
            height: (_d = options.height) !== null && _d !== void 0 ? _d : image.size().height,
            rotate: (_e = options.rotate) !== null && _e !== void 0 ? _e : rotations_1.degrees(0),
            xSkew: (_f = options.xSkew) !== null && _f !== void 0 ? _f : rotations_1.degrees(0),
            ySkew: (_g = options.ySkew) !== null && _g !== void 0 ? _g : rotations_1.degrees(0),
            graphicsState: graphicsStateKey,
        }));
    };
    /**
     * Draw an embedded PDF page on this page. For example:
     * ```js
     * import { degrees } from 'pdf-lib'
     *
     * const pdfDoc = await PDFDocument.create()
     * const page = pdfDoc.addPage()
     *
     * const sourcePdfUrl = 'https://pdf-lib.js.org/assets/with_large_page_count.pdf'
     * const sourcePdf = await fetch(sourcePdfUrl).then((res) => res.arrayBuffer())
     *
     * // Embed page 74 from the PDF
     * const [embeddedPage] = await pdfDoc.embedPdf(sourcePdf, 73)
     *
     * page.drawPage(embeddedPage, {
     *   x: 250,
     *   y: 200,
     *   xScale: 0.5,
     *   yScale: 0.5,
     *   rotate: degrees(30),
     *   opacity: 0.75,
     * })
     * ```
     *
     * The `options` argument accepts both `width`/`height` and `xScale`/`yScale`
     * as options. Since each of these options defines the size of the drawn page,
     * if both options are given, `width` and `height` take precedence and the
     * corresponding scale variants are ignored.
     *
     * @param embeddedPage The embedded page to be drawn.
     * @param options The options to be used when drawing the embedded page.
     */
    PDFPage.prototype.drawPage = function (embeddedPage, options) {
        var _a, _b, _c, _d, _e;
        if (options === void 0) { options = {}; }
        // TODO: Reuse embeddedPage XObject name if we've already added this embeddedPage to Resources.XObjects
        utils_1.assertIs(embeddedPage, 'embeddedPage', [
            [PDFEmbeddedPage_1.default, 'PDFEmbeddedPage'],
        ]);
        utils_1.assertOrUndefined(options.x, 'options.x', ['number']);
        utils_1.assertOrUndefined(options.y, 'options.y', ['number']);
        utils_1.assertOrUndefined(options.xScale, 'options.xScale', ['number']);
        utils_1.assertOrUndefined(options.yScale, 'options.yScale', ['number']);
        utils_1.assertOrUndefined(options.width, 'options.width', ['number']);
        utils_1.assertOrUndefined(options.height, 'options.height', ['number']);
        utils_1.assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);
        utils_1.assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
        utils_1.assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', PDFPageOptions_1.BlendMode);
        var xObjectKey = this.node.newXObject('EmbeddedPdfPage', embeddedPage.ref);
        var graphicsStateKey = this.maybeEmbedGraphicsState({
            opacity: options.opacity,
            blendMode: options.blendMode,
        });
        // prettier-ignore
        var xScale = (options.width !== undefined ? options.width / embeddedPage.width
            : options.xScale !== undefined ? options.xScale
                : 1);
        // prettier-ignore
        var yScale = (options.height !== undefined ? options.height / embeddedPage.height
            : options.yScale !== undefined ? options.yScale
                : 1);
        var contentStream = this.getContentStream();
        contentStream.push.apply(contentStream, operations_1.drawPage(xObjectKey, {
            x: (_a = options.x) !== null && _a !== void 0 ? _a : this.x,
            y: (_b = options.y) !== null && _b !== void 0 ? _b : this.y,
            xScale: xScale,
            yScale: yScale,
            rotate: (_c = options.rotate) !== null && _c !== void 0 ? _c : rotations_1.degrees(0),
            xSkew: (_d = options.xSkew) !== null && _d !== void 0 ? _d : rotations_1.degrees(0),
            ySkew: (_e = options.ySkew) !== null && _e !== void 0 ? _e : rotations_1.degrees(0),
            graphicsState: graphicsStateKey,
        }));
    };
    /**
     * Draw an SVG path on this page. For example:
     * ```js
     * import { rgb } from 'pdf-lib'
     *
     * const svgPath = 'M 0,20 L 100,160 Q 130,200 150,120 C 190,-40 200,200 300,150 L 400,90'
     *
     * // Draw path as black line
     * page.drawSvgPath(svgPath, { x: 25, y: 75 })
     *
     * // Change border style and opacity
     * page.drawSvgPath(svgPath, {
     *   x: 25,
     *   y: 275,
     *   borderColor: rgb(0.5, 0.5, 0.5),
     *   borderWidth: 2,
     *   borderOpacity: 0.75,
     * })
     *
     * // Set fill color and opacity
     * page.drawSvgPath(svgPath, {
     *   x: 25,
     *   y: 475,
     *   color: rgb(1.0, 0, 0),
     *   opacity: 0.75,
     * })
     *
     * // Draw 50% of original size
     * page.drawSvgPath(svgPath, {
     *   x: 25,
     *   y: 675,
     *   scale: 0.5,
     * })
     * ```
     * @param path The SVG path to be drawn.
     * @param options The options to be used when drawing the SVG path.
     */
    PDFPage.prototype.drawSvgPath = function (path, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (options === void 0) { options = {}; }
        utils_1.assertIs(path, 'path', ['string']);
        utils_1.assertOrUndefined(options.x, 'options.x', ['number']);
        utils_1.assertOrUndefined(options.y, 'options.y', ['number']);
        utils_1.assertOrUndefined(options.scale, 'options.scale', ['number']);
        utils_1.assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);
        utils_1.assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
        utils_1.assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
        utils_1.assertOrUndefined(options.borderColor, 'options.borderColor', [
            [Object, 'Color'],
        ]);
        utils_1.assertOrUndefined(options.borderDashArray, 'options.borderDashArray', [
            Array,
        ]);
        utils_1.assertOrUndefined(options.borderDashPhase, 'options.borderDashPhase', [
            'number',
        ]);
        utils_1.assertIsOneOfOrUndefined(options.borderLineCap, 'options.borderLineCap', operators_1.LineCapStyle);
        utils_1.assertRangeOrUndefined(options.borderOpacity, 'options.borderOpacity', 0, 1);
        utils_1.assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', PDFPageOptions_1.BlendMode);
        var graphicsStateKey = this.maybeEmbedGraphicsState({
            opacity: options.opacity,
            borderOpacity: options.borderOpacity,
            blendMode: options.blendMode,
        });
        if (!('color' in options) && !('borderColor' in options)) {
            options.borderColor = colors_1.rgb(0, 0, 0);
        }
        var contentStream = this.getContentStream();
        contentStream.push.apply(contentStream, operations_1.drawSvgPath(path, {
            x: (_a = options.x) !== null && _a !== void 0 ? _a : this.x,
            y: (_b = options.y) !== null && _b !== void 0 ? _b : this.y,
            scale: options.scale,
            rotate: (_c = options.rotate) !== null && _c !== void 0 ? _c : rotations_1.degrees(0),
            color: (_d = options.color) !== null && _d !== void 0 ? _d : undefined,
            borderColor: (_e = options.borderColor) !== null && _e !== void 0 ? _e : undefined,
            borderWidth: (_f = options.borderWidth) !== null && _f !== void 0 ? _f : 0,
            borderDashArray: (_g = options.borderDashArray) !== null && _g !== void 0 ? _g : undefined,
            borderDashPhase: (_h = options.borderDashPhase) !== null && _h !== void 0 ? _h : undefined,
            borderLineCap: (_j = options.borderLineCap) !== null && _j !== void 0 ? _j : undefined,
            graphicsState: graphicsStateKey,
        }));
    };
    /**
     * Draw a line on this page. For example:
     * ```js
     * import { rgb } from 'pdf-lib'
     *
     * page.drawLine({
     *   start: { x: 25, y: 75 },
     *   end: { x: 125, y: 175 },
     *   thickness: 2,
     *   color: rgb(0.75, 0.2, 0.2),
     *   opacity: 0.75,
     * })
     * ```
     * @param options The options to be used when drawing the line.
     */
    PDFPage.prototype.drawLine = function (options) {
        var _a, _b, _c, _d, _e;
        utils_1.assertIs(options.start, 'options.start', [
            [Object, '{ x: number, y: number }'],
        ]);
        utils_1.assertIs(options.end, 'options.end', [
            [Object, '{ x: number, y: number }'],
        ]);
        utils_1.assertIs(options.start.x, 'options.start.x', ['number']);
        utils_1.assertIs(options.start.y, 'options.start.y', ['number']);
        utils_1.assertIs(options.end.x, 'options.end.x', ['number']);
        utils_1.assertIs(options.end.y, 'options.end.y', ['number']);
        utils_1.assertOrUndefined(options.thickness, 'options.thickness', ['number']);
        utils_1.assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
        utils_1.assertOrUndefined(options.dashArray, 'options.dashArray', [Array]);
        utils_1.assertOrUndefined(options.dashPhase, 'options.dashPhase', ['number']);
        utils_1.assertIsOneOfOrUndefined(options.lineCap, 'options.lineCap', operators_1.LineCapStyle);
        utils_1.assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
        utils_1.assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', PDFPageOptions_1.BlendMode);
        var graphicsStateKey = this.maybeEmbedGraphicsState({
            borderOpacity: options.opacity,
            blendMode: options.blendMode,
        });
        if (!('color' in options)) {
            options.color = colors_1.rgb(0, 0, 0);
        }
        var contentStream = this.getContentStream();
        contentStream.push.apply(contentStream, operations_1.drawLine({
            start: options.start,
            end: options.end,
            thickness: (_a = options.thickness) !== null && _a !== void 0 ? _a : 1,
            color: (_b = options.color) !== null && _b !== void 0 ? _b : undefined,
            dashArray: (_c = options.dashArray) !== null && _c !== void 0 ? _c : undefined,
            dashPhase: (_d = options.dashPhase) !== null && _d !== void 0 ? _d : undefined,
            lineCap: (_e = options.lineCap) !== null && _e !== void 0 ? _e : undefined,
            graphicsState: graphicsStateKey,
        }));
    };
    /**
     * Draw a rectangle on this page. For example:
     * ```js
     * import { degrees, grayscale, rgb } from 'pdf-lib'
     *
     * page.drawRectangle({
     *   x: 25,
     *   y: 75,
     *   width: 250,
     *   height: 75,
     *   rotate: degrees(-15),
     *   borderWidth: 5,
     *   borderColor: grayscale(0.5),
     *   color: rgb(0.75, 0.2, 0.2),
     *   opacity: 0.5,
     *   borderOpacity: 0.75,
     * })
     * ```
     * @param options The options to be used when drawing the rectangle.
     */
    PDFPage.prototype.drawRectangle = function (options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (options === void 0) { options = {}; }
        utils_1.assertOrUndefined(options.x, 'options.x', ['number']);
        utils_1.assertOrUndefined(options.y, 'options.y', ['number']);
        utils_1.assertOrUndefined(options.width, 'options.width', ['number']);
        utils_1.assertOrUndefined(options.height, 'options.height', ['number']);
        utils_1.assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.xSkew, 'options.xSkew', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.ySkew, 'options.ySkew', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);
        utils_1.assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
        utils_1.assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
        utils_1.assertOrUndefined(options.borderColor, 'options.borderColor', [
            [Object, 'Color'],
        ]);
        utils_1.assertOrUndefined(options.borderDashArray, 'options.borderDashArray', [
            Array,
        ]);
        utils_1.assertOrUndefined(options.borderDashPhase, 'options.borderDashPhase', [
            'number',
        ]);
        utils_1.assertIsOneOfOrUndefined(options.borderLineCap, 'options.borderLineCap', operators_1.LineCapStyle);
        utils_1.assertRangeOrUndefined(options.borderOpacity, 'options.borderOpacity', 0, 1);
        utils_1.assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', PDFPageOptions_1.BlendMode);
        var graphicsStateKey = this.maybeEmbedGraphicsState({
            opacity: options.opacity,
            borderOpacity: options.borderOpacity,
            blendMode: options.blendMode,
        });
        if (!('color' in options) && !('borderColor' in options)) {
            options.color = colors_1.rgb(0, 0, 0);
        }
        var contentStream = this.getContentStream();
        contentStream.push.apply(contentStream, operations_1.drawRectangle({
            x: (_a = options.x) !== null && _a !== void 0 ? _a : this.x,
            y: (_b = options.y) !== null && _b !== void 0 ? _b : this.y,
            width: (_c = options.width) !== null && _c !== void 0 ? _c : 150,
            height: (_d = options.height) !== null && _d !== void 0 ? _d : 100,
            rotate: (_e = options.rotate) !== null && _e !== void 0 ? _e : rotations_1.degrees(0),
            xSkew: (_f = options.xSkew) !== null && _f !== void 0 ? _f : rotations_1.degrees(0),
            ySkew: (_g = options.ySkew) !== null && _g !== void 0 ? _g : rotations_1.degrees(0),
            borderWidth: (_h = options.borderWidth) !== null && _h !== void 0 ? _h : 0,
            color: (_j = options.color) !== null && _j !== void 0 ? _j : undefined,
            borderColor: (_k = options.borderColor) !== null && _k !== void 0 ? _k : undefined,
            borderDashArray: (_l = options.borderDashArray) !== null && _l !== void 0 ? _l : undefined,
            borderDashPhase: (_m = options.borderDashPhase) !== null && _m !== void 0 ? _m : undefined,
            graphicsState: graphicsStateKey,
            borderLineCap: (_o = options.borderLineCap) !== null && _o !== void 0 ? _o : undefined,
        }));
    };
    /**
     * Draw a square on this page. For example:
     * ```js
     * import { degrees, grayscale, rgb } from 'pdf-lib'
     *
     * page.drawSquare({
     *   x: 25,
     *   y: 75,
     *   size: 100,
     *   rotate: degrees(-15),
     *   borderWidth: 5,
     *   borderColor: grayscale(0.5),
     *   color: rgb(0.75, 0.2, 0.2),
     *   opacity: 0.5,
     *   borderOpacity: 0.75,
     * })
     * ```
     * @param options The options to be used when drawing the square.
     */
    PDFPage.prototype.drawSquare = function (options) {
        if (options === void 0) { options = {}; }
        var size = options.size;
        utils_1.assertOrUndefined(size, 'size', ['number']);
        this.drawRectangle(tslib_1.__assign(tslib_1.__assign({}, options), { width: size, height: size }));
    };
    /**
     * Draw an ellipse on this page. For example:
     * ```js
     * import { grayscale, rgb } from 'pdf-lib'
     *
     * page.drawEllipse({
     *   x: 200,
     *   y: 75,
     *   xScale: 100,
     *   yScale: 50,
     *   borderWidth: 5,
     *   borderColor: grayscale(0.5),
     *   color: rgb(0.75, 0.2, 0.2),
     *   opacity: 0.5,
     *   borderOpacity: 0.75,
     * })
     * ```
     * @param options The options to be used when drawing the ellipse.
     */
    PDFPage.prototype.drawEllipse = function (options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (options === void 0) { options = {}; }
        utils_1.assertOrUndefined(options.x, 'options.x', ['number']);
        utils_1.assertOrUndefined(options.y, 'options.y', ['number']);
        utils_1.assertOrUndefined(options.xScale, 'options.xScale', ['number']);
        utils_1.assertOrUndefined(options.yScale, 'options.yScale', ['number']);
        utils_1.assertOrUndefined(options.rotate, 'options.rotate', [[Object, 'Rotation']]);
        utils_1.assertOrUndefined(options.color, 'options.color', [[Object, 'Color']]);
        utils_1.assertRangeOrUndefined(options.opacity, 'opacity.opacity', 0, 1);
        utils_1.assertOrUndefined(options.borderColor, 'options.borderColor', [
            [Object, 'Color'],
        ]);
        utils_1.assertRangeOrUndefined(options.borderOpacity, 'options.borderOpacity', 0, 1);
        utils_1.assertOrUndefined(options.borderWidth, 'options.borderWidth', ['number']);
        utils_1.assertOrUndefined(options.borderDashArray, 'options.borderDashArray', [
            Array,
        ]);
        utils_1.assertOrUndefined(options.borderDashPhase, 'options.borderDashPhase', [
            'number',
        ]);
        utils_1.assertIsOneOfOrUndefined(options.borderLineCap, 'options.borderLineCap', operators_1.LineCapStyle);
        utils_1.assertIsOneOfOrUndefined(options.blendMode, 'options.blendMode', PDFPageOptions_1.BlendMode);
        var graphicsStateKey = this.maybeEmbedGraphicsState({
            opacity: options.opacity,
            borderOpacity: options.borderOpacity,
            blendMode: options.blendMode,
        });
        if (!('color' in options) && !('borderColor' in options)) {
            options.color = colors_1.rgb(0, 0, 0);
        }
        var contentStream = this.getContentStream();
        contentStream.push.apply(contentStream, operations_1.drawEllipse({
            x: (_a = options.x) !== null && _a !== void 0 ? _a : this.x,
            y: (_b = options.y) !== null && _b !== void 0 ? _b : this.y,
            xScale: (_c = options.xScale) !== null && _c !== void 0 ? _c : 100,
            yScale: (_d = options.yScale) !== null && _d !== void 0 ? _d : 100,
            rotate: (_e = options.rotate) !== null && _e !== void 0 ? _e : undefined,
            color: (_f = options.color) !== null && _f !== void 0 ? _f : undefined,
            borderColor: (_g = options.borderColor) !== null && _g !== void 0 ? _g : undefined,
            borderWidth: (_h = options.borderWidth) !== null && _h !== void 0 ? _h : 0,
            borderDashArray: (_j = options.borderDashArray) !== null && _j !== void 0 ? _j : undefined,
            borderDashPhase: (_k = options.borderDashPhase) !== null && _k !== void 0 ? _k : undefined,
            borderLineCap: (_l = options.borderLineCap) !== null && _l !== void 0 ? _l : undefined,
            graphicsState: graphicsStateKey,
        }));
    };
    /**
     * Draw a circle on this page. For example:
     * ```js
     * import { grayscale, rgb } from 'pdf-lib'
     *
     * page.drawCircle({
     *   x: 200,
     *   y: 150,
     *   size: 100,
     *   borderWidth: 5,
     *   borderColor: grayscale(0.5),
     *   color: rgb(0.75, 0.2, 0.2),
     *   opacity: 0.5,
     *   borderOpacity: 0.75,
     * })
     * ```
     * @param options The options to be used when drawing the ellipse.
     */
    PDFPage.prototype.drawCircle = function (options) {
        if (options === void 0) { options = {}; }
        var _a = options.size, size = _a === void 0 ? 100 : _a;
        utils_1.assertOrUndefined(size, 'size', ['number']);
        this.drawEllipse(tslib_1.__assign(tslib_1.__assign({}, options), { xScale: size, yScale: size }));
    };
    PDFPage.prototype.setOrEmbedFont = function (font) {
        var oldFont = this.font;
        var oldFontKey = this.fontKey;
        if (font)
            this.setFont(font);
        else
            this.getFont();
        var newFont = this.font;
        var newFontKey = this.fontKey;
        return { oldFont: oldFont, oldFontKey: oldFontKey, newFont: newFont, newFontKey: newFontKey };
    };
    PDFPage.prototype.getFont = function () {
        if (!this.font || !this.fontKey) {
            var font = this.doc.embedStandardFont(StandardFonts_1.StandardFonts.Helvetica);
            this.setFont(font);
        }
        return [this.font, this.fontKey];
    };
    PDFPage.prototype.resetFont = function () {
        this.font = undefined;
        this.fontKey = undefined;
    };
    PDFPage.prototype.getContentStream = function (useExisting) {
        if (useExisting === void 0) { useExisting = true; }
        if (useExisting && this.contentStream)
            return this.contentStream;
        this.contentStream = this.createContentStream();
        this.contentStreamRef = this.doc.context.register(this.contentStream);
        this.node.addContentStream(this.contentStreamRef);
        return this.contentStream;
    };
    PDFPage.prototype.createContentStream = function () {
        var operators = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operators[_i] = arguments[_i];
        }
        var dict = this.doc.context.obj({});
        var contentStream = core_1.PDFContentStream.of(dict, operators);
        return contentStream;
    };
    PDFPage.prototype.maybeEmbedGraphicsState = function (options) {
        var opacity = options.opacity, borderOpacity = options.borderOpacity, blendMode = options.blendMode;
        if (opacity === undefined &&
            borderOpacity === undefined &&
            blendMode === undefined) {
            return undefined;
        }
        var graphicsState = this.doc.context.obj({
            Type: 'ExtGState',
            ca: opacity,
            CA: borderOpacity,
            BM: blendMode,
        });
        var key = this.node.newExtGState('GS', graphicsState);
        return key;
    };
    PDFPage.prototype.scaleAnnot = function (annot, x, y) {
        var selectors = ['RD', 'CL', 'Vertices', 'QuadPoints', 'L', 'Rect'];
        for (var idx = 0, len = selectors.length; idx < len; idx++) {
            var list = annot.lookup(core_1.PDFName.of(selectors[idx]));
            if (list instanceof core_1.PDFArray)
                list.scalePDFNumbers(x, y);
        }
        var inkLists = annot.lookup(core_1.PDFName.of('InkList'));
        if (inkLists instanceof core_1.PDFArray) {
            for (var idx = 0, len = inkLists.size(); idx < len; idx++) {
                var arr = inkLists.lookup(idx);
                if (arr instanceof core_1.PDFArray)
                    arr.scalePDFNumbers(x, y);
            }
        }
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.addPage]] and [[PDFDocument.insertPage]]
     * > methods, which can create instances of [[PDFPage]] for you.
     *
     * Create an instance of [[PDFPage]] from an existing leaf node.
     *
     * @param leafNode The leaf node to be wrapped.
     * @param ref The unique reference for the page.
     * @param doc The document to which the page will belong.
     */
    PDFPage.of = function (leafNode, ref, doc) {
        return new PDFPage(leafNode, ref, doc);
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFDocument.addPage]] and [[PDFDocument.insertPage]]
     * > methods, which can create instances of [[PDFPage]] for you.
     *
     * Create an instance of [[PDFPage]].
     *
     * @param doc The document to which the page will belong.
     */
    PDFPage.create = function (doc) {
        utils_1.assertIs(doc, 'doc', [[PDFDocument_1.default, 'PDFDocument']]);
        var dummyRef = core_1.PDFRef.of(-1);
        var pageLeaf = core_1.PDFPageLeaf.withContextAndParent(doc.context, dummyRef);
        var pageRef = doc.context.register(pageLeaf);
        return new PDFPage(pageLeaf, pageRef, doc);
    };
    return PDFPage;
}());
exports.default = PDFPage;
//# sourceMappingURL=PDFPage.js.map