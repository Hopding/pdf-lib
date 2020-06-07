import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import { PDFAcroListBox, AcroChoiceFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultOptionListAppearanceProvider,
} from 'src/api/form/appearances';
import { PDFOperator, PDFRef, PDFHexString, PDFContentStream } from 'src/core';

/**
 * Represents an option list field of a [[PDFForm]].
 */
export default class PDFOptionList extends PDFField {
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

  setOptions(options: string[]) {
    const optionObjects = new Array<{ value: PDFHexString }>(options.length);
    for (let idx = 0, len = options.length; idx < len; idx++) {
      optionObjects[idx] = { value: PDFHexString.fromText(options[idx]) };
    }
    this.acroField.setOptions(optionObjects);
  }

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

  // allowsEditing(): boolean {
  //   return this.acroField.hasFlag(AcroChoiceFlags.Edit);
  // }

  // setAllowEditing(allow: boolean) {
  //   this.acroField.setFlagTo(AcroChoiceFlags.Edit, allow);
  // }

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

  // doesSpellCheck(): boolean {
  //   return (
  //     !this.acroField.hasFlag(AcroChoiceFlags.DoNotSpellCheck) &&
  //     this.allowsEditing()
  //   );
  // }

  // setSpellCheck(enable: boolean) {
  //   if (enable) this.setAllowEditing(true);
  //   this.acroField.setFlagTo(AcroChoiceFlags.DoNotSpellCheck, !enable);
  // }

  commitsImmediately(): boolean {
    return this.acroField.hasFlag(AcroChoiceFlags.CommitOnSelChange);
  }

  setCommitImmediately(enable: boolean) {
    this.acroField.setFlagTo(AcroChoiceFlags.CommitOnSelChange, enable);
  }

  // TODO: Have default width and height
  addToPage(
    font: PDFFont,
    page: PDFPage,
    options: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
  ) {
    const { x, y, width, height } = options;

    // Create a widget for this button
    const widget = PDFWidgetAnnotation.create(this.doc.context, this.ref);
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    this.acroField.addWidget(widgetRef);

    // Set widget properties
    widget.setRectangle({ x, y, width, height });

    // Set appearance streams for widget
    this.updateWidgetAppearance(widget, font);

    // Add widget to the given page
    const { Annots } = page.node.normalizedEntries();
    Annots.push(widgetRef);
  }

  updateAppearances(
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFOptionList>,
  ) {
    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      this.updateWidgetAppearance(widget, font, provider);
    }
  }

  private updateWidgetAppearance(
    widget: PDFWidgetAnnotation,
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFOptionList>,
  ) {
    const apProvider = provider ?? defaultOptionListAppearanceProvider;

    const { normal, rollover, down } = normalizeAppearance(
      apProvider(this, widget, font),
    );

    widget.setNormalAppearance(
      this.createAppearanceStream(widget, normal, font),
    );

    if (rollover) {
      widget.setRolloverAppearance(
        this.createAppearanceStream(widget, rollover, font),
      );
    } else {
      widget.removeRolloverAppearance();
    }

    if (down) {
      widget.setDownAppearance(this.createAppearanceStream(widget, down, font));
    } else {
      widget.removeDownAppearance();
    }
  }

  private createAppearanceStream(
    widget: PDFWidgetAnnotation,
    appearance: PDFOperator[],
    font: PDFFont,
  ): PDFRef {
    const { context } = this.acroField.dict;
    const { width, height } = widget.getRectangle();

    // TODO: Use `context.formXObject` everywhere
    const xObjectDict = context.obj({
      Type: 'XObject',
      Subtype: 'Form',
      BBox: context.obj([0, 0, width, height]),
      Matrix: context.obj([1, 0, 0, 1, 0, 0]),
      Resources: { Font: { [font.name]: font.ref } },
    });

    const stream = PDFContentStream.of(xObjectDict, appearance);
    const streamRef = context.register(stream);

    return streamRef;
  }

  // Hack to differentiate `PDFOptionList` from `PDFDropdown`
  protected _isOptionList = true;
}
