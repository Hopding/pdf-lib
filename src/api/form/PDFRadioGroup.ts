import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroRadioButton, AcroButtonFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import { PDFName, PDFOperator, PDFDict, PDFContentStream } from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultRadioGroupAppearanceProvider,
} from 'src/api/form/appearances';

/**
 * Represents a radio group field of a [[PDFForm]].
 */
export default class PDFRadioGroup extends PDFField {
  static of = (acroRadioButton: PDFAcroRadioButton, doc: PDFDocument) =>
    new PDFRadioGroup(acroRadioButton, doc);

  /** The low-level PDFAcroRadioButton wrapped by this radio group. */
  readonly acroField: PDFAcroRadioButton;

  /** The document to which this radio group belongs. */
  readonly doc: PDFDocument;

  private constructor(acroRadioButton: PDFAcroRadioButton, doc: PDFDocument) {
    super(acroRadioButton, doc);

    assertIs(acroRadioButton, 'acroRadioButton', [
      [PDFAcroRadioButton, 'PDFAcroRadioButton'],
    ]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroRadioButton;
    this.doc = doc;
  }

  getOptions(): string[] {
    const exportValues = this.acroField.getExportValues();
    if (exportValues) {
      const exportOptions = new Array<string>(exportValues.length);
      for (let idx = 0, len = exportValues.length; idx < len; idx++) {
        exportOptions[idx] = exportValues[idx].decodeText();
      }
      return exportOptions;
    }

    const onValues = this.acroField.getOnValues();
    const onOptions = new Array<string>(onValues.length);
    for (let idx = 0, len = onOptions.length; idx < len; idx++) {
      onOptions[idx] = onValues[idx].decodeText();
    }
    return onOptions;
  }

  getSelected(): string | undefined {
    const value = this.acroField.getValue();
    if (value === PDFName.of('Off')) return undefined;
    const exportValues = this.acroField.getExportValues();
    if (exportValues) {
      const onValues = this.acroField.getOnValues();
      for (let idx = 0, len = onValues.length; idx < len; idx++) {
        if (onValues[idx] === value) return exportValues[idx].decodeText();
      }
    }
    return value.decodeText();
  }

  // setOptions(options: string[]) {}

  // addOption(option: string) {}

  // removeOption(option: string) {}

  select(option: string) {
    assertIs(option, 'option', ['string']);
    // TODO: Assert is valid `option`!

    const onValues = this.acroField.getOnValues();
    const exportValues = this.acroField.getExportValues();
    if (exportValues) {
      for (let idx = 0, len = exportValues.length; idx < len; idx++) {
        if (exportValues[idx].decodeText() === option) {
          this.acroField.setValue(onValues[idx]);
        }
      }
    }

    for (let idx = 0, len = onValues.length; idx < len; idx++) {
      const value = onValues[idx];
      if (value.decodeText() === option) this.acroField.setValue(value);
    }
  }

  // clear() {}

  allowsTogglingOff(): boolean {
    return !this.acroField.hasFlag(AcroButtonFlags.NoToggleToOff);
  }

  setAllowTogglingOff(allow: boolean) {
    this.acroField.setFlagTo(AcroButtonFlags.NoToggleToOff, !allow);
  }

  radiosAreMutuallyExclusive(): boolean {
    return !this.acroField.hasFlag(AcroButtonFlags.RadiosInUnison);
  }

  setRadiosAreMutuallyExclusive(enable: boolean) {
    this.acroField.setFlagTo(AcroButtonFlags.RadiosInUnison, !enable);
  }

  updateAppearances(provider?: AppearanceProviderFor<PDFRadioGroup>) {
    const apProvider = provider ?? defaultRadioGroupAppearanceProvider;

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const { normal, rollover, down } = normalizeAppearance(
        apProvider(this, widget),
      );

      const normalDict = this.createAppearanceDict(widget, normal);
      if (normalDict) widget.setNormalAppearance(normalDict);

      if (rollover) {
        const rolloverDict = this.createAppearanceDict(widget, rollover);
        if (rolloverDict) widget.setRolloverAppearance(rolloverDict);
      } else {
        widget.removeRolloverAppearance();
      }

      if (down) {
        const downDict = this.createAppearanceDict(widget, down);
        if (downDict) widget.setDownAppearance(downDict);
      } else {
        widget.removeDownAppearance();
      }
    }
  }

  private createAppearanceDict(
    widget: PDFWidgetAnnotation,
    appearance: { selected: PDFOperator[]; unselected: PDFOperator[] },
  ): PDFDict | undefined {
    const { context } = this.acroField.dict;
    const { width, height } = widget.getRectangle();
    const onValue = widget.getOnValue();

    if (!onValue) return undefined;

    const xObjectDict = context.obj({
      Type: 'XObject',
      Subtype: 'Form',
      BBox: context.obj([0, 0, width, height]),
      Matrix: context.obj([1, 0, 0, 1, 0, 0]),
    });

    const onStream = PDFContentStream.of(xObjectDict, appearance.selected);
    const onStreamRef = context.register(onStream);

    const offStream = PDFContentStream.of(xObjectDict, appearance.unselected);
    const offStreamRef = context.register(offStream);

    const appearanceDict = context.obj({});
    appearanceDict.set(onValue, onStreamRef);
    appearanceDict.set(PDFName.of('Off'), offStreamRef);

    return appearanceDict;
  }
}
