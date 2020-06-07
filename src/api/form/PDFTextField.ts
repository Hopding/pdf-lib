import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import { PDFAcroText, AcroTextFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import { PDFHexString, PDFOperator, PDFRef, PDFContentStream } from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultTextFieldAppearanceProvider,
} from 'src/api/form/appearances';

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
      throw new Error('TODO: FIX ME! reading rich text fields not supported?');
    }
    return value?.decodeText();
  }

  setAlignment(alignment: 'left' | 'center' | 'right') {
    // TODO: Validate `alignment`
    if (alignment === 'left') this.acroField.setQuadding(0);
    else if (alignment === 'center') this.acroField.setQuadding(1);
    else if (alignment === 'right') this.acroField.setQuadding(2);
    else throw new Error('TODO: FIX ME! Invalid alignment');
  }

  getAlignment(): 'left' | 'center' | 'right' {
    const quadding = this.acroField.getQuadding();
    if (quadding === 0) return 'left';
    else if (quadding === 1) return 'center';
    else if (quadding === 2) return 'right';
    else return 'left';
  }

  // TODO: What is value is already over `maxLength`?
  setMaxLength(maxLength: number) {
    // TODO: Assert >= 0
    this.acroField.setMaxLength(maxLength);
  }

  getMaxLength(): number | undefined {
    return this.acroField.getMaxLength();
  }

  isMultiline(): boolean {
    return this.acroField.hasFlag(AcroTextFlags.Multiline);
  }

  setIsMultiline(isMultiline: boolean) {
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
    if (this.getMaxLength() === undefined) {
      throw new Error('TODO: FIX ME! need to have a maxLength defined');
    }

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
    provider?: AppearanceProviderFor<PDFTextField>,
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
    provider?: AppearanceProviderFor<PDFTextField>,
  ) {
    const apProvider = provider ?? defaultTextFieldAppearanceProvider;

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
}
