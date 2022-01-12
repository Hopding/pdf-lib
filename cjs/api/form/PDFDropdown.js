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
 * Represents a dropdown field of a [[PDFForm]].
 *
 * [[PDFDropdown]] fields are interactive text boxes that display a single
 * element (the currently selected value). The purpose of a dropdown is to
 * enable users to select a single option from a set of possible options. Users
 * can click on a dropdown to view the full list of options it provides.
 * Clicking on an option in the list will cause it to be selected and displayed
 * in the dropdown's text box. Some dropdowns allow users to enter text
 * directly into the box from their keyboard, rather than only being allowed to
 * choose an option from the list (see [[PDFDropdown.isEditable]]).
 */
var PDFDropdown = /** @class */ (function (_super) {
    tslib_1.__extends(PDFDropdown, _super);
    function PDFDropdown(acroComboBox, ref, doc) {
        var _this = _super.call(this, acroComboBox, ref, doc) || this;
        utils_1.assertIs(acroComboBox, 'acroComboBox', [
            [core_1.PDFAcroComboBox, 'PDFAcroComboBox'],
        ]);
        _this.acroField = acroComboBox;
        return _this;
    }
    /**
     * Get the list of available options for this dropdown. These options will be
     * displayed to users who click on this dropdown in a PDF reader.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * const options = dropdown.getOptions()
     * console.log('Dropdown options:', options)
     * ```
     * @returns The options for this dropdown.
     */
    PDFDropdown.prototype.getOptions = function () {
        var rawOptions = this.acroField.getOptions();
        var options = new Array(rawOptions.length);
        for (var idx = 0, len = options.length; idx < len; idx++) {
            var _a = rawOptions[idx], display = _a.display, value = _a.value;
            options[idx] = (display !== null && display !== void 0 ? display : value).decodeText();
        }
        return options;
    };
    /**
     * Get the selected options for this dropdown. These are the values that were
     * selected by a human user via a PDF reader, or programatically via
     * software.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * const selections = dropdown.getSelected()
     * console.log('Dropdown selections:', selections)
     * ```
     * > **NOTE:** Note that PDF readers only display one selected option when
     * > rendering dropdowns. However, the PDF specification does allow for
     * > multiple values to be selected in a dropdown. As such, the `pdf-lib`
     * > API supports this. However, in most cases the array returned by this
     * > method will contain only a single element (or no elements).
     * @returns The selected options in this dropdown.
     */
    PDFDropdown.prototype.getSelected = function () {
        var values = this.acroField.getValues();
        var selected = new Array(values.length);
        for (var idx = 0, len = values.length; idx < len; idx++) {
            selected[idx] = values[idx].decodeText();
        }
        return selected;
    };
    /**
     * Set the list of options that are available for this dropdown. These are
     * the values that will be available for users to select when they view this
     * dropdown in a PDF reader. Note that preexisting options for this dropdown
     * will be removed. Only the values passed as `options` will be available to
     * select.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('planets.dropdown')
     * dropdown.setOptions(['Earth', 'Mars', 'Pluto', 'Venus'])
     * ```
     * @param options The options that should be available in this dropdown.
     */
    PDFDropdown.prototype.setOptions = function (options) {
        utils_1.assertIs(options, 'options', [Array]);
        var optionObjects = new Array(options.length);
        for (var idx = 0, len = options.length; idx < len; idx++) {
            optionObjects[idx] = { value: core_1.PDFHexString.fromText(options[idx]) };
        }
        this.acroField.setOptions(optionObjects);
    };
    /**
     * Add to the list of options that are available for this dropdown. Users
     * will be able to select these values in a PDF reader. In addition to the
     * values passed as `options`, any preexisting options for this dropdown will
     * still be available for users to select.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('rockets.dropdown')
     * dropdown.addOptions(['Saturn IV', 'Falcon Heavy'])
     * ```
     * @param options New options that should be available in this dropdown.
     */
    PDFDropdown.prototype.addOptions = function (options) {
        utils_1.assertIs(options, 'options', ['string', Array]);
        var optionsArr = Array.isArray(options) ? options : [options];
        var existingOptions = this.acroField.getOptions();
        var newOptions = new Array(optionsArr.length);
        for (var idx = 0, len = optionsArr.length; idx < len; idx++) {
            newOptions[idx] = { value: core_1.PDFHexString.fromText(optionsArr[idx]) };
        }
        this.acroField.setOptions(existingOptions.concat(newOptions));
    };
    /**
     * Select one or more values for this dropdown. This operation is analogous
     * to a human user opening the dropdown in a PDF reader and clicking on a
     * value to select it. This method will update the underlying state of the
     * dropdown to indicate which values have been selected. PDF libraries and
     * readers will be able to extract these values from the saved document and
     * determine which values were selected.
     *
     * For example:
     * ```js
     * const dropdown = form.getDropdown('best.superhero.dropdown')
     * dropdown.select('One Punch Man')
     * ```
     *
     * This method will mark this dropdown as dirty, causing its appearance
     * streams to be updated when either [[PDFDocument.save]] or
     * [[PDFForm.updateFieldAppearances]] is called. The updated streams will
     * display the selected option inside the widgets of this dropdown.
     *
     * **IMPORTANT:** The default font used to update appearance streams is
     * [[StandardFonts.Helvetica]]. Note that this is a WinAnsi font. This means
     * that encoding errors will be thrown if the selected option for this field
     * contains characters outside the WinAnsi character set (the latin alphabet).
     *
     * Embedding a custom font and passing it to
     * [[PDFForm.updateFieldAppearances]] or [[PDFDropdown.updateAppearances]]
     * allows you to generate appearance streams with characters outside the
     * latin alphabet (assuming the custom font supports them).
     *
     * Selecting an option that does not exist in this dropdown's option list
     * (see [[PDFDropdown.getOptions]]) will enable editing on this dropdown
     * (see [[PDFDropdown.enableEditing]]).
     *
     * > **NOTE:** PDF readers only display one selected option when rendering
     * > dropdowns. However, the PDF specification does allow for multiple values
     * > to be selected in a dropdown. As such, the `pdf-lib` API supports this.
     * > However, it is not recommended to select more than one value with this
     * > method, as only one will be visible. [[PDFOptionList]] fields are better
     * > suited for displaying multiple selected values.
     *
     * @param options The options to be selected.
     * @param merge Whether or not existing selections should be preserved.
     */
    PDFDropdown.prototype.select = function (options, merge) {
        if (merge === void 0) { merge = false; }
        utils_1.assertIs(options, 'options', ['string', Array]);
        utils_1.assertIs(merge, 'merge', ['boolean']);
        var optionsArr = Array.isArray(options) ? options : [options];
        var validOptions = this.getOptions();
        var hasCustomOption = optionsArr.find(function (option) { return !validOptions.includes(option); });
        if (hasCustomOption)
            this.enableEditing();
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
     * Clear all selected values for this dropdown. This operation is equivalent
     * to selecting an empty list. This method will update the underlying state
     * of the dropdown to indicate that no values have been selected.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.clear()
     * ```
     * This method will mark this text field as dirty. See [[PDFDropdown.select]]
     * for more details about what this means.
     */
    PDFDropdown.prototype.clear = function () {
        this.markAsDirty();
        this.acroField.setValues([]);
    };
    /**
     * Set the font size for this field. Larger font sizes will result in larger
     * text being displayed when PDF readers render this dropdown. Font sizes may
     * be integer or floating point numbers. Supplying a negative font size will
     * cause this method to throw an error.
     *
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.setFontSize(4)
     * dropdown.setFontSize(15.7)
     * ```
     *
     * > This method depends upon the existence of a default appearance
     * > (`/DA`) string. If this field does not have a default appearance string,
     * > or that string does not contain a font size (via the `Tf` operator),
     * > then this method will throw an error.
     *
     * @param fontSize The font size to be used when rendering text in this field.
     */
    PDFDropdown.prototype.setFontSize = function (fontSize) {
        utils_1.assertPositive(fontSize, 'fontSize');
        this.acroField.setFontSize(fontSize);
        this.markAsDirty();
    };
    /**
     * Returns `true` if users are allowed to edit the selected value of this
     * dropdown directly and are not constrained by the list of available
     * options. See [[PDFDropdown.enableEditing]] and
     * [[PDFDropdown.disableEditing]]. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * if (dropdown.isEditable()) console.log('Editing is enabled')
     * ```
     * @returns Whether or not this dropdown is editable.
     */
    PDFDropdown.prototype.isEditable = function () {
        return this.acroField.hasFlag(core_1.AcroChoiceFlags.Edit);
    };
    /**
     * Allow users to edit the selected value of this dropdown in PDF readers
     * with their keyboard. This means that the selected value of this dropdown
     * will not be constrained by the list of available options. However, if this
     * dropdown has any available options, users will still be allowed to select
     * from that list.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.enableEditing()
     * ```
     */
    PDFDropdown.prototype.enableEditing = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.Edit, true);
    };
    /**
     * Do not allow users to edit the selected value of this dropdown in PDF
     * readers with their keyboard. This will constrain the selected value of
     * this dropdown to the list of available options. Users will only be able
     * to select an option from that list.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.disableEditing()
     * ```
     */
    PDFDropdown.prototype.disableEditing = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.Edit, false);
    };
    /**
     * Returns `true` if the option list of this dropdown is always displayed
     * in alphabetical order, irrespective of the order in which the options
     * were added to the dropdown. See [[PDFDropdown.enableSorting]] and
     * [[PDFDropdown.disableSorting]]. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * if (dropdown.isSorted()) console.log('Sorting is enabled')
     * ```
     * @returns Whether or not this dropdown's options are sorted.
     */
    PDFDropdown.prototype.isSorted = function () {
        return this.acroField.hasFlag(core_1.AcroChoiceFlags.Sort);
    };
    /**
     * Always display the option list of this dropdown in alphabetical order,
     * irrespective of the order in which the options were added to this dropdown.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.enableSorting()
     * ```
     */
    PDFDropdown.prototype.enableSorting = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.Sort, true);
    };
    /**
     * Do not always display the option list of this dropdown in alphabetical
     * order. Instead, display the options in whichever order they were added
     * to the list. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.disableSorting()
     * ```
     */
    PDFDropdown.prototype.disableSorting = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.Sort, false);
    };
    /**
     * Returns `true` if multiple options can be selected from this dropdown's
     * option list. See [[PDFDropdown.enableMultiselect]] and
     * [[PDFDropdown.disableMultiselect]]. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * if (dropdown.isMultiselect()) console.log('Multiselect is enabled')
     * ```
     * @returns Whether or not multiple options can be selected.
     */
    PDFDropdown.prototype.isMultiselect = function () {
        return this.acroField.hasFlag(core_1.AcroChoiceFlags.MultiSelect);
    };
    /**
     * Allow users to select more than one option from this dropdown's option
     * list. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.enableMultiselect()
     * ```
     */
    PDFDropdown.prototype.enableMultiselect = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.MultiSelect, true);
    };
    /**
     * Do not allow users to select more than one option from this dropdown's
     * option list. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.disableMultiselect()
     * ```
     */
    PDFDropdown.prototype.disableMultiselect = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.MultiSelect, false);
    };
    /**
     * Returns `true` if the selected option should be spell checked by PDF
     * readers. Spell checking will only be performed if this dropdown allows
     * editing (see [[PDFDropdown.isEditable]]). See
     * [[PDFDropdown.enableSpellChecking]] and
     * [[PDFDropdown.disableSpellChecking]]. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * if (dropdown.isSpellChecked()) console.log('Spell checking is enabled')
     * ```
     * @returns Whether or not this dropdown can be spell checked.
     */
    PDFDropdown.prototype.isSpellChecked = function () {
        return !this.acroField.hasFlag(core_1.AcroChoiceFlags.DoNotSpellCheck);
    };
    /**
     * Allow PDF readers to spell check the selected option of this dropdown.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.enableSpellChecking()
     * ```
     */
    PDFDropdown.prototype.enableSpellChecking = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.DoNotSpellCheck, false);
    };
    /**
     * Do not allow PDF readers to spell check the selected option of this
     * dropdown. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.disableSpellChecking()
     * ```
     */
    PDFDropdown.prototype.disableSpellChecking = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.DoNotSpellCheck, true);
    };
    /**
     * Returns `true` if the option selected by a user is stored, or "committed",
     * when the user clicks the option. The alternative is that the user's
     * selection is stored when the user leaves this dropdown field (by clicking
     * outside of it - on another field, for example). See
     * [[PDFDropdown.enableSelectOnClick]] and
     * [[PDFDropdown.disableSelectOnClick]]. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * if (dropdown.isSelectOnClick()) console.log('Select on click is enabled')
     * ```
     * @returns Whether or not options are selected immediately after they are
     *          clicked.
     */
    PDFDropdown.prototype.isSelectOnClick = function () {
        return this.acroField.hasFlag(core_1.AcroChoiceFlags.CommitOnSelChange);
    };
    /**
     * Store the option selected by a user immediately after the user clicks the
     * option. Do not wait for the user to leave this dropdown field (by clicking
     * outside of it - on another field, for example). For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.enableSelectOnClick()
     * ```
     */
    PDFDropdown.prototype.enableSelectOnClick = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.CommitOnSelChange, true);
    };
    /**
     * Wait to store the option selected by a user until they leave this dropdown
     * field (by clicking outside of it - on another field, for example).
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.disableSelectOnClick()
     * ```
     */
    PDFDropdown.prototype.disableSelectOnClick = function () {
        this.acroField.setFlagTo(core_1.AcroChoiceFlags.CommitOnSelChange, false);
    };
    /**
     * Show this dropdown on the specified page. For example:
     * ```js
     * const ubuntuFont = await pdfDoc.embedFont(ubuntuFontBytes)
     * const page = pdfDoc.addPage()
     *
     * const form = pdfDoc.getForm()
     * const dropdown = form.createDropdown('best.gundam')
     * dropdown.setOptions(['Exia', 'Dynames'])
     * dropdown.select('Exia')
     *
     * dropdown.addToPage(page, {
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
     * This will create a new widget for this dropdown field.
     * @param page The page to which this dropdown widget should be added.
     * @param options The options to be used when adding this dropdown widget.
     */
    PDFDropdown.prototype.addToPage = function (page, options) {
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
        // Create a widget for this dropdown
        var widget = this.createWidget({
            x: (_a = options.x) !== null && _a !== void 0 ? _a : 0,
            y: (_b = options.y) !== null && _b !== void 0 ? _b : 0,
            width: (_c = options.width) !== null && _c !== void 0 ? _c : 200,
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
        var font = (_g = options.font) !== null && _g !== void 0 ? _g : this.doc.getForm().getDefaultFont();
        this.updateWidgetAppearance(widget, font);
        // Add widget to the given page
        page.node.addAnnot(widgetRef);
    };
    /**
     * Returns `true` if this dropdown has been marked as dirty, or if any of
     * this dropdown's widgets do not have an appearance stream. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * if (dropdown.needsAppearancesUpdate()) console.log('Needs update')
     * ```
     * @returns Whether or not this dropdown needs an appearance update.
     */
    PDFDropdown.prototype.needsAppearancesUpdate = function () {
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
     * Update the appearance streams for each of this dropdown's widgets using
     * the default appearance provider for dropdowns. For example:
     * ```js
     * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.defaultUpdateAppearances(helvetica)
     * ```
     * @param font The font to be used for creating the appearance streams.
     */
    PDFDropdown.prototype.defaultUpdateAppearances = function (font) {
        utils_1.assertIs(font, 'font', [[PDFFont_1.default, 'PDFFont']]);
        this.updateAppearances(font);
    };
    /**
     * Update the appearance streams for each of this dropdown's widgets using
     * the given appearance provider. If no `provider` is passed, the default
     * appearance provider for dropdowns will be used. For example:
     * ```js
     * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.updateAppearances(helvetica, (field, widget, font) => {
     *   ...
     *   return drawTextField(...)
     * })
     * ```
     * @param font The font to be used for creating the appearance streams.
     * @param provider Optionally, the appearance provider to be used for
     *                 generating the contents of the appearance streams.
     */
    PDFDropdown.prototype.updateAppearances = function (font, provider) {
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
    PDFDropdown.prototype.updateWidgetAppearance = function (widget, font, provider) {
        var apProvider = provider !== null && provider !== void 0 ? provider : appearances_1.defaultDropdownAppearanceProvider;
        var appearances = appearances_1.normalizeAppearance(apProvider(this, widget, font));
        this.updateWidgetAppearanceWithFont(widget, font, appearances);
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFForm.getDropdown]] method, which will create an
     * > instance of [[PDFDropdown]] for you.
     *
     * Create an instance of [[PDFDropdown]] from an existing acroComboBox and ref
     *
     * @param acroComboBox The underlying `PDFAcroComboBox` for this dropdown.
     * @param ref The unique reference for this dropdown.
     * @param doc The document to which this dropdown will belong.
     */
    PDFDropdown.of = function (acroComboBox, ref, doc) {
        return new PDFDropdown(acroComboBox, ref, doc);
    };
    return PDFDropdown;
}(PDFField_1.default));
exports.default = PDFDropdown;
//# sourceMappingURL=PDFDropdown.js.map