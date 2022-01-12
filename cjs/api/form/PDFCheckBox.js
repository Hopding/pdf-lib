"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFPage_1 = tslib_1.__importDefault(require("../PDFPage"));
var appearances_1 = require("./appearances");
var colors_1 = require("../colors");
var rotations_1 = require("../rotations");
var PDFField_1 = tslib_1.__importStar(require("./PDFField"));
var core_1 = require("../../core");
var utils_1 = require("../../utils");
/**
 * Represents a check box field of a [[PDFForm]].
 *
 * [[PDFCheckBox]] fields are interactive boxes that users can click with their
 * mouse. This type of [[PDFField]] has two states: `on` and `off`. The purpose
 * of a check box is to enable users to select from one or more options, where
 * each option is represented by a single check box. Check boxes are typically
 * square in shape and display a check mark when they are in the `on` state.
 */
var PDFCheckBox = /** @class */ (function (_super) {
    tslib_1.__extends(PDFCheckBox, _super);
    function PDFCheckBox(acroCheckBox, ref, doc) {
        var _this = _super.call(this, acroCheckBox, ref, doc) || this;
        utils_1.assertIs(acroCheckBox, 'acroCheckBox', [
            [core_1.PDFAcroCheckBox, 'PDFAcroCheckBox'],
        ]);
        _this.acroField = acroCheckBox;
        return _this;
    }
    /**
     * Mark this check box. This operation is analogous to a human user clicking
     * a check box to fill it in a PDF reader. This method will update the
     * underlying state of the check box field to indicate it has been selected.
     * PDF libraries and readers will be able to extract this value from the
     * saved document and determine that it was selected.
     *
     * For example:
     * ```js
     * const checkBox = form.getCheckBox('some.checkBox.field')
     * checkBox.check()
     * ```
     *
     * This method will mark this check box as dirty, causing its appearance
     * streams to be updated when either [[PDFDocument.save]] or
     * [[PDFForm.updateFieldAppearances]] is called. The updated appearance
     * streams will display a check mark inside the widgets of this check box
     * field.
     */
    PDFCheckBox.prototype.check = function () {
        var _a;
        var onValue = (_a = this.acroField.getOnValue()) !== null && _a !== void 0 ? _a : core_1.PDFName.of('Yes');
        this.markAsDirty();
        this.acroField.setValue(onValue);
    };
    /**
     * Clears this check box. This operation is analogous to a human user clicking
     * a check box to unmark it in a PDF reader. This method will update the
     * underlying state of the check box field to indicate it has been deselected.
     * PDF libraries and readers will be able to extract this value from the
     * saved document and determine that it was not selected.
     *
     * For example:
     * ```js
     * const checkBox = form.getCheckBox('some.checkBox.field')
     * checkBox.uncheck()
     * ```
     *
     * This method will mark this check box as dirty. See [[PDFCheckBox.check]]
     * for more details about what this means.
     */
    PDFCheckBox.prototype.uncheck = function () {
        this.markAsDirty();
        this.acroField.setValue(core_1.PDFName.of('Off'));
    };
    /**
     * Returns `true` if this check box is selected (either by a human user via
     * a PDF reader, or else programmatically via software). For example:
     * ```js
     * const checkBox = form.getCheckBox('some.checkBox.field')
     * if (checkBox.isChecked()) console.log('check box is selected')
     * ```
     * @returns Whether or not this check box is selected.
     */
    PDFCheckBox.prototype.isChecked = function () {
        var onValue = this.acroField.getOnValue();
        return !!onValue && onValue === this.acroField.getValue();
    };
    /**
     * Show this check box on the specified page. For example:
     * ```js
     * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const page = pdfDoc.addPage()
     *
     * const form = pdfDoc.getForm()
     * const checkBox = form.createCheckBox('some.checkBox.field')
     *
     * checkBox.addToPage(page, {
     *   x: 50,
     *   y: 75,
     *   width: 25,
     *   height: 25,
     *   textColor: rgb(1, 0, 0),
     *   backgroundColor: rgb(0, 1, 0),
     *   borderColor: rgb(0, 0, 1),
     *   borderWidth: 2,
     *   rotate: degrees(90),
     * })
     * ```
     * This will create a new widget for this check box field.
     * @param page The page to which this check box widget should be added.
     * @param options The options to be used when adding this check box widget.
     */
    PDFCheckBox.prototype.addToPage = function (page, options) {
        var _a, _b, _c, _d, _e, _f;
        utils_1.assertIs(page, 'page', [[PDFPage_1.default, 'PDFPage']]);
        PDFField_1.assertFieldAppearanceOptions(options);
        if (!options)
            options = {};
        if (!('textColor' in options))
            options.textColor = colors_1.rgb(0, 0, 0);
        if (!('backgroundColor' in options))
            options.backgroundColor = colors_1.rgb(1, 1, 1);
        if (!('borderColor' in options))
            options.borderColor = colors_1.rgb(0, 0, 0);
        if (!('borderWidth' in options))
            options.borderWidth = 1;
        // Create a widget for this check box
        var widget = this.createWidget({
            x: (_a = options.x) !== null && _a !== void 0 ? _a : 0,
            y: (_b = options.y) !== null && _b !== void 0 ? _b : 0,
            width: (_c = options.width) !== null && _c !== void 0 ? _c : 50,
            height: (_d = options.height) !== null && _d !== void 0 ? _d : 50,
            textColor: options.textColor,
            backgroundColor: options.backgroundColor,
            borderColor: options.borderColor,
            borderWidth: (_e = options.borderWidth) !== null && _e !== void 0 ? _e : 0,
            rotate: (_f = options.rotate) !== null && _f !== void 0 ? _f : rotations_1.degrees(0),
            hidden: options.hidden,
            page: page.ref,
        });
        var widgetRef = this.doc.context.register(widget.dict);
        // Add widget to this field
        this.acroField.addWidget(widgetRef);
        // Set appearance streams for widget
        widget.setAppearanceState(core_1.PDFName.of('Off'));
        this.updateWidgetAppearance(widget, core_1.PDFName.of('Yes'));
        // Add widget to the given page
        page.node.addAnnot(widgetRef);
    };
    /**
     * Returns `true` if any of this check box's widgets do not have an
     * appearance stream for its current state. For example:
     * ```js
     * const checkBox = form.getCheckBox('some.checkBox.field')
     * if (checkBox.needsAppearancesUpdate()) console.log('Needs update')
     * ```
     * @returns Whether or not this check box needs an appearance update.
     */
    PDFCheckBox.prototype.needsAppearancesUpdate = function () {
        var _a;
        var widgets = this.acroField.getWidgets();
        for (var idx = 0, len = widgets.length; idx < len; idx++) {
            var widget = widgets[idx];
            var state = widget.getAppearanceState();
            var normal = (_a = widget.getAppearances()) === null || _a === void 0 ? void 0 : _a.normal;
            if (!(normal instanceof core_1.PDFDict))
                return true;
            if (state && !normal.has(state))
                return true;
        }
        return false;
    };
    /**
     * Update the appearance streams for each of this check box's widgets using
     * the default appearance provider for check boxes. For example:
     * ```js
     * const checkBox = form.getCheckBox('some.checkBox.field')
     * checkBox.defaultUpdateAppearances()
     * ```
     */
    PDFCheckBox.prototype.defaultUpdateAppearances = function () {
        this.updateAppearances();
    };
    /**
     * Update the appearance streams for each of this check box's widgets using
     * the given appearance provider. If no `provider` is passed, the default
     * appearance provider for check boxs will be used. For example:
     * ```js
     * const checkBox = form.getCheckBox('some.checkBox.field')
     * checkBox.updateAppearances((field, widget) => {
     *   ...
     *   return {
     *     normal: { on: drawCheckBox(...), off: drawCheckBox(...) },
     *     down: { on: drawCheckBox(...), off: drawCheckBox(...) },
     *   }
     * })
     * ```
     * @param provider Optionally, the appearance provider to be used for
     *                 generating the contents of the appearance streams.
     */
    PDFCheckBox.prototype.updateAppearances = function (provider) {
        var _a;
        utils_1.assertOrUndefined(provider, 'provider', [Function]);
        var widgets = this.acroField.getWidgets();
        for (var idx = 0, len = widgets.length; idx < len; idx++) {
            var widget = widgets[idx];
            var onValue = (_a = widget.getOnValue()) !== null && _a !== void 0 ? _a : core_1.PDFName.of('Yes');
            if (!onValue)
                continue;
            this.updateWidgetAppearance(widget, onValue, provider);
        }
        this.markAsClean();
    };
    PDFCheckBox.prototype.updateWidgetAppearance = function (widget, onValue, provider) {
        var apProvider = provider !== null && provider !== void 0 ? provider : appearances_1.defaultCheckBoxAppearanceProvider;
        var appearances = appearances_1.normalizeAppearance(apProvider(this, widget));
        this.updateOnOffWidgetAppearance(widget, onValue, appearances);
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFForm.getCheckBox]] method, which will create an
     * > instance of [[PDFCheckBox]] for you.
     *
     * Create an instance of [[PDFCheckBox]] from an existing acroCheckBox and ref
     *
     * @param acroCheckBox The underlying `PDFAcroCheckBox` for this check box.
     * @param ref The unique reference for this check box.
     * @param doc The document to which this check box will belong.
     */
    PDFCheckBox.of = function (acroCheckBox, ref, doc) {
        return new PDFCheckBox(acroCheckBox, ref, doc);
    };
    return PDFCheckBox;
}(PDFField_1.default));
exports.default = PDFCheckBox;
//# sourceMappingURL=PDFCheckBox.js.map