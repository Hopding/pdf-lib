import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroText } from 'src/core/acroform';
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
}
