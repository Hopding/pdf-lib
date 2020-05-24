import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroText, AcroTextFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';

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

  // setText(text: string) {}

  // getText(): string {}

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
      !this.isFileSelect()
      // TODO: Should also require a `MaxLen` to be defined
    );
  }

  // TODO: Should only be able to enable this is a `MaxLen` is available too
  setIsEvenlySpaced(isEvenlySpaced: boolean) {
    if (isEvenlySpaced) {
      this.setIsMultiline(false);
      this.setIsPassword(false);
      this.setIsFileSelect(false);
    }
    this.acroField.setFlagTo(AcroTextFlags.Comb, isEvenlySpaced);
  }

  hasSimpleText(): boolean {
    return this.acroField.hasFlag(AcroTextFlags.RichText);
  }

  setHasSimpleText(enable: boolean) {
    this.acroField.setFlagTo(AcroTextFlags.RichText, enable);
  }
}
