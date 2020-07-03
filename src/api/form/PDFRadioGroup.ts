import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import { PDFAcroRadioButton, AcroButtonFlags } from 'src/core/acroform';
import { assertIs, assertMultiple } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import { PDFName, PDFRef, PDFHexString } from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultRadioGroupAppearanceProvider,
} from 'src/api/form/appearances';
import { Color, rgb, colorToComponents } from '../colors';
import {
  Rotation,
  toDegrees,
  degrees,
  adjustDimsForRotation,
} from '../rotations';

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

  addOptionToPage(
    option: string,
    page: PDFPage,
    options?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      color?: Color;
      borderColor?: Color;
      borderWidth?: number;
      rotate?: Rotation;
    },
  ) {
    const x = options?.x ?? 0;
    const y = options?.y ?? 0;
    const color = options?.color ?? rgb(1, 1, 1);
    const borderColor = options?.borderColor;
    const borderWidth = options?.borderWidth ?? 0;
    const degreesAngle = toDegrees(options?.rotate ?? degrees(0));
    const width = (options?.width ?? 50) + borderWidth;
    const height = (options?.height ?? 50) + borderWidth;

    assertMultiple(degreesAngle, 'degreesAngle', 90);

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

    const adjustedDims = adjustDimsForRotation({ width, height }, degreesAngle);
    widget.setRectangle({ x, y, ...adjustedDims });

    const ac = widget.getOrCreateAppearanceCharacteristics();
    ac.setBackgroundColor(colorToComponents(color));
    ac.setRotation(degreesAngle);
    if (borderColor) ac.setBorderColor(colorToComponents(borderColor));

    const bs = widget.getOrCreateBorderStyle();
    if (borderWidth) bs.setWidth(borderWidth);

    // Set appearance streams for widget
    this.updateWidgetAppearance(widget, apStateValue);

    // Add widget to the given page
    page.node.addAnnot(widgetRef);
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
    const appearances = normalizeAppearance(apProvider(this, widget));
    this.updateOnOffWidgetAppearance(widget, onValue, appearances);
  }
}
