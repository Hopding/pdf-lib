import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroComboBox } from 'src/core/acroform';
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

  // getOption(index: number): string {}

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
    const rawOptions = this.acroField.getOptions();

    const indices = new Array<number>(values.length);
    for (let idx = 0, len = values.length; idx < len; idx++) {
      const val = values[idx].decodeText();
      indices[idx] = rawOptions.findIndex((o) => val === o.value.decodeText());
    }

    return indices;
  }

  // setOptions(options: string[]) {}

  // addOptions(option: string | string[]) {}

  // removeOptions(option: string | string[]) {}

  // removeIndices(option: number[]) {}

  // TODO: Auto enable multiselect!
  // TODO: Switch all this code to only use display or only use export to
  //       avoid duplicate selections? Same issue for PDFRadioGroup I think.
  select(options: string | string[], merge = false) {
    assertIs(options, 'options', ['string', Array]);

    const optionsArr = Array.isArray(options) ? options : [options];

    // TODO: Assert options are valid

    if (optionsArr.length > 1) this.acroField.setIsMultiSelect(true);

    const values = new Array<PDFHexString>(optionsArr.length);
    for (let idx = 0, len = optionsArr.length; idx < len; idx++) {
      // TODO: Need to convert `optionsArr` elements to `rawOptions.value`
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
}
