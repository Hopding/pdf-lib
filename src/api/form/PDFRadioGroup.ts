import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import { PDFAcroRadioButton, AcroButtonFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import {
  PDFName,
  PDFOperator,
  PDFRef,
  PDFDict,
  PDFContentStream,
  PDFHexString,
} from 'src/core';
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
  static of = (
    acroRadioButton: PDFAcroRadioButton,
    ref: PDFRef,
    doc: PDFDocument,
  ) => new PDFRadioGroup(acroRadioButton, ref, doc);

  /** The low-level PDFAcroRadioButton wrapped by this radio group. */
  readonly acroField: PDFAcroRadioButton;

  private constructor(
    acroRadioButton: PDFAcroRadioButton,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    super(acroRadioButton, ref, doc);

    assertIs(acroRadioButton, 'acroRadioButton', [
      [PDFAcroRadioButton, 'PDFAcroRadioButton'],
    ]);

    this.acroField = acroRadioButton;
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

  // TODO: Have default width and height
  addOptionToPage(
    option: string,
    page: PDFPage,
    options: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
  ) {
    const { x, y, width, height } = options;

    // Create a widget for this radio button
    const widget = PDFWidgetAnnotation.create(this.doc.context, this.ref);
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    const apStateValue = this.acroField.addWidgetWithOpt(
      widgetRef,
      PDFHexString.fromText(option),
    );

    // Set widget properties
    widget.setAppearanceState(PDFName.of('Off'));
    widget.setRectangle({ x, y, width, height });

    // Set appearance streams for widget
    this.updateWidgetAppearance(widget, apStateValue);

    // Add widget to the given page
    const { Annots } = page.node.normalizedEntries();
    Annots.push(widgetRef);
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
    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const onValue = widget.getOnValue();
      if (!onValue) continue;
      this.updateWidgetAppearance(widget, onValue, provider);
    }
  }

  private updateWidgetAppearance(
    widget: PDFWidgetAnnotation,
    onValue: PDFName,
    provider?: AppearanceProviderFor<PDFRadioGroup>,
  ) {
    const apProvider = provider ?? defaultRadioGroupAppearanceProvider;

    const { normal, rollover, down } = normalizeAppearance(
      apProvider(this, widget),
    );

    widget.setNormalAppearance(
      this.createAppearanceDict(widget, onValue, normal),
    );

    if (rollover) {
      widget.setRolloverAppearance(
        this.createAppearanceDict(widget, onValue, rollover),
      );
    } else {
      widget.removeRolloverAppearance();
    }

    if (down) {
      widget.setDownAppearance(
        this.createAppearanceDict(widget, onValue, down),
      );
    } else {
      widget.removeDownAppearance();
    }
  }

  private createAppearanceDict(
    widget: PDFWidgetAnnotation,
    onValue: PDFName,
    appearance: { selected: PDFOperator[]; unselected: PDFOperator[] },
  ): PDFDict {
    const { context } = this.acroField.dict;
    const { width, height } = widget.getRectangle();

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
