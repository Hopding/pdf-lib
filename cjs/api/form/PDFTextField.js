"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFPage_1 = tslib_1.__importDefault(require("../PDFPage"));
var PDFFont_1 = tslib_1.__importDefault(require("../PDFFont"));
var PDFField_1 = tslib_1.__importStar(require("./PDFField"));
var appearances_1 = require("./appearances");
var colors_1 = require("../colors");
var rotations_1 = require("../rotations");
var errors_1 = require("../errors");
var alignment_1 = require("../image/alignment");
var alignment_2 = require("../text/alignment");
var core_1 = require("../../core");
var utils_1 = require("../../utils");
/**
 * Represents a text field of a [[PDFForm]].
 *
 * [[PDFTextField]] fields are boxes that display text entered by the user. The
 * purpose of a text field is to enable users to enter text or view text values
 * in the document prefilled by software. Users can click on a text field and
 * input text via their keyboard. Some text fields allow multiple lines of text
 * to be entered (see [[PDFTextField.isMultiline]]).
 */
var PDFTextField = /** @class */ (function (_super) {
    tslib_1.__extends(PDFTextField, _super);
    function PDFTextField(acroText, ref, doc) {
        var _this = _super.call(this, acroText, ref, doc) || this;
        utils_1.assertIs(acroText, 'acroText', [[core_1.PDFAcroText, 'PDFAcroText']]);
        _this.acroField = acroText;
        return _this;
    }
    /**
     * Get the text that this field contains. This text is visible to users who
     * view this field in a PDF reader.
     *
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * const text = textField.getText()
     * console.log('Text field contents:', text)
     * ```
     *
     * Note that if this text field contains no underlying value, `undefined`
     * will be returned. Text fields may also contain an underlying value that
     * is simply an empty string (`''`). This detail is largely irrelevant for
     * most applications. In general, you'll want to treat both cases the same
     * way and simply consider the text field to be empty. In either case, the
     * text field will appear empty to users when viewed in a PDF reader.
     *
     * An error will be thrown if this is a rich text field. `pdf-lib` does not
     * support reading rich text fields. Nor do most PDF readers and writers.
     * Rich text fields are based on XFA (XML Forms Architecture). Relatively few
     * PDFs use rich text fields or XFA. Unlike PDF itself, XFA is not an ISO
     * standard. XFA has been deprecated in PDF 2.0:
     * * https://en.wikipedia.org/wiki/XFA
     * * http://blog.pdfshareforms.com/pdf-2-0-release-bid-farewell-xfa-forms/
     *
     * @returns The text contained in this text field.
     */
    PDFTextField.prototype.getText = function () {
        var value = this.acroField.getValue();
        if (!value && this.isRichFormatted()) {
            throw new errors_1.RichTextFieldReadError(this.getName());
        }
        return value === null || value === void 0 ? void 0 : value.decodeText();
    };
    /**
     * Set the text for this field. This operation is analogous to a human user
     * clicking on the text field in a PDF reader and typing in text via their
     * keyboard. This method will update the underlying state of the text field
     * to indicate what text has been set. PDF libraries and readers will be able
     * to extract these values from the saved document and determine what text
     * was set.
     *
     * For example:
     * ```js
     * const textField = form.getTextField('best.superhero.text.field')
     * textField.setText('One Punch Man')
     * ```
     *
     * This method will mark this text field as dirty, causing its appearance
     * streams to be updated when either [[PDFDocument.save]] or
     * [[PDFForm.updateFieldAppearances]] is called. The updated streams will
     * display the text this field contains inside the widgets of this text
     * field.
     *
     * **IMPORTANT:** The default font used to update appearance streams is
     * [[StandardFonts.Helvetica]]. Note that this is a WinAnsi font. This means
     * that encoding errors will be thrown if this field contains text outside
     * the WinAnsi character set (the latin alphabet).
     *
     * Embedding a custom font and passing it to
     * [[PDFForm.updateFieldAppearances]] or [[PDFTextField.updateAppearances]]
     * allows you to generate appearance streams with characters outside the
     * latin alphabet (assuming the custom font supports them).
     *
     * If this is a rich text field, it will be converted to a standard text
     * field in order to set the text. `pdf-lib` does not support writing rich
     * text strings. Nor do most PDF readers and writers. See
     * [[PDFTextField.getText]] for more information about rich text fields and
     * their deprecation in PDF 2.0.
     *
     * @param text The text this field should contain.
     */
    PDFTextField.prototype.setText = function (text) {
        utils_1.assertOrUndefined(text, 'text', ['string']);
        var maxLength = this.getMaxLength();
        if (maxLength !== undefined && text && text.length > maxLength) {
            throw new errors_1.ExceededMaxLengthError(text.length, maxLength, this.getName());
        }
        this.markAsDirty();
        this.disableRichFormatting();
        if (text) {
            this.acroField.setValue(core_1.PDFHexString.fromText(text));
        }
        else {
            this.acroField.removeValue();
        }
    };
    /**
     * Get the alignment for this text field. This value represents the
     * justification of the text when it is displayed to the user in PDF readers.
     * There are three possible alignments: left, center, and right. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * const alignment = textField.getAlignment()
     * if (alignment === TextAlignment.Left) console.log('Text is left justified')
     * if (alignment === TextAlignment.Center) console.log('Text is centered')
     * if (alignment === TextAlignment.Right) console.log('Text is right justified')
     * ```
     * @returns The alignment of this text field.
     */
    PDFTextField.prototype.getAlignment = function () {
        var quadding = this.acroField.getQuadding();
        // prettier-ignore
        return (quadding === 0 ? alignment_2.TextAlignment.Left
            : quadding === 1 ? alignment_2.TextAlignment.Center
                : quadding === 2 ? alignment_2.TextAlignment.Right
                    : alignment_2.TextAlignment.Left);
    };
    /**
     * Set the alignment for this text field. This will determine the
     * justification of the text when it is displayed to the user in PDF readers.
     * There are three possible alignments: left, center, and right. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     *
     * // Text will be left justified when displayed
     * textField.setAlignment(TextAlignment.Left)
     *
     * // Text will be centered when displayed
     * textField.setAlignment(TextAlignment.Center)
     *
     * // Text will be right justified when displayed
     * textField.setAlignment(TextAlignment.Right)
     * ```
     * This method will mark this text field as dirty. See
     * [[PDFTextField.setText]] for more details about what this means.
     * @param alignment The alignment for this text field.
     */
    PDFTextField.prototype.setAlignment = function (alignment) {
        utils_1.assertIsOneOf(alignment, 'alignment', alignment_2.TextAlignment);
        this.markAsDirty();
        this.acroField.setQuadding(alignment);
    };
    /**
     * Get the maximum length of this field. This value represents the maximum
     * number of characters that can be typed into this field by the user. If
     * this field does not have a maximum length, `undefined` is returned.
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * const maxLength = textField.getMaxLength()
     * if (maxLength === undefined) console.log('No max length')
     * else console.log(`Max length is ${maxLength}`)
     * ```
     * @returns The maximum number of characters allowed in this field, or
     *          `undefined` if no limit exists.
     */
    PDFTextField.prototype.getMaxLength = function () {
        return this.acroField.getMaxLength();
    };
    /**
     * Set the maximum length of this field. This limits the number of characters
     * that can be typed into this field by the user. This also limits the length
     * of the string that can be passed to [[PDFTextField.setText]]. This limit
     * can be removed by passing `undefined` as `maxLength`. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     *
     * // Allow between 0 and 5 characters to be entered
     * textField.setMaxLength(5)
     *
     * // Allow any number of characters to be entered
     * textField.setMaxLength(undefined)
     * ```
     * This method will mark this text field as dirty. See
     * [[PDFTextField.setText]] for more details about what this means.
     * @param maxLength The maximum number of characters allowed in this field, or
     *                  `undefined` to remove the limit.
     */
    PDFTextField.prototype.setMaxLength = function (maxLength) {
        utils_1.assertRangeOrUndefined(maxLength, 'maxLength', 0, Number.MAX_SAFE_INTEGER);
        this.markAsDirty();
        if (maxLength === undefined) {
            this.acroField.removeMaxLength();
        }
        else {
            var text = this.getText();
            if (text && text.length > maxLength) {
                throw new errors_1.InvalidMaxLengthError(text.length, maxLength, this.getName());
            }
            this.acroField.setMaxLength(maxLength);
        }
    };
    /**
     * Remove the maximum length for this text field. This allows any number of
     * characters to be typed into this field by the user. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.removeMaxLength()
     * ```
     * Calling this method is equivalent to passing `undefined` to
     * [[PDFTextField.setMaxLength]].
     */
    PDFTextField.prototype.removeMaxLength = function () {
        this.markAsDirty();
        this.acroField.removeMaxLength();
    };
    /**
     * Display an image inside the bounds of this text field's widgets. For example:
     * ```js
     * const pngImage = await pdfDoc.embedPng(...)
     * const textField = form.getTextField('some.text.field')
     * textField.setImage(pngImage)
     * ```
     * This will update the appearances streams for each of this text field's widgets.
     * @param image The image that should be displayed.
     */
    PDFTextField.prototype.setImage = function (image) {
        var fieldAlignment = this.getAlignment();
        // prettier-ignore
        var alignment = fieldAlignment === alignment_2.TextAlignment.Center ? alignment_1.ImageAlignment.Center
            : fieldAlignment === alignment_2.TextAlignment.Right ? alignment_1.ImageAlignment.Right
                : alignment_1.ImageAlignment.Left;
        var widgets = this.acroField.getWidgets();
        for (var idx = 0, len = widgets.length; idx < len; idx++) {
            var widget = widgets[idx];
            var streamRef = this.createImageAppearanceStream(widget, image, alignment);
            this.updateWidgetAppearances(widget, { normal: streamRef });
        }
        this.markAsClean();
    };
    /**
     * Set the font size for this field. Larger font sizes will result in larger
     * text being displayed when PDF readers render this text field. Font sizes
     * may be integer or floating point numbers. Supplying a negative font size
     * will cause this method to throw an error.
     *
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.setFontSize(4)
     * textField.setFontSize(15.7)
     * ```
     *
     * > This method depends upon the existence of a default appearance
     * > (`/DA`) string. If this field does not have a default appearance string,
     * > or that string does not contain a font size (via the `Tf` operator),
     * > then this method will throw an error.
     *
     * @param fontSize The font size to be used when rendering text in this field.
     */
    PDFTextField.prototype.setFontSize = function (fontSize) {
        utils_1.assertPositive(fontSize, 'fontSize');
        this.acroField.setFontSize(fontSize);
        this.markAsDirty();
    };
    /**
     * Returns `true` if each line of text is shown on a new line when this
     * field is displayed in a PDF reader. The alternative is that all lines of
     * text are merged onto a single line when displayed. See
     * [[PDFTextField.enableMultiline]] and [[PDFTextField.disableMultiline]].
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * if (textField.isMultiline()) console.log('Multiline is enabled')
     * ```
     * @returns Whether or not this is a multiline text field.
     */
    PDFTextField.prototype.isMultiline = function () {
        return this.acroField.hasFlag(core_1.AcroTextFlags.Multiline);
    };
    /**
     * Display each line of text on a new line when this field is displayed in a
     * PDF reader. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.enableMultiline()
     * ```
     * This method will mark this text field as dirty. See
     * [[PDFTextField.setText]] for more details about what this means.
     */
    PDFTextField.prototype.enableMultiline = function () {
        this.markAsDirty();
        this.acroField.setFlagTo(core_1.AcroTextFlags.Multiline, true);
    };
    /**
     * Display each line of text on the same line when this field is displayed
     * in a PDF reader. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.disableMultiline()
     * ```
     * This method will mark this text field as dirty. See
     * [[PDFTextField.setText]] for more details about what this means.
     */
    PDFTextField.prototype.disableMultiline = function () {
        this.markAsDirty();
        this.acroField.setFlagTo(core_1.AcroTextFlags.Multiline, false);
    };
    /**
     * Returns `true` if this is a password text field. This means that the field
     * is intended for storing a secure password. See
     * [[PDFTextField.enablePassword]] and [[PDFTextField.disablePassword]].
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * if (textField.isPassword()) console.log('Password is enabled')
     * ```
     * @returns Whether or not this is a password text field.
     */
    PDFTextField.prototype.isPassword = function () {
        return this.acroField.hasFlag(core_1.AcroTextFlags.Password);
    };
    /**
     * Indicate that this text field is intended for storing a secure password.
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.enablePassword()
     * ```
     * Values entered into password text fields should not be displayed on the
     * screen by PDF readers. Most PDF readers will display the value as
     * asterisks or bullets. PDF readers should never store values entered by the
     * user into password text fields. Similarly, applications should not
     * write data to a password text field.
     *
     * **Please note that this method does not cause entered values to be
     * encrypted or secured in any way! It simply sets a flag that PDF software
     * and readers can access to determine the _purpose_ of this field.**
     */
    PDFTextField.prototype.enablePassword = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.Password, true);
    };
    /**
     * Indicate that this text field is **not** intended for storing a secure
     * password. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.disablePassword()
     * ```
     */
    PDFTextField.prototype.disablePassword = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.Password, false);
    };
    /**
     * Returns `true` if the contents of this text field represent a file path.
     * See [[PDFTextField.enableFileSelection]] and
     * [[PDFTextField.disableFileSelection]]. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * if (textField.isFileSelector()) console.log('Is a file selector')
     * ```
     * @returns Whether or not this field should contain file paths.
     */
    PDFTextField.prototype.isFileSelector = function () {
        return this.acroField.hasFlag(core_1.AcroTextFlags.FileSelect);
    };
    /**
     * Indicate that this text field is intended to store a file path. The
     * contents of the file stored at that path should be submitted as the value
     * of the field. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.enableFileSelection()
     * ```
     */
    PDFTextField.prototype.enableFileSelection = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.FileSelect, true);
    };
    /**
     * Indicate that this text field is **not** intended to store a file path.
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.disableFileSelection()
     * ```
     */
    PDFTextField.prototype.disableFileSelection = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.FileSelect, false);
    };
    /**
     * Returns `true` if the text entered in this field should be spell checked
     * by PDF readers. See [[PDFTextField.enableSpellChecking]] and
     * [[PDFTextField.disableSpellChecking]]. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * if (textField.isSpellChecked()) console.log('Spell checking is enabled')
     * ```
     * @returns Whether or not this field should be spell checked.
     */
    PDFTextField.prototype.isSpellChecked = function () {
        return !this.acroField.hasFlag(core_1.AcroTextFlags.DoNotSpellCheck);
    };
    /**
     * Allow PDF readers to spell check the text entered in this field.
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.enableSpellChecking()
     * ```
     */
    PDFTextField.prototype.enableSpellChecking = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.DoNotSpellCheck, false);
    };
    /**
     * Do not allow PDF readers to spell check the text entered in this field.
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.disableSpellChecking()
     * ```
     */
    PDFTextField.prototype.disableSpellChecking = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.DoNotSpellCheck, true);
    };
    /**
     * Returns `true` if PDF readers should allow the user to scroll the text
     * field when its contents do not fit within the field's view bounds. See
     * [[PDFTextField.enableScrolling]] and [[PDFTextField.disableScrolling]].
     * For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * if (textField.isScrollable()) console.log('Scrolling is enabled')
     * ```
     * @returns Whether or not the field is scrollable in PDF readers.
     */
    PDFTextField.prototype.isScrollable = function () {
        return !this.acroField.hasFlag(core_1.AcroTextFlags.DoNotScroll);
    };
    /**
     * Allow PDF readers to present a scroll bar to the user when the contents
     * of this text field do not fit within its view bounds. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.enableScrolling()
     * ```
     * A horizontal scroll bar should be shown for singleline fields. A vertical
     * scroll bar should be shown for multiline fields.
     */
    PDFTextField.prototype.enableScrolling = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.DoNotScroll, false);
    };
    /**
     * Do not allow PDF readers to present a scroll bar to the user when the
     * contents of this text field do not fit within its view bounds. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.disableScrolling()
     * ```
     */
    PDFTextField.prototype.disableScrolling = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.DoNotScroll, true);
    };
    /**
     * Returns `true` if this is a combed text field. This means that the field
     * is split into `n` equal size cells with one character in each (where `n`
     * is equal to the max length of the text field). The result is that all
     * characters in this field are displayed an equal distance apart from one
     * another. See [[PDFTextField.enableCombing]] and
     * [[PDFTextField.disableCombing]]. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * if (textField.isCombed()) console.log('Combing is enabled')
     * ```
     * Note that in order for a text field to be combed, the following must be
     * true (in addition to enabling combing):
     * * It must not be a multiline field (see [[PDFTextField.isMultiline]])
     * * It must not be a password field (see [[PDFTextField.isPassword]])
     * * It must not be a file selector field (see [[PDFTextField.isFileSelector]])
     * * It must have a max length defined (see [[PDFTextField.setMaxLength]])
     * @returns Whether or not this field is combed.
     */
    PDFTextField.prototype.isCombed = function () {
        return (this.acroField.hasFlag(core_1.AcroTextFlags.Comb) &&
            !this.isMultiline() &&
            !this.isPassword() &&
            !this.isFileSelector() &&
            this.getMaxLength() !== undefined);
    };
    /**
     * Split this field into `n` equal size cells with one character in each
     * (where `n` is equal to the max length of the text field). This will cause
     * all characters in the field to be displayed an equal distance apart from
     * one another. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.enableCombing()
     * ```
     *
     * In addition to calling this method, text fields must have a max length
     * defined in order to be combed (see [[PDFTextField.setMaxLength]]).
     *
     * This method will also call the following three methods internally:
     * * [[PDFTextField.disableMultiline]]
     * * [[PDFTextField.disablePassword]]
     * * [[PDFTextField.disableFileSelection]]
     *
     * This method will mark this text field as dirty. See
     * [[PDFTextField.setText]] for more details about what this means.
     */
    PDFTextField.prototype.enableCombing = function () {
        if (this.getMaxLength() === undefined) {
            var msg = "PDFTextFields must have a max length in order to be combed";
            console.warn(msg);
        }
        this.markAsDirty();
        this.disableMultiline();
        this.disablePassword();
        this.disableFileSelection();
        this.acroField.setFlagTo(core_1.AcroTextFlags.Comb, true);
    };
    /**
     * Turn off combing for this text field. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.disableCombing()
     * ```
     * See [[PDFTextField.isCombed]] and [[PDFTextField.enableCombing]] for more
     * information about what combing is.
     *
     * This method will mark this text field as dirty. See
     * [[PDFTextField.setText]] for more details about what this means.
     */
    PDFTextField.prototype.disableCombing = function () {
        this.markAsDirty();
        this.acroField.setFlagTo(core_1.AcroTextFlags.Comb, false);
    };
    /**
     * Returns `true` if this text field contains rich text. See
     * [[PDFTextField.enableRichFormatting]] and
     * [[PDFTextField.disableRichFormatting]]. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * if (textField.isRichFormatted()) console.log('Rich formatting enabled')
     * ```
     * @returns Whether or not this field contains rich text.
     */
    PDFTextField.prototype.isRichFormatted = function () {
        return this.acroField.hasFlag(core_1.AcroTextFlags.RichText);
    };
    /**
     * Indicate that this field contains XFA data - or rich text. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.enableRichFormatting()
     * ```
     * Note that `pdf-lib` does not support reading or writing rich text fields.
     * Nor do most PDF readers and writers. Rich text fields are based on XFA
     * (XML Forms Architecture). Relatively few PDFs use rich text fields or XFA.
     * Unlike PDF itself, XFA is not an ISO standard. XFA has been deprecated in
     * PDF 2.0:
     * * https://en.wikipedia.org/wiki/XFA
     * * http://blog.pdfshareforms.com/pdf-2-0-release-bid-farewell-xfa-forms/
     */
    PDFTextField.prototype.enableRichFormatting = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.RichText, true);
    };
    /**
     * Indicate that this is a standard text field that does not XFA data (rich
     * text). For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * textField.disableRichFormatting()
     * ```
     */
    PDFTextField.prototype.disableRichFormatting = function () {
        this.acroField.setFlagTo(core_1.AcroTextFlags.RichText, false);
    };
    /**
     * Show this text field on the specified page. For example:
     * ```js
     * const ubuntuFont = await pdfDoc.embedFont(ubuntuFontBytes)
     * const page = pdfDoc.addPage()
     *
     * const form = pdfDoc.getForm()
     * const textField = form.createTextField('best.gundam')
     * textField.setText('Exia')
     *
     * textField.addToPage(page, {
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
     * This will create a new widget for this text field.
     * @param page The page to which this text field widget should be added.
     * @param options The options to be used when adding this text field widget.
     */
    PDFTextField.prototype.addToPage = function (page, options) {
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
        // Create a widget for this text field
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
     * Returns `true` if this text field has been marked as dirty, or if any of
     * this text field's widgets do not have an appearance stream. For example:
     * ```js
     * const textField = form.getTextField('some.text.field')
     * if (textField.needsAppearancesUpdate()) console.log('Needs update')
     * ```
     * @returns Whether or not this text field needs an appearance update.
     */
    PDFTextField.prototype.needsAppearancesUpdate = function () {
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
     * Update the appearance streams for each of this text field's widgets using
     * the default appearance provider for text fields. For example:
     * ```js
     * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const textField = form.getTextField('some.text.field')
     * textField.defaultUpdateAppearances(helvetica)
     * ```
     * @param font The font to be used for creating the appearance streams.
     */
    PDFTextField.prototype.defaultUpdateAppearances = function (font) {
        utils_1.assertIs(font, 'font', [[PDFFont_1.default, 'PDFFont']]);
        this.updateAppearances(font);
    };
    /**
     * Update the appearance streams for each of this text field's widgets using
     * the given appearance provider. If no `provider` is passed, the default
     * appearance provider for text fields will be used. For example:
     * ```js
     * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
     * const textField = form.getTextField('some.text.field')
     * textField.updateAppearances(helvetica, (field, widget, font) => {
     *   ...
     *   return drawTextField(...)
     * })
     * ```
     * @param font The font to be used for creating the appearance streams.
     * @param provider Optionally, the appearance provider to be used for
     *                 generating the contents of the appearance streams.
     */
    PDFTextField.prototype.updateAppearances = function (font, provider) {
        utils_1.assertIs(font, 'font', [[PDFFont_1.default, 'PDFFont']]);
        utils_1.assertOrUndefined(provider, 'provider', [Function]);
        var widgets = this.acroField.getWidgets();
        for (var idx = 0, len = widgets.length; idx < len; idx++) {
            var widget = widgets[idx];
            this.updateWidgetAppearance(widget, font, provider);
        }
        this.markAsClean();
    };
    PDFTextField.prototype.updateWidgetAppearance = function (widget, font, provider) {
        var apProvider = provider !== null && provider !== void 0 ? provider : appearances_1.defaultTextFieldAppearanceProvider;
        var appearances = appearances_1.normalizeAppearance(apProvider(this, widget, font));
        this.updateWidgetAppearanceWithFont(widget, font, appearances);
    };
    /**
     * > **NOTE:** You probably don't want to call this method directly. Instead,
     * > consider using the [[PDFForm.getTextField]] method, which will create an
     * > instance of [[PDFTextField]] for you.
     *
     * Create an instance of [[PDFTextField]] from an existing acroText and ref
     *
     * @param acroText The underlying `PDFAcroText` for this text field.
     * @param ref The unique reference for this text field.
     * @param doc The document to which this text field will belong.
     */
    PDFTextField.of = function (acroText, ref, doc) {
        return new PDFTextField(acroText, ref, doc);
    };
    return PDFTextField;
}(PDFField_1.default));
exports.default = PDFTextField;
//# sourceMappingURL=PDFTextField.js.map