import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import { PDFAcroCheckBox } from 'src/core/acroform';
import { assertIs, assertOrUndefined } from 'src/utils';

import PDFField, {
  FieldAppearanceOptions,
  assertFieldAppearanceOptions,
} from 'src/api/form/PDFField';
import { PDFName, PDFRef, PDFDict } from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultCheckBoxAppearanceProvider,
} from 'src/api/form/appearances';
import { rgb } from '../colors';
import { degrees } from '../rotations';
import { MissingOnValueCheckError } from '../errors';

/**
 * Represents a check box field of a [[PDFForm]].
 */
export default class PDFCheckBox extends PDFField {
  static of = (acroCheckBox: PDFAcroCheckBox, ref: PDFRef, doc: PDFDocument) =>
    new PDFCheckBox(acroCheckBox, ref, doc);

  /** The low-level PDFAcroCheckBox wrapped by this check box. */
  readonly acroField: PDFAcroCheckBox;

  private constructor(
    acroCheckBox: PDFAcroCheckBox,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    super(acroCheckBox, ref, doc);

    assertIs(acroCheckBox, 'acroCheckBox', [
      [PDFAcroCheckBox, 'PDFAcroCheckBox'],
    ]);

    this.acroField = acroCheckBox;
  }

  check() {
    const onValue = this.acroField.getOnValue();
    if (!onValue) throw new MissingOnValueCheckError(onValue);
    this.markAsDirty();
    this.acroField.setValue(onValue);
  }

  uncheck() {
    this.markAsDirty();
    this.acroField.setValue(PDFName.of('Off'));
  }

  isChecked(): boolean {
    const onValue = this.acroField.getOnValue();
    return !!onValue && onValue === this.acroField.getValue();
  }

  addToPage(page: PDFPage, options?: FieldAppearanceOptions) {
    assertIs(page, 'page', [[PDFPage, 'PDFPage']]);
    assertFieldAppearanceOptions(options);

    // Create a widget for this check box
    const widget = this.createWidget({
      x: options?.x ?? 0,
      y: options?.y ?? 0,
      width: options?.width ?? 50,
      height: options?.height ?? 50,
      textColor: options?.textColor ?? rgb(0, 0, 0),
      backgroundColor: options?.backgroundColor ?? rgb(1, 1, 1),
      borderColor: options?.borderColor,
      borderWidth: options?.borderWidth ?? 0,
      rotate: options?.rotate ?? degrees(0),
    });
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    this.acroField.addWidget(widgetRef);

    // Set appearance streams for widget
    widget.setAppearanceState(PDFName.of('Off'));
    this.updateWidgetAppearance(widget, PDFName.of('Yes'));

    // Add widget to the given page
    page.node.addAnnot(widgetRef);
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

  updateAppearances(provider?: AppearanceProviderFor<PDFCheckBox>) {
    assertOrUndefined(provider, 'provider', [Function]);

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const onValue = widget.getOnValue();
      if (!onValue) continue;
      this.updateWidgetAppearance(widget, onValue, provider);
    }
    this.markAsClean();
  }

  private updateWidgetAppearance(
    widget: PDFWidgetAnnotation,
    onValue: PDFName,
    provider?: AppearanceProviderFor<PDFCheckBox>,
  ) {
    const apProvider = provider ?? defaultCheckBoxAppearanceProvider;
    const appearances = normalizeAppearance(apProvider(this, widget));
    this.updateOnOffWidgetAppearance(widget, onValue, appearances);
  }
}
