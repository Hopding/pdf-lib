"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertFieldAppearanceOptions = void 0;
var tslib_1 = require("tslib");
var PDFDocument_1 = tslib_1.__importDefault(require("../PDFDocument"));
var colors_1 = require("../colors");
var rotations_1 = require("../rotations");
var core_1 = require("../../core");
var utils_1 = require("../../utils");
var image_1 = require("../image");
var operations_1 = require("../operations");
exports.assertFieldAppearanceOptions = function (options) {
    utils_1.assertOrUndefined(options === null || options === void 0 ? void 0 : options.x, 'options.x', ['number']);
    utils_1.assertOrUndefined(options === null || options === void 0 ? void 0 : options.y, 'options.y', ['number']);
    utils_1.assertOrUndefined(options === null || options === void 0 ? void 0 : options.width, 'options.width', ['number']);
    utils_1.assertOrUndefined(options === null || options === void 0 ? void 0 : options.height, 'options.height', ['number']);
    utils_1.assertOrUndefined(options === null || options === void 0 ? void 0 : options.textColor, 'options.textColor', [
        [Object, 'Color'],
    ]);
    utils_1.assertOrUndefined(options === null || options === void 0 ? void 0 : options.backgroundColor, 'options.backgroundColor', [
        [Object, 'Color'],
    ]);
    utils_1.assertOrUndefined(options === null || options === void 0 ? void 0 : options.borderColor, 'options.borderColor', [
        [Object, 'Color'],
    ]);
    utils_1.assertOrUndefined(options === null || options === void 0 ? void 0 : options.borderWidth, 'options.borderWidth', ['number']);
    utils_1.assertOrUndefined(options === null || options === void 0 ? void 0 : options.rotate, 'options.rotate', [[Object, 'Rotation']]);
};
/**
 * Represents a field of a [[PDFForm]].
 *
 * This class is effectively abstract. All fields in a [[PDFForm]] will
 * actually be an instance of a subclass of this class.
 *
 * Note that each field in a PDF is represented by a single field object.
 * However, a given field object may be rendered at multiple locations within
 * the document (across one or more pages). The rendering of a field is
 * controlled by its widgets. Each widget causes its field to be displayed at a
 * particular location in the document.
 *
 * Most of the time each field in a PDF has only a single widget, and thus is
 * only rendered once. However, if a field is rendered multiple times, it will
 * have multiple widgets - one for each location it is rendered.
 *
 * This abstraction of field objects and widgets is defined in the PDF
 * specification and dictates how PDF files store fields and where they are
 * to be rendered.
 */
var PDFField = /** @class */ (function () {
    function PDFField(acroField, ref, doc) {
        utils_1.assertIs(acroField, 'acroField', [[core_1.PDFAcroTerminal, 'PDFAcroTerminal']]);
        utils_1.assertIs(ref, 'ref', [[core_1.PDFRef, 'PDFRef']]);
        utils_1.assertIs(doc, 'doc', [[PDFDocument_1.default, 'PDFDocument']]);
        this.acroField = acroField;
        this.ref = ref;
        this.doc = doc;
    }
    /**
     * Get the fully qualified name of this field. For example:
     * ```js
     * const fields = form.getFields()
     * fields.forEach(field => {
     *   const name = field.getName()
     *   console.log('Field name:', name)
     * })
     * ```
     * Note that PDF fields are structured as a tree. Each field is the
     * descendent of a series of ancestor nodes all the way up to the form node,
     * which is always the root of the tree. Each node in the tree (except for
     * the form node) has a partial name. Partial names can be composed of any
     * unicode characters except a period (`.`). The fully qualified name of a
     * field is composed of the partial names of all its ancestors joined
     * with periods. This means that splitting the fully qualified name on
     * periods and taking the last element of the resulting array will give you
     * the partial name of a specific field.
     * @returns The fully qualified name of this field.
     */
    PDFField.prototype.getName = function () {
        var _a;
        return (_a = this.acroField.getFullyQualifiedName()) !== null && _a !== void 0 ? _a : '';
    };
    /**
     * Returns `true` if this field is read only. This means that PDF readers
     * will not allow users to interact with the field or change its value. See
     * [[PDFField.enableReadOnly]] and [[PDFField.disableReadOnly]].
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * if (field.isReadOnly()) console.log('Read only is enabled')
     * ```
     * @returns Whether or not this is a read only field.
     */
    PDFField.prototype.isReadOnly = function () {
        return this.acroField.hasFlag(core_1.AcroFieldFlags.ReadOnly);
    };
    /**
     * Prevent PDF readers from allowing users to interact with this field or
     * change its value. The field will not respond to mouse or keyboard input.
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * field.enableReadOnly()
     * ```
     * Useful for fields whose values are computed, imported from a database, or
     * prefilled by software before being displayed to the user.
     */
    PDFField.prototype.enableReadOnly = function () {
        this.acroField.setFlagTo(core_1.AcroFieldFlags.ReadOnly, true);
    };
    /**
     * Allow users to interact with this field and change its value in PDF
     * readers via mouse and keyboard input. For example:
     * ```js
     * const field = form.getField('some.field')
     * field.disableReadOnly()
     * ```
     */
    PDFField.prototype.disableReadOnly = function () {
        this.acroField.setFlagTo(core_1.AcroFieldFlags.ReadOnly, false);
    };
    /**
     * Returns `true` if this field must have a value when the form is submitted.
     * See [[PDFField.enableRequired]] and [[PDFField.disableRequired]].
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * if (field.isRequired()) console.log('Field is required')
     * ```
     * @returns Whether or not this field is required.
     */
    PDFField.prototype.isRequired = function () {
        return this.acroField.hasFlag(core_1.AcroFieldFlags.Required);
    };
    /**
     * Require this field to have a value when the form is submitted.
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * field.enableRequired()
     * ```
     */
    PDFField.prototype.enableRequired = function () {
        this.acroField.setFlagTo(core_1.AcroFieldFlags.Required, true);
    };
    /**
     * Do not require this field to have a value when the form is submitted.
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * field.disableRequired()
     * ```
     */
    PDFField.prototype.disableRequired = function () {
        this.acroField.setFlagTo(core_1.AcroFieldFlags.Required, false);
    };
    /**
     * Returns `true` if this field's value should be exported when the form is
     * submitted. See [[PDFField.enableExporting]] and
     * [[PDFField.disableExporting]].
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * if (field.isExported()) console.log('Exporting is enabled')
     * ```
     * @returns Whether or not this field's value should be exported.
     */
    PDFField.prototype.isExported = function () {
        return !this.acroField.hasFlag(core_1.AcroFieldFlags.NoExport);
    };
    /**
     * Indicate that this field's value should be exported when the form is
     * submitted in a PDF reader. For example:
     * ```js
     * const field = form.getField('some.field')
     * field.enableExporting()
     * ```
     */
    PDFField.prototype.enableExporting = function () {
        this.acroField.setFlagTo(core_1.AcroFieldFlags.NoExport, false);
    };
    /**
     * Indicate that this field's value should **not** be exported when the form
     * is submitted in a PDF reader. For example:
     * ```js
     * const field = form.getField('some.field')
     * field.disableExporting()
     * ```
     */
    PDFField.prototype.disableExporting = function () {
        this.acroField.setFlagTo(core_1.AcroFieldFlags.NoExport, true);
    };
    /** @ignore */
    PDFField.prototype.needsAppearancesUpdate = function () {
        throw new core_1.MethodNotImplementedError(this.constructor.name, 'needsAppearancesUpdate');
    };
    /** @ignore */
    PDFField.prototype.defaultUpdateAppearances = function (_font) {
        throw new core_1.MethodNotImplementedError(this.constructor.name, 'defaultUpdateAppearances');
    };
    PDFField.prototype.markAsDirty = function () {
        this.doc.getForm().markFieldAsDirty(this.ref);
    };
    PDFField.prototype.markAsClean = function () {
        this.doc.getForm().markFieldAsClean(this.ref);
    };
    PDFField.prototype.isDirty = function () {
        return this.doc.getForm().fieldIsDirty(this.ref);
    };
    PDFField.prototype.createWidget = function (options) {
        var _a;
        var textColor = options.textColor;
        var backgroundColor = options.backgroundColor;
        var borderColor = options.borderColor;
        var borderWidth = options.borderWidth;
        var degreesAngle = rotations_1.toDegrees(options.rotate);
        var caption = options.caption;
        var x = options.x;
        var y = options.y;
        var width = options.width + borderWidth;
        var height = options.height + borderWidth;
        var hidden = Boolean(options.hidden);
        var pageRef = options.page;
        utils_1.assertMultiple(degreesAngle, 'degreesAngle', 90);
        // Create a widget for this field
        var widget = core_1.PDFWidgetAnnotation.create(this.doc.context, this.ref);
        // Set widget properties
        var rect = rotations_1.rotateRectangle({ x: x, y: y, width: width, height: height }, borderWidth, degreesAngle);
        widget.setRectangle(rect);
        if (pageRef)
            widget.setP(pageRef);
        var ac = widget.getOrCreateAppearanceCharacteristics();
        if (backgroundColor) {
            ac.setBackgroundColor(colors_1.colorToComponents(backgroundColor));
        }
        ac.setRotation(degreesAngle);
        if (caption)
            ac.setCaptions({ normal: caption });
        if (borderColor)
            ac.setBorderColor(colors_1.colorToComponents(borderColor));
        var bs = widget.getOrCreateBorderStyle();
        if (borderWidth !== undefined)
            bs.setWidth(borderWidth);
        widget.setFlagTo(core_1.AnnotationFlags.Print, true);
        widget.setFlagTo(core_1.AnnotationFlags.Hidden, hidden);
        widget.setFlagTo(core_1.AnnotationFlags.Invisible, false);
        // Set acrofield properties
        if (textColor) {
            var da = (_a = this.acroField.getDefaultAppearance()) !== null && _a !== void 0 ? _a : '';
            var newDa = da + '\n' + colors_1.setFillingColor(textColor).toString();
            this.acroField.setDefaultAppearance(newDa);
        }
        return widget;
    };
    PDFField.prototype.updateWidgetAppearanceWithFont = function (widget, font, _a) {
        var normal = _a.normal, rollover = _a.rollover, down = _a.down;
        this.updateWidgetAppearances(widget, {
            normal: this.createAppearanceStream(widget, normal, font),
            rollover: rollover && this.createAppearanceStream(widget, rollover, font),
            down: down && this.createAppearanceStream(widget, down, font),
        });
    };
    PDFField.prototype.updateOnOffWidgetAppearance = function (widget, onValue, _a) {
        var normal = _a.normal, rollover = _a.rollover, down = _a.down;
        this.updateWidgetAppearances(widget, {
            normal: this.createAppearanceDict(widget, normal, onValue),
            rollover: rollover && this.createAppearanceDict(widget, rollover, onValue),
            down: down && this.createAppearanceDict(widget, down, onValue),
        });
    };
    PDFField.prototype.updateWidgetAppearances = function (widget, _a) {
        var normal = _a.normal, rollover = _a.rollover, down = _a.down;
        widget.setNormalAppearance(normal);
        if (rollover) {
            widget.setRolloverAppearance(rollover);
        }
        else {
            widget.removeRolloverAppearance();
        }
        if (down) {
            widget.setDownAppearance(down);
        }
        else {
            widget.removeDownAppearance();
        }
    };
    // // TODO: Do we need to do this...?
    // private foo(font: PDFFont, dict: PDFDict) {
    //   if (!dict.lookup(PDFName.of('DR'))) {
    //     dict.set(PDFName.of('DR'), dict.context.obj({}));
    //   }
    //   const DR = dict.lookup(PDFName.of('DR'), PDFDict);
    //   if (!DR.lookup(PDFName.of('Font'))) {
    //     DR.set(PDFName.of('Font'), dict.context.obj({}));
    //   }
    //   const Font = DR.lookup(PDFName.of('Font'), PDFDict);
    //   Font.set(PDFName.of(font.name), font.ref);
    // }
    PDFField.prototype.createAppearanceStream = function (widget, appearance, font) {
        var _a;
        var context = this.acroField.dict.context;
        var _b = widget.getRectangle(), width = _b.width, height = _b.height;
        // TODO: Do we need to do this...?
        // if (font) {
        //   this.foo(font, widget.dict);
        //   this.foo(font, this.doc.getForm().acroForm.dict);
        // }
        // END TODO
        var Resources = font && { Font: (_a = {}, _a[font.name] = font.ref, _a) };
        var stream = context.formXObject(appearance, {
            Resources: Resources,
            BBox: context.obj([0, 0, width, height]),
            Matrix: context.obj([1, 0, 0, 1, 0, 0]),
        });
        var streamRef = context.register(stream);
        return streamRef;
    };
    /**
     * Create a FormXObject of the supplied image and add it to context.
     * The FormXObject size is calculated based on the widget (including
     * the alignment).
     * @param widget The widget that should display the image.
     * @param alignment The alignment of the image.
     * @param image The image that should be displayed.
     * @returns The ref for the FormXObject that was added to the context.
     */
    PDFField.prototype.createImageAppearanceStream = function (widget, image, alignment) {
        // NOTE: This implementation doesn't handle image borders.
        // NOTE: Acrobat seems to resize the image (maybe even skewing its aspect
        //       ratio) to fit perfectly within the widget's rectangle. This method
        //       does not currently do that. Should there be an option for that?
        var _a;
        var _b;
        var context = this.acroField.dict.context;
        var rectangle = widget.getRectangle();
        var ap = widget.getAppearanceCharacteristics();
        var bs = widget.getBorderStyle();
        var borderWidth = (_b = bs === null || bs === void 0 ? void 0 : bs.getWidth()) !== null && _b !== void 0 ? _b : 0;
        var rotation = rotations_1.reduceRotation(ap === null || ap === void 0 ? void 0 : ap.getRotation());
        var rotate = operations_1.rotateInPlace(tslib_1.__assign(tslib_1.__assign({}, rectangle), { rotation: rotation }));
        var adj = rotations_1.adjustDimsForRotation(rectangle, rotation);
        var imageDims = image.scaleToFit(adj.width - borderWidth * 2, adj.height - borderWidth * 2);
        // Support borders on images and maybe other properties
        var options = {
            x: borderWidth,
            y: borderWidth,
            width: imageDims.width,
            height: imageDims.height,
            //
            rotate: rotations_1.degrees(0),
            xSkew: rotations_1.degrees(0),
            ySkew: rotations_1.degrees(0),
        };
        if (alignment === image_1.ImageAlignment.Center) {
            options.x += (adj.width - borderWidth * 2) / 2 - imageDims.width / 2;
            options.y += (adj.height - borderWidth * 2) / 2 - imageDims.height / 2;
        }
        else if (alignment === image_1.ImageAlignment.Right) {
            options.x = adj.width - borderWidth - imageDims.width;
            options.y = adj.height - borderWidth - imageDims.height;
        }
        var imageName = this.doc.context.addRandomSuffix('Image', 10);
        var appearance = tslib_1.__spreadArrays(rotate, operations_1.drawImage(imageName, options));
        ////////////
        var Resources = { XObject: (_a = {}, _a[imageName] = image.ref, _a) };
        var stream = context.formXObject(appearance, {
            Resources: Resources,
            BBox: context.obj([0, 0, rectangle.width, rectangle.height]),
            Matrix: context.obj([1, 0, 0, 1, 0, 0]),
        });
        return context.register(stream);
    };
    PDFField.prototype.createAppearanceDict = function (widget, appearance, onValue) {
        var context = this.acroField.dict.context;
        var onStreamRef = this.createAppearanceStream(widget, appearance.on);
        var offStreamRef = this.createAppearanceStream(widget, appearance.off);
        var appearanceDict = context.obj({});
        appearanceDict.set(onValue, onStreamRef);
        appearanceDict.set(core_1.PDFName.of('Off'), offStreamRef);
        return appearanceDict;
    };
    return PDFField;
}());
exports.default = PDFField;
//# sourceMappingURL=PDFField.js.map