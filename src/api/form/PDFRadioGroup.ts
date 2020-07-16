import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import { PDFAcroRadioButton, AcroButtonFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField, { FieldAppearanceOptions } from 'src/api/form/PDFField';
import { PDFName, PDFRef, PDFHexString, PDFDict } from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultRadioGroupAppearanceProvider,
} from 'src/api/form/appearances';
import { rgb } from '../colors';
import { degrees } from '../rotations';

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
    options?: FieldAppearanceOptions,
  ) {
    // Create a widget for this radio button
    const widget = this.createWidget({
      x: options?.x ?? 0,
      y: options?.y ?? 0,
      width: options?.width ?? 50,
      height: options?.height ?? 50,
      textColor: options?.textColor ?? rgb(0, 0, 0),
      backgroundColor: options?.backgroundColor ?? rgb(1, 1, 1),
      borderColor: options?.borderColor ?? rgb(0, 0, 0),
      borderWidth: options?.borderWidth ?? 1,
      rotate: options?.rotate ?? degrees(0),
    });
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    const apStateValue = this.acroField.addWidgetWithOpt(
      widgetRef,
      PDFHexString.fromText(option),
    );

    // Set appearance streams for widget
    widget.setAppearanceState(PDFName.of('Off'));
    this.updateWidgetAppearance(widget, apStateValue);

    // Add widget to the given page
    page.node.addAnnot(widgetRef);
  }

  // // TODO: Figure out why this seems to crash Acrobat. Maybe it's because we
  // //       aren't removing the widget reference from the page's Annots?
  // removeOption(option: string) {
  //   assertIs(option, 'option', ['string']);
  //   // TODO: Assert is valid `option`!

  //   const onValues = this.acroField.getOnValues();
  //   const exportValues = this.acroField.getExportValues();
  //   if (exportValues) {
  //     for (let idx = 0, len = exportValues.length; idx < len; idx++) {
  //       if (exportValues[idx].decodeText() === option) {
  //         this.acroField.removeWidget(idx);
  //         this.acroField.removeExportValue(idx);
  //       }
  //     }
  //   } else {
  //     for (let idx = 0, len = onValues.length; idx < len; idx++) {
  //       const value = onValues[idx];
  //       if (value.decodeText() === option) {
  //         this.acroField.removeWidget(idx);
  //         this.acroField.removeExportValue(idx);
  //       }
  //     }
  //   }
  // }

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
    } else {
      for (let idx = 0, len = onValues.length; idx < len; idx++) {
        const value = onValues[idx];
        if (value.decodeText() === option) this.acroField.setValue(value);
      }
    }
  }

  clear() {
    this.acroField.setValue(PDFName.of('Off'));
  }

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

  needsAppearancesUpdate(): boolean {
    if (this.isDirty()) return true;

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const onValue = widget.getOnValue();
      const normal = widget.getAppearances()?.normal;

      const hasOnAppearance =
        normal instanceof PDFDict && onValue && normal.has(onValue);
      const hasOffAppearance =
        normal instanceof PDFDict && normal.has(PDFName.of('Off'));

      if (!hasOnAppearance || !hasOffAppearance) return true;
    }

    return false;
  }

  defaultUpdateAppearances() {
    this.updateAppearances();
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
