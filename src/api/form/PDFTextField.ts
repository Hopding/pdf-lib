import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import PDFField, {
  FieldAppearanceOptions,
  assertFieldAppearanceOptions,
} from 'src/api/form/PDFField';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultTextFieldAppearanceProvider,
} from 'src/api/form/appearances';
import { rgb } from 'src/api/colors';
import { degrees } from 'src/api/rotations';
import { RichTextFieldReadError, ExceededMaxLengthError } from 'src/api/errors';
import { TextAlignment } from 'src/api/text/alignment';

import {
  PDFHexString,
  PDFRef,
  PDFStream,
  PDFAcroText,
  AcroTextFlags,
  PDFWidgetAnnotation,
} from 'src/core';
import {
  assertIs,
  assertIsOneOf,
  assertOrUndefined,
  assertRange,
} from 'src/utils';

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
    assertOrUndefined(text, 'text', ['string']);

    const maxLength = this.getMaxLength();
    if (maxLength !== undefined && text && text.length > maxLength) {
      throw new ExceededMaxLengthError(text.length, maxLength, this.getName());
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

  setMaxLength(maxLength: number) {
    assertRange(maxLength, 'maxLength', 0, Number.MAX_SAFE_INTEGER);

    const text = this.getText();
    if (text && text.length > maxLength) {
      const msg = `maxLength of ${maxLength} is less than ${text.length}, the length of this field's current value`;
      console.warn(msg);
    }

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
    assertIs(isMultiline, 'isMultiline', ['boolean']);
    this.markAsDirty();
    this.acroField.setFlagTo(AcroTextFlags.Multiline, isMultiline);
  }

  isPassword(): boolean {
    return this.acroField.hasFlag(AcroTextFlags.Password);
  }

  setIsPassword(isPassword: boolean) {
    assertIs(isPassword, 'isPassword', ['boolean']);
    this.acroField.setFlagTo(AcroTextFlags.Password, isPassword);
  }

  isFileSelect(): boolean {
    return this.acroField.hasFlag(AcroTextFlags.FileSelect);
  }

  setIsFileSelect(isFileSelect: boolean) {
    assertIs(isFileSelect, 'isFileSelect', ['boolean']);
    this.acroField.setFlagTo(AcroTextFlags.FileSelect, isFileSelect);
  }

  doesSpellCheck(): boolean {
    return !this.acroField.hasFlag(AcroTextFlags.DoNotSpellCheck);
  }

  setSpellCheck(enable: boolean) {
    assertIs(enable, 'enable', ['boolean']);
    this.acroField.setFlagTo(AcroTextFlags.DoNotSpellCheck, !enable);
  }

  doesScroll(): boolean {
    return !this.acroField.hasFlag(AcroTextFlags.DoNotScroll);
  }

  setScroll(enable: boolean) {
    assertIs(enable, 'enable', ['boolean']);
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
    assertIs(isEvenlySpaced, 'isEvenlySpaced', ['boolean']);

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
    assertIs(enable, 'enable', ['boolean']);
    this.acroField.setFlagTo(AcroTextFlags.RichText, enable);
  }

  addToPage(font: PDFFont, page: PDFPage, options?: FieldAppearanceOptions) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    assertIs(page, 'page', [[PDFPage, 'PDFPage']]);
    assertFieldAppearanceOptions(options);

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
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    this.updateAppearances(font);
  }

  updateAppearances(
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFTextField>,
  ) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    assertOrUndefined(provider, 'provider', [Function]);

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
