import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import { PDFAcroPushButton } from 'src/core/acroform';
import { assertIs, assertOrUndefined } from 'src/utils';
import { PDFRef, PDFStream } from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultButtonAppearanceProvider,
} from 'src/api/form/appearances';

import PDFField, {
  FieldAppearanceOptions,
  assertFieldAppearanceOptions,
} from 'src/api/form/PDFField';
import { rgb } from '../colors';
import { degrees } from '../rotations';

/**
 * Represents a button field of a [[PDFForm]].
 */
export default class PDFButton extends PDFField {
  static of = (
    acroPushButton: PDFAcroPushButton,
    ref: PDFRef,
    doc: PDFDocument,
  ) => new PDFButton(acroPushButton, ref, doc);

  /** The low-level PDFAcroPushButton wrapped by this button. */
  readonly acroField: PDFAcroPushButton;

  private constructor(
    acroPushButton: PDFAcroPushButton,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    super(acroPushButton, ref, doc);

    assertIs(acroPushButton, 'acroButton', [
      [PDFAcroPushButton, 'PDFAcroPushButton'],
    ]);

    this.acroField = acroPushButton;
  }

  addToPage(
    text: string,
    font: PDFFont,
    page: PDFPage,
    options?: FieldAppearanceOptions,
  ) {
    assertOrUndefined(text, 'text', ['string']);
    assertOrUndefined(font, 'font', [[PDFFont, 'PDFFont']]);
    assertOrUndefined(page, 'page', [[PDFPage, 'PDFPage']]);
    assertFieldAppearanceOptions(options);

    // Create a widget for this button
    const widget = this.createWidget({
      x: (options?.x ?? 0) - (options?.borderWidth ?? 0) / 2,
      y: (options?.y ?? 0) - (options?.borderWidth ?? 0) / 2,
      width: options?.width ?? 100,
      height: options?.height ?? 50,
      textColor: options?.textColor ?? rgb(0, 0, 0),
      backgroundColor: options?.backgroundColor ?? rgb(0.75, 0.75, 0.75),
      borderColor: options?.borderColor,
      borderWidth: options?.borderWidth ?? 0,
      rotate: options?.rotate ?? degrees(0),
      caption: text,
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
    provider?: AppearanceProviderFor<PDFButton>,
  ) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    assertOrUndefined(provider, 'provider', [Function]);

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      this.updateWidgetAppearance(widget, font, provider);
    }
  }

  private updateWidgetAppearance(
    widget: PDFWidgetAnnotation,
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFButton>,
  ) {
    const apProvider = provider ?? defaultButtonAppearanceProvider;
    const appearances = normalizeAppearance(apProvider(this, widget, font));
    this.updateWidgetAppearanceWithFont(widget, font, appearances);
  }
}
