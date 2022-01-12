"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFPage_1 = tslib_1.__importDefault(require("../PDFPage"));
var PDFField_1 = tslib_1.__importStar(require("./PDFField"));
var appearances_1 = require("./appearances");
var colors_1 = require("../colors");
var rotations_1 = require("../rotations");
var core_1 = require("../../core");
var utils_1 = require("../../utils");
/**
 * Represents a radio group field of a [[PDFForm]].
 *
 * [[PDFRadioGroup]] fields are collections of radio buttons. The purpose of a
 * radio group is to enable users to select one option from a set of mutually
 * exclusive choices. Each choice in a radio group is represented by a radio
 * button. Radio buttons each have two states: `on` and `off`. At most one
 * radio button in a group may be in the `on` state at any time. Users can
 * click on a radio button to select it (and thereby automatically deselect any
 * other radio button that might have already been selected). Some radio
 * groups allow users to toggle a selected radio button `off` by clicking on
 * it (see [[PDFRadioGroup.isOffToggleable]]).
 *
 * Note that some radio groups allow multiple radio buttons to be in the `on`
 * state at the same type **if** they represent the same underlying value (see
 * [[PDFRadioGroup.isMutuallyExclusive]]).
 */
var PDFRadioGroup = /** @class */ (function (_super) {
    tslib_1.__extends(PDFRadioGroup, _super);
    function PDFRadioGroup(acroRadioButton, ref, doc) {
        var _this = _super.call(this, acroRadioButton, ref, doc) || this;
        utils_1.assertIs(acroRadioButton, 'acroRadioButton', [
            [core_1.PDFAcroRadioButton, 'PDFAcroRadioButton'],
        ]);
        _this.acroField = acroRadioButton;
        return _this;
    }
    /**
     * Get the list of available options for this radio group. Each option is
     * represented by a radio button. These radio buttons are displayed at
     * various locations in the document, potentially on different pages (though
     * typically they are stacked horizontally or vertically on the same page).
     * For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * const options = radioGroup.getOptions()
     * console.log('Radio Group options:', options)
     * ```
     * @returns The options for this radio group.
     */
    PDFRadioGroup.prototype.getOptions = function () {
        var exportValues = this.acroField.getExportValues();
        if (exportValues) {
            var exportOptions = new Array(exportValues.length);
            for (var idx = 0, len = exportValues.length; idx < len; idx++) {
                exportOptions[idx] = exportValues[idx].decodeText();
            }
            return exportOptions;
        }
        var onValues = this.acroField.getOnValues();
        var onOptions = new Array(onValues.length);
        for (var idx = 0, len = onOptions.length; idx < len; idx++) {
            onOptions[idx] = onValues[idx].decodeText();
        }
        return onOptions;
    };
    /**
     * Get the selected option for this radio group. The selected option is
     * represented by the radio button in this group that is turned on. At most
     * one radio button in a group can be selected. If no buttons in this group
     * are selected, `undefined` is returned.
     * For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * const selected = radioGroup.getSelected()
     * console.log('Selected radio button:', selected)
     * ```
     * @returns The selected option for this radio group.
     */
    PDFRadioGroup.prototype.getSelected = function () {
        var value = this.acroField.getValue();
        if (value === core_1.PDFName.of('Off'))
            return undefined;
        var exportValues = this.acroField.getExportValues();
        if (exportValues) {
            var onValues = this.acroField.getOnValues();
            for (var idx = 0, len = onValues.length; idx < len; idx++) {
                if (onValues[idx] === value)
                    return exportValues[idx].decodeText();
            }
        }
        return value.decodeText();
    };
    // // TODO: Figure out why this seems to crash Acrobat. Maybe it's because we
    // //       aren't removing the widget reference from the page's Annots?
    // removeOption(option: string) {
    //   assertIs(option, 'option', ['string']);
    //   // TODO: Assert is valid `option`!
    //   const onValues = this.acroField.getOnValues();
    //   const exportValues = this.acroField.getExportValues();
    //   if (exportValues) {
    //     for (let idx = 0, len = exportValues.length; idx < len; idx++) {
    //       if (exportValues[idx].decodeText() === option) {
    //         this.acroField.removeWidget(idx);
    //         this.acroField.removeExportValue(idx);
    //       }
    //     }
    //   } else {
    //     for (let idx = 0, len = onValues.length; idx < len; idx++) {
    //       const value = onValues[idx];
    //       if (value.decodeText() === option) {
    //         this.acroField.removeWidget(idx);
    //         this.acroField.removeExportValue(idx);
    //       }
    //     }
    //   }
    // }
    /**
     * Select an option for this radio group. This operation is analogous to a
     * human user clicking one of the radio buttons in this group via a PDF
     * reader to toggle it on. This method will update the underlying state of
     * the radio group to indicate which option has been selected. PDF libraries
     * and readers will be able to extract this value from the saved document and
     * determine which option was selected.
     *
     * For example:
     * ```js
     * const radioGroup = form.getRadioGroup('best.superhero.radioGroup')
     * radioGroup.select('One Punch Man')
     * ```
     *
     * This method will mark this radio group as dirty, causing its appearance
     * streams to be updated when either [[PDFDocument.save]] or
     * [[PDFForm.updateFieldAppearances]] is called. The updated appearance
     * streams will display a dot inside the widget of this check box field
     * that represents the selected option.
     *
     * @param option The option to be selected.
     */
    PDFRadioGroup.prototype.select = function (option) {
        utils_1.assertIs(option, 'option', ['string']);
        var validOptions = this.getOptions();
        utils_1.assertIsOneOf(option, 'option', validOptions);
        this.markAsDirty();
        var onValues = this.acroField.getOnValues();
        var exportValues = this.acroField.getExportValues();
        if (exportValues) {
            for (var idx = 0, len = exportValues.length; idx < len; idx++) {
                if (exportValues[idx].decodeText() === option) {
                    this.acroField.setValue(onValues[idx]);
                }
            }
        }
        else {
            for (var idx = 0, len = onValues.length; idx < len; idx++) {
                var value = onValues[idx];
                if (value.decodeText() === option)
                    this.acroField.setValue(value);
            }
        }
    };
    /**
     * Clear any selected option for this dropdown. This will result in all
     * radio buttons in this group being toggled off. This method will update
     * the underlying state of the dropdown to indicate that no radio buttons
     * have been selected.
     * For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * radioGroup.clear()
     * ```
     * This method will mark this radio group as dirty. See
     * [[PDFRadioGroup.select]] for more details about what this means.
     */
    PDFRadioGroup.prototype.clear = function () {
        this.markAsDirty();
        this.acroField.setValue(core_1.PDFName.of('Off'));
    };
    /**
     * Returns `true` if users can click on radio buttons in this group to toggle
     * them off. The alternative is that once a user clicks on a radio button
     * to select it, the only way to deselect it is by selecting on another radio
     * button in the group. See [[PDFRadioGroup.enableOffToggling]] and
     * [[PDFRadioGroup.disableOffToggling]]. For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * if (radioGroup.isOffToggleable()) console.log('Off toggling is enabled')
     * ```
     */
    PDFRadioGroup.prototype.isOffToggleable = function () {
        return !this.acroField.hasFlag(core_1.AcroButtonFlags.NoToggleToOff);
    };
    /**
     * Allow users to click on selected radio buttons in this group to toggle
     * them off. For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * radioGroup.enableOffToggling()
     * ```
     * > **NOTE:** This feature is documented in the PDF specification
     * > (Table 226). However, most PDF readers do not respect this option and
     * > prevent users from toggling radio buttons off even when it is enabled.
     * > At the time of this writing (9/6/2020) Mac's Preview software did
     * > respect the option. Adobe Acrobat, Foxit Reader, and Google Chrome did
     * > not.
     */
    PDFRadioGroup.prototype.enableOffToggling = function () {
        this.acroField.setFlagTo(core_1.AcroButtonFlags.NoToggleToOff, false);
    };
    /**
     * Prevent users from clicking on selected radio buttons in this group to
     * toggle them off. Clicking on a selected radio button will have no effect.
     * The only way to deselect a selected radio button is to click on a
     * different radio button in the group. For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * radioGroup.disableOffToggling()
     * ```
     */
    PDFRadioGroup.prototype.disableOffToggling = function () {
        this.acroField.setFlagTo(core_1.AcroButtonFlags.NoToggleToOff, true);
    };
    /**
     * Returns `true` if the radio buttons in this group are mutually exclusive.
     * This means that when the user selects a radio button, only that specific
     * button will be turned on. Even if other radio buttons in the group
     * represent the same value, they will not be enabled. The alternative to
     * this is that clicking a radio button will select that button along with
     * any other radio buttons in the group that share the same value. See
     * [[PDFRadioGroup.enableMutualExclusion]] and
     * [[PDFRadioGroup.disableMutualExclusion]].
     * For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * if (radioGroup.isMutuallyExclusive()) console.log('Mutual exclusion is enabled')
     * ```
     */
    PDFRadioGroup.prototype.isMutuallyExclusive = function () {
        return !this.acroField.hasFlag(core_1.AcroButtonFlags.RadiosInUnison);
    };
    /**
     * When the user clicks a radio button in this group it will be selected. In
     * addition, any other radio buttons in this group that share the same
     * underlying value will also be selected. For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * radioGroup.enableMutualExclusion()
     * ```
     * Note that this option must be enabled prior to adding options to the
     * radio group. It does not currently apply retroactively to existing
     * radio buttons in the group.
     */
    PDFRadioGroup.prototype.enableMutualExclusion = function () {
        this.acroField.setFlagTo(core_1.AcroButtonFlags.RadiosInUnison, false);
    };
    /**
     * When the user clicks a radio button in this group only it will be selected.
     * No other radio buttons in the group will be selected, even if they share
     * the same underlying value. For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * radioGroup.disableMutualExclusion()
     * ```
     * Note that this option must be disabled prior to adding options to the
     * radio group. It does not currently apply retroactively to existing
     * radio buttons in the group.
     */
    PDFRadioGroup.prototype.disableMutualExclusion = function () {
        this.acroField.setFlagTo(core_1.AcroButtonFlags.RadiosInUnison, true);
    };
    /**
     * Add a new radio button to this group on the specified page. For example:
     * ```js
     * const page = pdfDoc.addPage()
     *
     * const form = pdfDoc.getForm()
     * const radioGroup = form.createRadioGroup('best.gundam')
     *
     * const options = {
     *   x: 50,
     *   width: 25,
     *   height: 25,
     *   textColor: rgb(1, 0, 0),
     *   backgroundColor: rgb(0, 1, 0),
     *   borderColor: rgb(0, 0, 1),
     *   borderWidth: 2,
     *   rotate: degrees(90),
     * }
     *
     * radioGroup.addOptionToPage('Exia', page, { ...options, y: 50 })
     * radioGroup.addOptionToPage('Dynames', page, { ...options, y: 110 })
     * ```
     * This will create a new radio button widget for this radio group field.
     * @param option The option that the radio button widget represents.
     * @param page The page to which the radio button widget should be added.
     * @param options The options to be used when adding the radio button widget.
     */
    PDFRadioGroup.prototype.addOptionToPage = function (option, page, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        utils_1.assertIs(option, 'option', ['string']);
        utils_1.assertIs(page, 'page', [[PDFPage_1.default, 'PDFPage']]);
        PDFField_1.assertFieldAppearanceOptions(options);
        // Create a widget for this radio button
        var widget = this.createWidget({
            x: (_a = options === null || options === void 0 ? void 0 : options.x) !== null && _a !== void 0 ? _a : 0,
            y: (_b = options === null || options === void 0 ? void 0 : options.y) !== null && _b !== void 0 ? _b : 0,
            width: (_c = options === null || options === void 0 ? void 0 : options.width) !== null && _c !== void 0 ? _c : 50,
            height: (_d = options === null || options === void 0 ? void 0 : options.height) !== null && _d !== void 0 ? _d : 50,
            textColor: (_e = options === null || options === void 0 ? void 0 : options.textColor) !== null && _e !== void 0 ? _e : colors_1.rgb(0, 0, 0),
            backgroundColor: (_f = options === null || options === void 0 ? void 0 : options.backgroundColor) !== null && _f !== void 0 ? _f : colors_1.rgb(1, 1, 1),
            borderColor: (_g = options === null || options === void 0 ? void 0 : options.borderColor) !== null && _g !== void 0 ? _g : colors_1.rgb(0, 0, 0),
            borderWidth: (_h = options === null || options === void 0 ? void 0 : options.borderWidth) !== null && _h !== void 0 ? _h : 1,
            rotate: (_j = options === null || options === void 0 ? void 0 : options.rotate) !== null && _j !== void 0 ? _j : rotations_1.degrees(0),
            hidden: options === null || options === void 0 ? void 0 : options.hidden,
            page: page.ref,
        });
        var widgetRef = this.doc.context.register(widget.dict);
        // Add widget to this field
        var apStateValue = this.acroField.addWidgetWithOpt(widgetRef, core_1.PDFHexString.fromText(option), !this.isMutuallyExclusive());
        // Set appearance streams for widget
        widget.setAppearanceState(core_1.PDFName.of('Off'));
        this.updateWidgetAppearance(widget, apStateValue);
        // Add widget to the given page
        page.node.addAnnot(widgetRef);
    };
    /**
     * Returns `true` if any of this group's radio button widgets do not have an
     * appearance stream for their current state. For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * if (radioGroup.needsAppearancesUpdate()) console.log('Needs update')
     * ```
     * @returns Whether or not this radio group needs an appearance update.
     */
    PDFRadioGroup.prototype.needsAppearancesUpdate = function () {
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
     * Update the appearance streams for each of this group's radio button widgets
     * using the default appearance provider for radio groups. For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * radioGroup.defaultUpdateAppearances()
     * ```
     */
    PDFRadioGroup.prototype.defaultUpdateAppearances = function () {
        this.updateAppearances();
    };
    // rg.updateAppearances((field: any, widget: any) => {
    //   assert(field === rg);
    //   assert(widget instanceof PDFWidgetAnnotation);
    //   return { on: [...rectangle, ...circle], off: [...rectangle, ...circle] };
    // });
    /**
     * Update the appearance streams for each of this group's radio button widgets
     * using the given appearance provider. If no `provider` is passed, the
     * default appearance provider for radio groups will be used. For example:
     * ```js
     * const radioGroup = form.getRadioGroup('some.radioGroup.field')
     * radioGroup.updateAppearances((field, widget) => {
     *   ...
     *   return {
     *     normal: { on: drawRadioButton(...), off: drawRadioButton(...) },
     *     down: { on: drawRadioButton(...), off: drawRadioButton(...) },
     *   }
     * })
     * ```
     * @param provider Optionally, the appearance provider to be used for
     *                 generating the contents of the appearance streams.
     */
    PDFRadioGroup.prototype.updateAppearances = function (provider) {
        utils_1.assertOrUndefined(provider, 'provider', [Function]);
        var widgets = this.acroField.getWidgets();
        for (var idx = 0, len = widgets.length; idx < len; idx++) {
            var widget = widgets[idx];
            var onValue = widget.getOnValue();
            if (!onValue)
                continue;
            this.updateWidgetAppearance(widget, onValue, provider);
        }
    };
    PDFRadioGroup.prototype.updateWidgetAppearance = function (widget, onValue, provider) {
        var apProvider = provider !== null && provider !== void 0 ? provider : appearances_1.defaultRadioGroupAppearanceProvider;
        var appearances = appearances_1.normalizeAppearance(apProvider(this, widget));
        this.updateOnOffWidgetAppearance(widget, onValue, appearances);
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFForm.getOptionList]] method, which will create an
     * > instance of [[PDFOptionList]] for you.
     *
     * Create an instance of [[PDFOptionList]] from an existing acroRadioButton
     * and ref
     *
     * @param acroRadioButton The underlying `PDFAcroRadioButton` for this
     *                        radio group.
     * @param ref The unique reference for this radio group.
     * @param doc The document to which this radio group will belong.
     */
    PDFRadioGroup.of = function (acroRadioButton, ref, doc) { return new PDFRadioGroup(acroRadioButton, ref, doc); };
    return PDFRadioGroup;
}(PDFField_1.default));
exports.default = PDFRadioGroup;
//# sourceMappingURL=PDFRadioGroup.js.map