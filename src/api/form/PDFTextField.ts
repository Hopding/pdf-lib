import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroText, AcroTextFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import { PDFHexString } from 'src/core';

/**
 * Represents a text field of a [[PDFForm]].
 */
export default class PDFTextField extends PDFField {
  static of = (acroText: PDFAcroText, doc: PDFDocument) =>
    new PDFTextField(acroText, doc);

  /** The low-level PDFAcroText wrapped by this text field. */
  readonly acroField: PDFAcroText;

  /** The document to which this text field belongs. */
  readonly doc: PDFDocument;

  private constructor(acroText: PDFAcroText, doc: PDFDocument) {
    super(acroText, doc);

    assertIs(acroText, 'acroText', [[PDFAcroText, 'PDFAcroText']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroText;
    this.doc = doc;
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
}
