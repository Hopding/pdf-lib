import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroComboBox, AcroChoiceFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import { PDFHexString } from 'src/core';

/**
 * Represents a dropdown field of a [[PDFForm]].
 */
export default class PDFDropdown extends PDFField {
  static of = (acroComboBox: PDFAcroComboBox, doc: PDFDocument) =>
    new PDFDropdown(acroComboBox, doc);

  /** The low-level PDFAcroComboBox wrapped by this dropdown. */
  readonly acroField: PDFAcroComboBox;

  /** The document to which this dropdown belongs. */
  readonly doc: PDFDocument;

  private constructor(acroComboBox: PDFAcroComboBox, doc: PDFDocument) {
    super(acroComboBox, doc);

    assertIs(acroComboBox, 'acroComboBox', [
      [PDFAcroComboBox, 'PDFAcroComboBox'],
    ]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroComboBox;
    this.doc = doc;
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

  getOption(index: number): string {
    assertIs(index, 'index', ['number']);
    // TODO: Assert `index` is in valid range
    return this.getOptions()[index];
  }

  getSelected(): string[] {
    const indices = this.getSelectedIndices();
    const options = this.getOptions();

    const selected = new Array<string>(indices.length);
    for (let idx = 0, len = indices.length; idx < len; idx++) {
      selected[idx] = options[indices[idx]];
    }

    return selected;
  }

  getSelectedIndices(): number[] {
    const values = this.acroField.getValues();
    const options = this.getOptions();

    const indices = new Array<number>(values.length);
    for (let idx = 0, len = values.length; idx < len; idx++) {
      const val = values[idx].decodeText();
      indices[idx] = options.findIndex((option) => val === option);
    }

    return indices;
  }

  // setOptions(options: string[]) {}

  // addOptions(option: string | string[]) {}

  // removeOptions(option: string | string[]) {}

  // removeIndices(option: number[]) {}

  select(options: string | string[], merge = false) {
    assertIs(options, 'options', ['string', Array]);
    assertIs(merge, 'merge', ['boolean']);

    const optionsArr = Array.isArray(options) ? options : [options];

    // TODO: Assert options are valid

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

  // selectIndices(optionIndices: number[]) {}

  // deselect(options: string | string[]) {}

  // deselectIndices(optionIndices: number[]) {}

  // clear() {}

  allowsEditing(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.Edit);
  }

  setAllowEditing(allow: boolean) {
    this.acroField.setFlagTo(AcroChoiceFlags.Edit, allow);
  }

  requiresSorting(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.Sort);
  }

  setRequireSorting(require: boolean) {
    this.acroField.setFlagTo(AcroChoiceFlags.Sort, require);
  }

  allowsMultiSelect(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.MultiSelect);
  }

  setAllowMultiSelect(allow: boolean) {
    this.acroField.setFlagTo(AcroChoiceFlags.MultiSelect, allow);
  }

  doesSpellCheck(): boolean {
    return (
      !this.acroField.hasFlag(AcroChoiceFlags.DoNotSpellCheck) &&
      this.allowsEditing()
    );
  }

  setSpellCheck(enable: boolean) {
    if (enable) this.setAllowEditing(true);
    this.acroField.setFlagTo(AcroChoiceFlags.DoNotSpellCheck, !enable);
  }

  commitsImmediately(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.CommitOnSelChange);
  }

  setCommitImmediately(enable: boolean) {
    this.acroField.setFlagTo(AcroChoiceFlags.CommitOnSelChange, enable);
  }
}
