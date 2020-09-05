import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import PDFField, {
  FieldAppearanceOptions,
  assertFieldAppearanceOptions,
} from 'src/api/form/PDFField';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultDropdownAppearanceProvider,
} from 'src/api/form/appearances';
import { rgb } from 'src/api/colors';
import { degrees } from 'src/api/rotations';

import {
  PDFHexString,
  PDFRef,
  PDFString,
  PDFStream,
  PDFWidgetAnnotation,
  PDFAcroComboBox,
  AcroChoiceFlags,
} from 'src/core';
import { assertIs, assertOrUndefined, assertIsSubset } from 'src/utils';

/**
 * Represents a dropdown field of a [[PDFForm]].
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
  static of = (acroComboBox: PDFAcroComboBox, ref: PDFRef, doc: PDFDocument) =>
    new PDFDropdown(acroComboBox, ref, doc);

  /** The low-level PDFAcroComboBox wrapped by this dropdown. */
  readonly acroField: PDFAcroComboBox;

  private constructor(
    acroComboBox: PDFAcroComboBox,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    super(acroComboBox, ref, doc);

    assertIs(acroComboBox, 'acroComboBox', [
      [PDFAcroComboBox, 'PDFAcroComboBox'],
    ]);

    this.acroField = acroComboBox;
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
   */
  getOptions(): string[] {
    const rawOptions = this.acroField.getOptions();

    const options = new Array<string>(rawOptions.length);
    for (let idx = 0, len = options.length; idx < len; idx++) {
      const { display, value } = rawOptions[idx];
      options[idx] = (display ?? value).decodeText();
    }

    return options;
  }
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
   * Note that PDF readers only display one selected option when rendering
   * dropdowns. However, the PDF specification does allow for multiple
   * values to be selected in a dropdown. As such, the `pdf-lib` API
   * supports this. However, in most cases the array returned by this method
   * will contain only a single element (or no elements).
   */
  getSelected(): string[] {
    const values = this.acroField.getValues();

    const selected = new Array<string>(values.length);
    for (let idx = 0, len = values.length; idx < len; idx++) {
      selected[idx] = values[idx].decodeText();
    }

    return selected;
  }

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
  setOptions(options: string[]) {
    assertIs(options, 'options', [Array]);

    const optionObjects = new Array<{ value: PDFHexString }>(options.length);
    for (let idx = 0, len = options.length; idx < len; idx++) {
      optionObjects[idx] = { value: PDFHexString.fromText(options[idx]) };
    }
    this.acroField.setOptions(optionObjects);
  }

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
  addOptions(options: string | string[]) {
    assertIs(options, 'options', ['string', Array]);

    const optionsArr = Array.isArray(options) ? options : [options];

    const existingOptions: {
      value: PDFString | PDFHexString;
      display?: PDFString | PDFHexString;
    }[] = this.acroField.getOptions();

    const newOptions = new Array<{ value: PDFHexString }>(optionsArr.length);
    for (let idx = 0, len = optionsArr.length; idx < len; idx++) {
      newOptions[idx] = { value: PDFHexString.fromText(optionsArr[idx]) };
    }

    this.acroField.setOptions(existingOptions.concat(newOptions));
  }

  /**
   * Select one or more values for this dropdown. This operation is analogous
   * to a human user opening the dropdown in a PDF reader and clicking on a
   * value to select it. This method will update the underlying state of the
   * dropdown to indicate which values have been selected. PDF libraries and
   * readers will be able to extract these values from the saved document and
   * determine which values were selected.
   * For example:
   * ```js
   * const dropdown = form.getDropdown('best.superhero.dropdown')
   * dropdown.select('One Punch Man')
   * ```
   * > **NOTE:** PDF readers only display one selected option when rendering
   * dropdowns. However, the PDF specification does allow for multiple values
   * to be selected in a dropdown. As such, the `pdf-lib` API supports this.
   * However, it is not recommended to select more than one value with this
   * method, as only one will be visible. [[OptionList]] fields are better
   * suited for displaying multiple selected values.
   * @param options The options to be selected.
   * @param merge Whether or not existing selections should be preserved.
   */
  select(options: string | string[], merge = false) {
    assertIs(options, 'options', ['string', Array]);
    assertIs(merge, 'merge', ['boolean']);

    const optionsArr = Array.isArray(options) ? options : [options];

    const validOptions = this.getOptions();
    assertIsSubset(optionsArr, 'option', validOptions);

    this.markAsDirty();

    if (optionsArr.length > 1 || (optionsArr.length === 1 && merge)) {
      this.enableMultiselect();
    }

    const values = new Array<PDFHexString>(optionsArr.length);
    for (let idx = 0, len = optionsArr.length; idx < len; idx++) {
      values[idx] = PDFHexString.fromText(optionsArr[idx]);
    }

    if (merge) {
      const existingValues = this.acroField.getValues();
      this.acroField.setValues(existingValues.concat(values));
    } else {
      this.acroField.setValues(values);
    }
  }

  /**
   * Clear all selected values for this dropdown. This operation is equivalent
   * to selecting an empty list. This method will update the underlying state
   * of the dropdown to indicate that no values have been selected.
   * For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * dropdown.clear()
   * ```
   */
  clear() {
    this.markAsDirty();
    this.acroField.setValues([]);
  }

  /**
   * Returns `true` if users are allowed to edit the selected value of this
   * dropdown directly and are not constrained by the list of available
   * options. See [[PDFDropdown.enableEditing]] and
   * [[PDFDropdown.disableEditing]]. For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * if (dropdown.isEditable()) console.log('Editing is enabled')
   * ```
   */
  isEditable(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.Edit);
  }

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
  enableEditing() {
    this.acroField.setFlagTo(AcroChoiceFlags.Edit, true);
  }

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
  disableEditing() {
    this.acroField.setFlagTo(AcroChoiceFlags.Edit, false);
  }

  /**
   * Returns `true` if the option list of this dropdown is always displayed
   * in alphabetical order, irrespective of the order in which the options
   * were added to the dropdown. See [[PDFDropdown.enableSorting]] and
   * [[PDFDropdown.disableSorting]]. For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * if (dropdown.isSorted()) console.log('Sorting is enabled')
   * ```
   */
  isSorted(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.Sort);
  }

  /**
   * Always display the option list of this dropdown in alphabetical order,
   * irrespective of the order in which the options were added to this dropdown.
   * For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * dropdown.enableSorting()
   * ```
   */
  enableSorting() {
    this.acroField.setFlagTo(AcroChoiceFlags.Sort, true);
  }

  /**
   * Do not always display the option list of this dropdown in alphabetical
   * order. Instead, display the options in whichever order they were added
   * to the list. For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * dropdown.disableSorting()
   * ```
   */
  disableSorting() {
    this.acroField.setFlagTo(AcroChoiceFlags.Sort, false);
  }

  /**
   * Returns `true` if multiple options can be selected from this dropdown's
   * option list. For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * if (dropdown.isMultiselect()) console.log('Multiselect is enabled')
   * ```
   */
  isMultiselect(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.MultiSelect);
  }

  /**
   * Allow users to select more than one option from this dropdown's option
   * list. For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * dropdown.enableMultiselect()
   * ```
   */
  enableMultiselect() {
    this.acroField.setFlagTo(AcroChoiceFlags.MultiSelect, true);
  }

  /**
   * Do not allow users to select more than one option from this dropdown's
   * option list. For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * dropdown.disableMultiselect()
   * ```
   */
  disableMultiselect() {
    this.acroField.setFlagTo(AcroChoiceFlags.MultiSelect, false);
  }

  /**
   * Returns `true` if the selected option should be spell checked by PDF
   * readers. Spell checking will only be performed if this dropdown allows
   * editing (see [[PDFDropdown.isEditable]]). For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * if (dropdown.isSpellChecked()) console.log('Spell checking is enabled')
   * ```
   */
  isSpellChecked(): boolean {
    return !this.acroField.hasFlag(AcroChoiceFlags.DoNotSpellCheck);
  }

  /**
   * Allow PDF readers to spell check the selected option of this dropdown.
   * For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * dropdown.enableSpellChecking()
   * ```
   */
  enableSpellChecking() {
    this.acroField.setFlagTo(AcroChoiceFlags.DoNotSpellCheck, false);
  }

  /**
   * Do not allow PDF readers to spell check the selected option of this
   * dropdown. For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * dropdown.disableSpellChecking()
   * ```
   */
  disableSpellChecking() {
    this.acroField.setFlagTo(AcroChoiceFlags.DoNotSpellCheck, true);
  }

  /**
   * Returns `true` if the option selected by a user is stored, or "committed",
   * when the user clicks the option. The alternative is that the user's
   * selection is stored when the user leaves this dropdown field (by clicking
   * outside of it - on another field, for example). For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * if (dropdown.isSelectOnClick()) console.log('Select on click is enabled')
   * ```
   */
  isSelectOnClick(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.CommitOnSelChange);
  }

  /**
   * Store the option selected by a user immediately after the user clicks the
   * option. Do not wait for the user to leave this dropdown field (by clicking
   * outside of it - on another field, for example). For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * dropdown.enableSelectOnClick()
   * ```
   */
  enableSelectOnClick() {
    this.acroField.setFlagTo(AcroChoiceFlags.CommitOnSelChange, true);
  }

  /**
   * Wait to store the option selected by a user until they leave this dropdown
   * field (by clicking outside of it - on another field, for example).
   * For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * dropdown.disableSelectOnClick()
   * ```
   */
  disableSelectOnClick() {
    this.acroField.setFlagTo(AcroChoiceFlags.CommitOnSelChange, false);
  }

  /**
   * Show this dropdown on the specified page.
   * ```js
   * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const dropdown = form.createDropdown('some.dropdown.field')
   * dropdown.setOptions(['Exia', 'Dynames'])
   * dropdown.select('Exia')
   *
   * dropdown.addToPage(helvetica, page, {
   *   x: 50,
   *   y: 75,
   *   width: 200,
   *   height: 100,
   *   textColor: rgb(1, 0, 0),
   *   backgroundColor: rgb(0, 1, 0),
   *   borderColor: rgb(0, 0, 1),
   *   borderWidth: 2,
   *   rotate: degrees(90),
   * })
   * ```
   * This will create a new widget for this dropdown field.
   * @param font The font in which the options should be displayed.
   * @param page The page to which this dropdown widget should be added.
   * @param options The options to be used when adding this dropdown widget.
   */
  addToPage(font: PDFFont, page: PDFPage, options?: FieldAppearanceOptions) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    assertIs(page, 'page', [[PDFPage, 'PDFPage']]);
    assertFieldAppearanceOptions(options);

    // Create a widget for this dropdown
    const widget = this.createWidget({
      x: options?.x ?? 0,
      y: options?.y ?? 0,
      width: options?.width ?? 100,
      height: options?.height ?? 50,
      textColor: options?.textColor ?? rgb(0, 0, 0),
      backgroundColor: options?.backgroundColor ?? rgb(1, 1, 1),
      borderColor: options?.borderColor ?? rgb(0, 0, 0),
      borderWidth: options?.borderWidth ?? 0,
      rotate: options?.rotate ?? degrees(0),
    });
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    this.acroField.addWidget(widgetRef);

    // Set appearance streams for widget
    this.updateWidgetAppearance(widget, font);

    // Add widget to the given page
    page.node.addAnnot(widgetRef);
  }

  /**
   * Returns `true` if this dropdown has been marked as dirty, or if any of
   * this dropdown's widgets do not have an appearance stream. For example:
   * ```js
   * const dropdown = form.getDropdown('some.dropdown.field')
   * if (dropdown.needsAppearancesUpdate()) console.log('Needs update')
   * ```
   */
  needsAppearancesUpdate(): boolean {
    if (this.isDirty()) return true;

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const hasAppearances =
        widget.getAppearances()?.normal instanceof PDFStream;
      if (!hasAppearances) return true;
    }

    return false;
  }

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
  defaultUpdateAppearances(font: PDFFont) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    this.updateAppearances(font);
  }

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
  updateAppearances(
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFDropdown>,
  ) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    assertOrUndefined(provider, 'provider', [Function]);

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      this.updateWidgetAppearance(widget, font, provider);
    }
    this.markAsClean();
  }

  // getOption(index: number): string {}
  // getSelectedIndices(): number[] {}
  // removeOptions(option: string | string[]) {}
  // removeIndices(option: number[]) {}
  // deselect(options: string | string[]) {}
  // deselectIndices(optionIndices: number[]) {}

  private updateWidgetAppearance(
    widget: PDFWidgetAnnotation,
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFDropdown>,
  ) {
    const apProvider = provider ?? defaultDropdownAppearanceProvider;
    const appearances = normalizeAppearance(apProvider(this, widget, font));
    this.updateWidgetAppearanceWithFont(widget, font, appearances);
  }
}
