"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFPage_1 = tslib_1.__importDefault(require("../PDFPage"));
var PDFFont_1 = tslib_1.__importDefault(require("../PDFFont"));
var PDFField_1 = tslib_1.__importStar(require("./PDFField"));
var appearances_1 = require("./appearances");
var colors_1 = require("../colors");
var rotations_1 = require("../rotations");
var core_1 = require("../../core");
var utils_1 = require("../../utils");
/**
 * Represents an option list field of a [[PDFForm]].
 *
 * [[PDFOptionList]] fields are interactive lists of options. The purpose of an
 * option list is to enable users to select one or more options from a set of
 * possible options. Users are able to see the full set of options without
 * first having to click on the field (though scrolling may be necessary).
 * Clicking an option in the list will cause it to be selected and displayed
 * with a highlighted background. Some option lists allow users to select
 * more than one option (see [[PDFOptionList.isMultiselect]]).
 */
var PDFOptionList = /** @class */ (function (_super) {
    tslib_1.__extends(PDFOptionList, _super);
    function PDFOptionList(acroListBox, ref, doc) {
        var _this = _super.call(this, acroListBox, ref, doc) || this;
        utils_1.assertIs(acroListBox, 'acroListBox', [[core_1.PDFAcroListBox, 'PDFAcroListBox']]);
        _this.acroField = acroListBox;
        return _this;
    }
    /**
     * Get the list of available options for this option list. These options will
     * be displayed to users who view this option list in a PDF reader.
     * For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * const options = optionList.getOptions()
     * console.log('Option List options:', options)
     * ```
     * @returns The options for this option list.
     */
    PDFOptionList.prototype.getOptions = function () {
        var rawOptions = this.acroField.getOptions();
        var options = new Array(rawOptions.length);
        for (var idx = 0, len = options.length; idx < len; idx++) {
            var _a = rawOptions[idx], display = _a.display, value = _a.value;
            options[idx] = (display !== null && display !== void 0 ? display : value).decodeText();
        }
        return options;
    };
    /**
     * Get the selected options for this option list. These are the values that
     * were selected by a human user via a PDF reader, or programatically via
     * software.
     * For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * const selections = optionList.getSelected()
     * console.log('Option List selections:', selections)
     * ```
     * @returns The selected options for this option list.
     */
    PDFOptionList.prototype.getSelected = function () {
        var values = this.acroField.getValues();
        var selected = new Array(values.length);
        for (var idx = 0, len = values.length; idx < len; idx++) {
            selected[idx] = values[idx].decodeText();
        }
        return selected;
    };
    /**
     * Set the list of options that are available for this option list. These are
     * the values that will be available for users to select when they view this
     * option list in a PDF reader. Note that preexisting options for this
     * option list will be removed. Only the values passed as `options` will be
     * available to select.
     *
     * For example:
     * ```js
     * const optionList = form.getOptionList('planets.optionList')
     * optionList.setOptions(['Earth', 'Mars', 'Pluto', 'Venus'])
     * ```
     *
     * This method will mark this option list as dirty, causing its appearance
     * streams to be updated when either [[PDFDocument.save]] or
     * [[PDFForm.updateFieldAppearances]] is called. The updated streams will
     * display the options this field contains inside the widgets of this text
     * field (with selected options highlighted).
     *
     * **IMPORTANT:** The default font used to update appearance streams is
     * [[StandardFonts.Helvetica]]. Note that this is a WinAnsi font. This means
     * that encoding errors will be thrown if this field contains any options
     * with characters outside the WinAnsi character set (the latin alphabet).
     *
     * Embedding a custom font and passing it to
     * [[PDFForm.updateFieldAppearances]] or [[PDFOptionList.updateAppearances]]
     * allows you to generate appearance streams with characters outside the
     * latin alphabet (assuming the custom font supports them).
     *
     * @param options The options that should be available in this option list.
     */
    PDFOptionList.prototype.setOptions = function (options) {
        utils_1.assertIs(options, 'options', [Array]);
        this.markAsDirty();
        var optionObjects = new Array(options.length);
        for (var idx = 0, len = options.length; idx < len; idx++) {
            optionObjects[idx] = { value: core_1.PDFHexString.fromText(options[idx]) };
        }
        this.acroField.setOptions(optionObjects);
    };
    /**
     * Add to the list of options that are available for this option list. Users
     * will be able to select these values in a PDF reader. In addition to the
     * values passed as `options`, any preexisting options for this option list
     * will still be available for users to select.
     * For example:
     * ```js
     * const optionList = form.getOptionList('rockets.optionList')
     * optionList.addOptions(['Saturn IV', 'Falcon Heavy'])
     * ```
     * This method will mark this option list as dirty. See
     * [[PDFOptionList.setOptions]] for more details about what this means.
     * @param options New options that should be available in this option list.
     */
    PDFOptionList.prototype.addOptions = function (options) {
        utils_1.assertIs(options, 'options', ['string', Array]);
        this.markAsDirty();
        var optionsArr = Array.isArray(options) ? options : [options];
        var existingOptions = this.acroField.getOptions();
        var newOptions = new Array(optionsArr.length);
        for (var idx = 0, len = optionsArr.length; idx < len; idx++) {
            newOptions[idx] = { value: core_1.PDFHexString.fromText(optionsArr[idx]) };
        }
        this.acroField.setOptions(existingOptions.concat(newOptions));
    };
    /**
     * Select one or more values for this option list. This operation is analogous
     * to a human user opening the option list in a PDF reader and clicking on one
     * or more values to select them. This method will update the underlying state
     * of the option list to indicate which values have been selected. PDF
     * libraries and readers will be able to extract these values from the saved
     * document and determine which values were selected.
     * For example:
     * ```js
     * const optionList = form.getOptionList('best.superheroes.optionList')
     * optionList.select(['One Punch Man', 'Iron Man'])
     * ```
     * This method will mark this option list as dirty. See
     * [[PDFOptionList.setOptions]] for more details about what this means.
     * @param options The options to be selected.
     * @param merge Whether or not existing selections should be preserved.
     */
    PDFOptionList.prototype.select = function (options, merge) {
        if (merge === void 0) { merge = false; }
        utils_1.assertIs(options, 'options', ['string', Array]);
        utils_1.assertIs(merge, 'merge', ['boolean']);
        var optionsArr = Array.isArray(options) ? options : [options];
        var validOptions = this.getOptions();
        utils_1.assertIsSubset(optionsArr, 'option', validOptions);
        this.markAsDirty();
        if (optionsArr.length > 1 || (optionsArr.length === 1 && merge)) {
            this.enableMultiselect();
        }
        var values = new Array(optionsArr.length);
        for (var idx = 0, len = optionsArr.length; idx < len; idx++) {
            values[idx] = core_1.PDFHexString.fromText(optionsArr[idx]);
        }
        if (merge) {
            var existingValues = this.acroField.getValues();
            this.acroField.setValues(existingValues.concat(values));
        }
        else {
            this.acroField.setValues(values);
        }
    };
    /**
     * Clear all selected values for this option list. This operation is
     * equivalent to selecting an empty list. This method will update the
     * underlying state of the option list to indicate that no values have been
     * selected.
     * For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.clear()
     * ```
     * This method will mark this option list as dirty. See
     * [[PDFOptionList.setOptions]] for more details about what this means.
     */
    PDFOptionList.prototype.clear = function () {
        this.markAsDirty();
        this.acroField.setValues([]);
    };
    /**
     * Set the font size for the text in this field. There needs to be a
     * default appearance string (DA) set with a font value specified
     * for this to work. For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.setFontSize(4);
     * ```
     * @param fontSize The font size to set the font to.
     */
    /**
     * Set the font size for this field. Larger font sizes will result in larger
     * text being displayed when PDF readers render this option list. Font sizes
     * may be integer or floating point numbers. Supplying a negative font size
     * will cause this method to throw an error.
     *
     * For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.setFontSize(4)
     * optionList.setFontSize(15.7)
     * ```
     *
     * > This method depends upon the existence of a default appearance
     * > (`/DA`) string. If this field does not have a default appearance string,
     * > or that string does not contain a font size (via the `Tf` operator),
     * > then this method will throw an error.
     *
     * @param fontSize The font size to be used when rendering text in this field.
     */
    PDFOptionList.prototype.setFontSize = function (fontSize) {
        utils_1.assertPositive(fontSize, 'fontSize');
        this.acroField.setFontSize(fontSize);
        this.markAsDirty();
    };
    /**
     * Returns `true` if the options of this option list are always displayed
     * in alphabetical order, irrespective of the order in which the options
     * were added to the option list. See [[PDFOptionList.enableSorting]] and
     * [[PDFOptionList.disableSorting]]. For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * if (optionList.isSorted()) console.log('Sorting is enabled')
     * ```
     * @returns Whether or not this option list is sorted.
     */
    PDFOptionList.prototype.isSorted = function () {
        return this.acroField.hasFlag(core_1.AcroChoiceFlags.Sort);
    };
    /**
     * Always display the options of this option list in alphabetical order,
     * irrespective of the order in which the options were added to this option
     * list.
     * For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.enableSorting()
     * ```
     */
    PDFOptionList.prototype.enableSorting = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.Sort, true);
    };
    /**
     * Do not always display the options of this option list in alphabetical
     * order. Instead, display the options in whichever order they were added
     * to this option list. For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.disableSorting()
     * ```
     */
    PDFOptionList.prototype.disableSorting = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.Sort, false);
    };
    /**
     * Returns `true` if multiple options can be selected from this option list.
     * See [[PDFOptionList.enableMultiselect]] and
     * [[PDFOptionList.disableMultiselect]]. For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * if (optionList.isMultiselect()) console.log('Multiselect is enabled')
     * ```
     * @returns Whether or not multiple options can be selected.
     */
    PDFOptionList.prototype.isMultiselect = function () {
        return this.acroField.hasFlag(core_1.AcroChoiceFlags.MultiSelect);
    };
    /**
     * Allow users to select more than one option from this option list.
     * For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.enableMultiselect()
     * ```
     */
    PDFOptionList.prototype.enableMultiselect = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.MultiSelect, true);
    };
    /**
     * Do not allow users to select more than one option from this option list.
     * For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.disableMultiselect()
     * ```
     */
    PDFOptionList.prototype.disableMultiselect = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.MultiSelect, false);
    };
    /**
     * Returns `true` if the option selected by a user is stored, or "committed",
     * when the user clicks the option. The alternative is that the user's
     * selection is stored when the user leaves this option list field (by
     * clicking outside of it - on another field, for example). See
     * [[PDFOptionList.enableSelectOnClick]] and
     * [[PDFOptionList.disableSelectOnClick]]. For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * if (optionList.isSelectOnClick()) console.log('Select on click is enabled')
     * ```
     * @returns Whether or not options are selected immediately after they are
     *          clicked.
     */
    PDFOptionList.prototype.isSelectOnClick = function () {
        return this.acroField.hasFlag(core_1.AcroChoiceFlags.CommitOnSelChange);
    };
    /**
     * Store the option selected by a user immediately after the user clicks the
     * option. Do not wait for the user to leave this option list field (by
     * clicking outside of it - on another field, for example). For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.enableSelectOnClick()
     * ```
     */
    PDFOptionList.prototype.enableSelectOnClick = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.CommitOnSelChange, true);
    };
    /**
     * Wait to store the option selected by a user until they leave this option
     * list field (by clicking outside of it - on another field, for example).
     * For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.disableSelectOnClick()
     * ```
     */
    PDFOptionList.prototype.disableSelectOnClick = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.CommitOnSelChange, false);
    };
    /**
     * Show this option list on the specified page. For example:
     * ```js
     * const ubuntuFont = await pdfDoc.embedFont(ubuntuFontBytes)
     * const page = pdfDoc.addPage()
     *
     * const form = pdfDoc.getForm()
     * const optionList = form.createOptionList('best.gundams')
     * optionList.setOptions(['Exia', 'Dynames', 'Kyrios', 'Virtue'])
     * optionList.select(['Exia', 'Virtue'])
     *
     * optionList.addToPage(page, {
     *   x: 50,
     *   y: 75,
     *   width: 200,
     *   height: 100,
     *   textColor: rgb(1, 0, 0),
     *   backgroundColor: rgb(0, 1, 0),
     *   borderColor: rgb(0, 0, 1),
     *   borderWidth: 2,
     *   rotate: degrees(90),
     *   font: ubuntuFont,
     * })
     * ```
     * This will create a new widget for this option list field.
     * @param page The page to which this option list widget should be added.
     * @param options The options to be used when adding this option list widget.
     */
    PDFOptionList.prototype.addToPage = function (page, options) {
        var _a, _b, _c, _d, _e, _f, _g;
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
        // Create a widget for this option list
        var widget = this.createWidget({
            x: (_a = options.x) !== null && _a !== void 0 ? _a : 0,
            y: (_b = options.y) !== null && _b !== void 0 ? _b : 0,
            width: (_c = options.width) !== null && _c !== void 0 ? _c : 200,
            height: (_d = options.height) !== null && _d !== void 0 ? _d : 100,
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
        var font = (_g = options.font) !== null && _g !== void 0 ? _g : this.doc.getForm().getDefaultFont();
        this.updateWidgetAppearance(widget, font);
        // Add widget to the given page
        page.node.addAnnot(widgetRef);
    };
    /**
     * Returns `true` if this option list has been marked as dirty, or if any of
     * this option list's widgets do not have an appearance stream. For example:
     * ```js
     * const optionList = form.getOptionList('some.optionList.field')
     * if (optionList.needsAppearancesUpdate()) console.log('Needs update')
     * ```
     * @returns Whether or not this option list needs an appearance update.
     */
    PDFOptionList.prototype.needsAppearancesUpdate = function () {
        var _a;
        if (this.isDirty())
            return true;
        var widgets = this.acroField.getWidgets();
        for (var idx = 0, len = widgets.length; idx < len; idx++) {
            var widget = widgets[idx];
            var hasAppearances = ((_a = widget.getAppearances()) === null || _a === void 0 ? void 0 : _a.normal) instanceof core_1.PDFStream;
            if (!hasAppearances)
                return true;
        }
        return false;
    };
    /**
     * Update the appearance streams for each of this option list's widgets using
     * the default appearance provider for option lists. For example:
     * ```js
     * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.defaultUpdateAppearances(helvetica)
     * ```
     * @param font The font to be used for creating the appearance streams.
     */
    PDFOptionList.prototype.defaultUpdateAppearances = function (font) {
        utils_1.assertIs(font, 'font', [[PDFFont_1.default, 'PDFFont']]);
        this.updateAppearances(font);
    };
    /**
     * Update the appearance streams for each of this option list's widgets using
     * the given appearance provider. If no `provider` is passed, the default
     * appearance provider for option lists will be used. For example:
     * ```js
     * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const optionList = form.getOptionList('some.optionList.field')
     * optionList.updateAppearances(helvetica, (field, widget, font) => {
     *   ...
     *   return drawOptionList(...)
     * })
     * ```
     * @param font The font to be used for creating the appearance streams.
     * @param provider Optionally, the appearance provider to be used for
     *                 generating the contents of the appearance streams.
     */
    PDFOptionList.prototype.updateAppearances = function (font, provider) {
        utils_1.assertIs(font, 'font', [[PDFFont_1.default, 'PDFFont']]);
        utils_1.assertOrUndefined(provider, 'provider', [Function]);
        var widgets = this.acroField.getWidgets();
        for (var idx = 0, len = widgets.length; idx < len; idx++) {
            var widget = widgets[idx];
            this.updateWidgetAppearance(widget, font, provider);
        }
        this.markAsClean();
    };
    // getOption(index: number): string {}
    // getSelectedIndices(): number[] {}
    // removeOptions(option: string | string[]) {}
    // removeIndices(option: number[]) {}
    // deselect(options: string | string[]) {}
    // deselectIndices(optionIndices: number[]) {}
    PDFOptionList.prototype.updateWidgetAppearance = function (widget, font, provider) {
        var apProvider = provider !== null && provider !== void 0 ? provider : appearances_1.defaultOptionListAppearanceProvider;
        var appearances = appearances_1.normalizeAppearance(apProvider(this, widget, font));
        this.updateWidgetAppearanceWithFont(widget, font, appearances);
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFForm.getOptionList]] method, which will create
     * > an instance of [[PDFOptionList]] for you.
     *
     * Create an instance of [[PDFOptionList]] from an existing acroListBox and
     * ref
     *
     * @param acroComboBox The underlying `PDFAcroListBox` for this option list.
     * @param ref The unique reference for this option list.
     * @param doc The document to which this option list will belong.
     */
    PDFOptionList.of = function (acroListBox, ref, doc) {
        return new PDFOptionList(acroListBox, ref, doc);
    };
    return PDFOptionList;
}(PDFField_1.default));
exports.default = PDFOptionList;
//# sourceMappingURL=PDFOptionList.js.map