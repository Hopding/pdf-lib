import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import { PDFAcroText, AcroTextFlags } from 'src/core/acroform';
import { assertIs, assertIsOneOf } from 'src/utils';

import PDFField, { FieldAppearanceOptions } from 'src/api/form/PDFField';
import { PDFHexString, PDFRef, PDFStream } from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultTextFieldAppearanceProvider,
} from 'src/api/form/appearances';
import { rgb } from '../colors';
import { degrees } from '../rotations';
import { RichTextFieldReadError } from '../errors';
import { TextAlignment } from '../text/alignment';

/**
 * Represents a text field of a [[PDFForm]].
 */
export default class PDFTextField extends PDFField {
  static of = (acroText: PDFAcroText, ref: PDFRef, doc: PDFDocument) =>
    new PDFTextField(acroText, ref, doc);

  /** The low-level PDFAcroText wrapped by this text field. */
  readonly acroField: PDFAcroText;

  private constructor(acroText: PDFAcroText, ref: PDFRef, doc: PDFDocument) {
    super(acroText, ref, doc);

    assertIs(acroText, 'acroText', [[PDFAcroText, 'PDFAcroText']]);

    this.acroField = acroText;
  }

  setText(text: string | undefined) {
    const maxLength = this.getMaxLength();
    if (maxLength !== undefined && text && text.length > maxLength) {
      throw new Error(
        `TODO: FIX ME! exceeds max length ${text.length}/${maxLength}`,
      );
    }

    this.markAsDirty();

    if (text) {
      this.setHasRichText(false);
      this.acroField.setValue(PDFHexString.fromText(text));
    } else {
      this.acroField.removeValue();
    }
  }

  getText(): string | undefined {
    const value = this.acroField.getValue();
    if (!value && this.hasRichText()) {
      throw new RichTextFieldReadError(this.getName());
    }
    return value?.decodeText();
  }

  setAlignment(alignment: TextAlignment) {
    assertIsOneOf(alignment, 'alignment', TextAlignment);
    this.markAsDirty();
    this.acroField.setQuadding(alignment);
  }

  getAlignment(): TextAlignment {
    const quadding = this.acroField.getQuadding();

    // prettier-ignore
    return (
        quadding === 0 ? TextAlignment.Left
      : quadding === 1 ? TextAlignment.Center
      : quadding === 2 ? TextAlignment.Right
      : TextAlignment.Left
    );
  }

  // TODO: What if value is already over `maxLength`?
  setMaxLength(maxLength: number) {
    // TODO: Assert >= 0
    this.markAsDirty();
    this.acroField.setMaxLength(maxLength);
  }

  getMaxLength(): number | undefined {
    return this.acroField.getMaxLength();
  }

  isMultiline(): boolean {
    return this.acroField.hasFlag(AcroTextFlags.Multiline);
  }

  setIsMultiline(isMultiline: boolean) {
    this.markAsDirty();
    this.acroField.setFlagTo(AcroTextFlags.Multiline, isMultiline);
  }

  isPassword(): boolean {
    return this.acroField.hasFlag(AcroTextFlags.Password);
  }

  setIsPassword(isPassword: boolean) {
    this.acroField.setFlagTo(AcroTextFlags.Password, isPassword);
  }

  isFileSelect(): boolean {
    return this.acroField.hasFlag(AcroTextFlags.FileSelect);
  }

  setIsFileSelect(isFileSelect: boolean) {
    this.acroField.setFlagTo(AcroTextFlags.FileSelect, isFileSelect);
  }

  doesSpellCheck(): boolean {
    return !this.acroField.hasFlag(AcroTextFlags.DoNotSpellCheck);
  }

  setSpellCheck(enable: boolean) {
    this.acroField.setFlagTo(AcroTextFlags.DoNotSpellCheck, !enable);
  }

  doesScroll(): boolean {
    return !this.acroField.hasFlag(AcroTextFlags.DoNotScroll);
  }

  setScroll(enable: boolean) {
    this.acroField.setFlagTo(AcroTextFlags.DoNotScroll, !enable);
  }

  /** Field is split into n equal-sized cells with one character in each (aka combed) */
  isEvenlySpaced(): boolean {
    return (
      this.acroField.hasFlag(AcroTextFlags.Comb) &&
      !this.isMultiline() &&
      !this.isPassword() &&
      !this.isFileSelect() &&
      this.getMaxLength() !== undefined
    );
  }

  setIsEvenlySpaced(isEvenlySpaced: boolean) {
    // TODO: `console.warn` if `this.getMaxLength() === undefined` since
    //       otherwise the field will not take on a combed appearance.

    this.markAsDirty();

    if (isEvenlySpaced) {
      this.setIsMultiline(false);
      this.setIsPassword(false);
      this.setIsFileSelect(false);
    }

    this.acroField.setFlagTo(AcroTextFlags.Comb, isEvenlySpaced);
  }

  hasRichText(): boolean {
    return this.acroField.hasFlag(AcroTextFlags.RichText);
  }

  setHasRichText(enable: boolean) {
    this.acroField.setFlagTo(AcroTextFlags.RichText, enable);
  }

  addToPage(font: PDFFont, page: PDFPage, options?: FieldAppearanceOptions) {
    // Create a widget for this text field
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
    this.updateAppearances(font);
  }

  updateAppearances(
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFTextField>,
  ) {
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
    provider?: AppearanceProviderFor<PDFTextField>,
  ) {
    const apProvider = provider ?? defaultTextFieldAppearanceProvider;
    const appearances = normalizeAppearance(apProvider(this, widget, font));
    this.updateWidgetAppearanceWithFont(widget, font, appearances);
  }
}