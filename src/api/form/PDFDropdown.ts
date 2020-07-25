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

  getOptions(): string[] {
    const rawOptions = this.acroField.getOptions();

    const options = new Array<string>(rawOptions.length);
    for (let idx = 0, len = options.length; idx < len; idx++) {
      const { display, value } = rawOptions[idx];
      options[idx] = (display ?? value).decodeText();
    }

    return options;
  }

  // getOption(index: number): string {
  //   assertIs(index, 'index', ['number']);
  //   // TODO: Assert `index` is in valid range
  //   return this.getOptions()[index];
  // }

  getSelected(): string[] {
    const values = this.acroField.getValues();

    const selected = new Array<string>(values.length);
    for (let idx = 0, len = values.length; idx < len; idx++) {
      selected[idx] = values[idx].decodeText();
    }

    return selected;
  }

  // getSelectedIndices(): number[] {
  //   const values = this.acroField.getValues();
  //   const options = this.getOptions();

  //   const indices = new Array<number>(values.length);
  //   for (let idx = 0, len = values.length; idx < len; idx++) {
  //     const val = values[idx].decodeText();
  //     indices[idx] = options.findIndex((option) => val === option);
  //   }

  //   return indices;
  // }

  setOptions(options: string[]) {
    assertIs(options, 'options', [Array]);

    const optionObjects = new Array<{ value: PDFHexString }>(options.length);
    for (let idx = 0, len = options.length; idx < len; idx++) {
      optionObjects[idx] = { value: PDFHexString.fromText(options[idx]) };
    }
    this.acroField.setOptions(optionObjects);
  }

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

  // removeOptions(option: string | string[]) {}

  // removeIndices(option: number[]) {}

  select(options: string | string[], merge = false) {
    assertIs(options, 'options', ['string', Array]);
    assertIs(merge, 'merge', ['boolean']);

    const optionsArr = Array.isArray(options) ? options : [options];

    const validOptions = this.getOptions();
    assertIsSubset(optionsArr, 'option', validOptions);

    this.markAsDirty();

    if (optionsArr.length > 1) this.setAllowMultiSelect(true);

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

  // deselect(options: string | string[]) {}

  // deselectIndices(optionIndices: number[]) {}

  clear() {
    this.markAsDirty();
    this.acroField.setValues([]);
  }

  allowsEditing(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.Edit);
  }

  setAllowEditing(allow: boolean) {
    assertIs(allow, 'allow', ['boolean']);
    this.acroField.setFlagTo(AcroChoiceFlags.Edit, allow);
  }

  requiresSorting(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.Sort);
  }

  setRequireSorting(require: boolean) {
    assertIs(require, 'require', ['boolean']);
    this.acroField.setFlagTo(AcroChoiceFlags.Sort, require);
  }

  allowsMultiSelect(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.MultiSelect);
  }

  setAllowMultiSelect(allow: boolean) {
    assertIs(allow, 'allow', ['boolean']);
    this.acroField.setFlagTo(AcroChoiceFlags.MultiSelect, allow);
  }

  doesSpellCheck(): boolean {
    return (
      !this.acroField.hasFlag(AcroChoiceFlags.DoNotSpellCheck) &&
      this.allowsEditing()
    );
  }

  setSpellCheck(enable: boolean) {
    assertIs(enable, 'enable', ['boolean']);
    if (enable) this.setAllowEditing(true);
    this.acroField.setFlagTo(AcroChoiceFlags.DoNotSpellCheck, !enable);
  }

  commitsImmediately(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.CommitOnSelChange);
  }

  setCommitImmediately(enable: boolean) {
    assertIs(enable, 'enable', ['boolean']);
    this.acroField.setFlagTo(AcroChoiceFlags.CommitOnSelChange, enable);
  }

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

  defaultUpdateAppearances(font: PDFFont) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    this.updateAppearances(font);
  }

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

  private updateWidgetAppearance(
    widget: PDFWidgetAnnotation,
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFDropdown>,
  ) {
    const apProvider = provider ?? defaultDropdownAppearanceProvider;
    const appearances = normalizeAppearance(apProvider(this, widget, font));
    this.updateWidgetAppearanceWithFont(widget, font, appearances);
  }

  // Hack to differentiate `PDFDropdown` from `PDFOptionList`
  // protected _isDropdown = true;
}
