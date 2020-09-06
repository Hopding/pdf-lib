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
  defaultOptionListAppearanceProvider,
} from 'src/api/form/appearances';
import { rgb } from 'src/api/colors';
import { degrees } from 'src/api/rotations';

import {
  PDFRef,
  PDFHexString,
  PDFString,
  PDFStream,
  PDFAcroListBox,
  AcroChoiceFlags,
  PDFWidgetAnnotation,
} from 'src/core';
import { assertIs, assertOrUndefined, assertIsSubset } from 'src/utils';

/**
 * Represents an option list field of a [[PDFForm]].
 */
export default class PDFOptionList extends PDFField {
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
  static of = (acroListBox: PDFAcroListBox, ref: PDFRef, doc: PDFDocument) =>
    new PDFOptionList(acroListBox, ref, doc);

  /** The low-level PDFAcroListBox wrapped by this option list. */
  readonly acroField: PDFAcroListBox;

  private constructor(
    acroListBox: PDFAcroListBox,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    super(acroListBox, ref, doc);

    assertIs(acroListBox, 'acroListBox', [[PDFAcroListBox, 'PDFAcroListBox']]);

    this.acroField = acroListBox;
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
   * Get the selected options for this option list. These are the values that
   * were selected by a human user via a PDF reader, or programatically via
   * software.
   * For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * const selections = optionList.getSelected()
   * console.log('Option List selections:', selections)
   * ```
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
   * Set the list of options that are available for this option list. These are
   * the values that will be available for users to select when they view this
   * option list in a PDF reader. Note that preexisting options for this
   * option list will be removed. Only the values passed as `options` will be
   * available to select.
   * For example:
   * ```js
   * const optionList = form.getOptionList('planets.optionList')
   * optionList.setOptions(['Earth', 'Mars', 'Pluto', 'Venus'])
   * ```
   * @param options The options that should be available in this option list.
   */
  setOptions(options: string[]) {
    assertIs(options, 'options', [Array]);

    this.markAsDirty();
    const optionObjects = new Array<{ value: PDFHexString }>(options.length);
    for (let idx = 0, len = options.length; idx < len; idx++) {
      optionObjects[idx] = { value: PDFHexString.fromText(options[idx]) };
    }
    this.acroField.setOptions(optionObjects);
  }

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
   * @param options New options that should be available in this option list.
   */
  addOptions(options: string | string[]) {
    assertIs(options, 'options', ['string', Array]);

    this.markAsDirty();

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
   * Clear all selected values for this option list. This operation is
   * equivalent to selecting an empty list. This method will update the
   * underlying state of the option list to indicate that no values have been
   * selected.
   * For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * optionList.clear()
   * ```
   */
  clear() {
    this.markAsDirty();
    this.acroField.setValues([]);
  }

  /**
   * Returns `true` if the options of this option list are always displayed
   * in alphabetical order, irrespective of the order in which the options
   * were added to the option list. See [[PDFOptionList.enableSorting]] and
   * [[PDFOptionList.disableSorting]]. For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * if (optionList.isSorted()) console.log('Sorting is enabled')
   * ```
   */
  isSorted(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.Sort);
  }

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
  enableSorting() {
    this.acroField.setFlagTo(AcroChoiceFlags.Sort, true);
  }

  /**
   * Do not always display the options of this option list in alphabetical
   * order. Instead, display the options in whichever order they were added
   * to this option list. For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * optionList.disableSorting()
   * ```
   */
  disableSorting() {
    this.acroField.setFlagTo(AcroChoiceFlags.Sort, false);
  }

  /**
   * Returns `true` if multiple options can be selected from this option list.
   * See [[PDFOptionList.enableMultiselect]] and
   * [[PDFOptionList.disableMultiselect]]. For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * if (optionList.isMultiselect()) console.log('Multiselect is enabled')
   * ```
   */
  isMultiselect(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.MultiSelect);
  }

  /**
   * Allow users to select more than one option from this option list.
   * For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * optionList.enableMultiselect()
   * ```
   */
  enableMultiselect() {
    this.acroField.setFlagTo(AcroChoiceFlags.MultiSelect, true);
  }

  /**
   * Do not allow users to select more than one option from this option list.
   * For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * optionList.disableMultiselect()
   * ```
   */
  disableMultiselect() {
    this.acroField.setFlagTo(AcroChoiceFlags.MultiSelect, false);
  }

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
   */
  isSelectOnClick(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.CommitOnSelChange);
  }

  /**
   * Store the option selected by a user immediately after the user clicks the
   * option. Do not wait for the user to leave this option list field (by
   * clicking outside of it - on another field, for example). For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * optionList.enableSelectOnClick()
   * ```
   */
  enableSelectOnClick() {
    this.acroField.setFlagTo(AcroChoiceFlags.CommitOnSelChange, true);
  }

  /**
   * Wait to store the option selected by a user until they leave this option
   * list field (by clicking outside of it - on another field, for example).
   * For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * optionList.disableSelectOnClick()
   * ```
   */
  disableSelectOnClick() {
    this.acroField.setFlagTo(AcroChoiceFlags.CommitOnSelChange, false);
  }

  /**
   * Show this option list on the specified page. For example:
   * ```js
   * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const optionList = form.createOptionList('best.gundams')
   * optionList.setOptions(['Exia', 'Dynames', 'Kyrios', 'Virtue'])
   * optionList.select(['Exia', 'Virtue'])
   *
   * optionList.addToPage(helvetica, page, {
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
   * This will create a new widget for this option list field.
   * @param font The font in which the options should be displayed.
   * @param page The page to which this option list widget should be added.
   * @param options The options to be used when adding this option list widget.
   */
  addToPage(font: PDFFont, page: PDFPage, options?: FieldAppearanceOptions) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    assertIs(page, 'page', [[PDFPage, 'PDFPage']]);
    assertFieldAppearanceOptions(options);

    // Create a widget for this option list
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
   * Returns `true` if this option list has been marked as dirty, or if any of
   * this option list's widgets do not have an appearance stream. For example:
   * ```js
   * const optionList = form.getOptionList('some.optionList.field')
   * if (optionList.needsAppearancesUpdate()) console.log('Needs update')
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
   * Update the appearance streams for each of this option list's widgets using
   * the default appearance provider for option lists. For example:
   * ```js
   * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const optionList = form.getOptionList('some.optionList.field')
   * optionList.defaultUpdateAppearances(helvetica)
   * ```
   * @param font The font to be used for creating the appearance streams.
   */
  defaultUpdateAppearances(font: PDFFont) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    this.updateAppearances(font);
  }

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
  updateAppearances(
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFOptionList>,
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
    provider?: AppearanceProviderFor<PDFOptionList>,
  ) {
    const apProvider = provider ?? defaultOptionListAppearanceProvider;
    const appearances = normalizeAppearance(apProvider(this, widget, font));
    this.updateWidgetAppearanceWithFont(widget, font, appearances);
  }
}
