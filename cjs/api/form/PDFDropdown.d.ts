import PDFDocument from "../PDFDocument";
import PDFPage from "../PDFPage";
import PDFFont from "../PDFFont";
import PDFField, { FieldAppearanceOptions } from "./PDFField";
import { AppearanceProviderFor } from "./appearances";
import { PDFRef, PDFAcroComboBox } from "../../core";
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
export default class PDFDropdown extends PDFField {
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
    static of: (acroComboBox: PDFAcroComboBox, ref: PDFRef, doc: PDFDocument) => PDFDropdown;
    /** The low-level PDFAcroComboBox wrapped by this dropdown. */
    readonly acroField: PDFAcroComboBox;
    private constructor();
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
    getOptions(): string[];
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
    getSelected(): string[];
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
    setOptions(options: string[]): void;
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
    addOptions(options: string | string[]): void;
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
    select(options: string | string[], merge?: boolean): void;
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
    clear(): void;
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
    setFontSize(fontSize: number): void;
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
    isEditable(): boolean;
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
    enableEditing(): void;
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
    disableEditing(): void;
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
    isSorted(): boolean;
    /**
     * Always display the option list of this dropdown in alphabetical order,
     * irrespective of the order in which the options were added to this dropdown.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.enableSorting()
     * ```
     */
    enableSorting(): void;
    /**
     * Do not always display the option list of this dropdown in alphabetical
     * order. Instead, display the options in whichever order they were added
     * to the list. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.disableSorting()
     * ```
     */
    disableSorting(): void;
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
    isMultiselect(): boolean;
    /**
     * Allow users to select more than one option from this dropdown's option
     * list. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.enableMultiselect()
     * ```
     */
    enableMultiselect(): void;
    /**
     * Do not allow users to select more than one option from this dropdown's
     * option list. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.disableMultiselect()
     * ```
     */
    disableMultiselect(): void;
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
    isSpellChecked(): boolean;
    /**
     * Allow PDF readers to spell check the selected option of this dropdown.
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.enableSpellChecking()
     * ```
     */
    enableSpellChecking(): void;
    /**
     * Do not allow PDF readers to spell check the selected option of this
     * dropdown. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.disableSpellChecking()
     * ```
     */
    disableSpellChecking(): void;
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
    isSelectOnClick(): boolean;
    /**
     * Store the option selected by a user immediately after the user clicks the
     * option. Do not wait for the user to leave this dropdown field (by clicking
     * outside of it - on another field, for example). For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.enableSelectOnClick()
     * ```
     */
    enableSelectOnClick(): void;
    /**
     * Wait to store the option selected by a user until they leave this dropdown
     * field (by clicking outside of it - on another field, for example).
     * For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * dropdown.disableSelectOnClick()
     * ```
     */
    disableSelectOnClick(): void;
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
    addToPage(page: PDFPage, options?: FieldAppearanceOptions): void;
    /**
     * Returns `true` if this dropdown has been marked as dirty, or if any of
     * this dropdown's widgets do not have an appearance stream. For example:
     * ```js
     * const dropdown = form.getDropdown('some.dropdown.field')
     * if (dropdown.needsAppearancesUpdate()) console.log('Needs update')
     * ```
     * @returns Whether or not this dropdown needs an appearance update.
     */
    needsAppearancesUpdate(): boolean;
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
    defaultUpdateAppearances(font: PDFFont): void;
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
    updateAppearances(font: PDFFont, provider?: AppearanceProviderFor<PDFDropdown>): void;
    private updateWidgetAppearance;
}
//# sourceMappingURL=PDFDropdown.d.ts.map