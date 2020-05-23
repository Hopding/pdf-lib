import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroButton } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';

/**
 * Represents a button field of a [[PDFForm]].
 */
export default class PDFButton extends PDFField {
  static of = (acroButton: PDFAcroButton, doc: PDFDocument) =>
    new PDFButton(acroButton, doc);

  /** The low-level PDFAcroButton wrapped by this button. */
  readonly acroField: PDFAcroButton;

  /** The document to which this button belongs. */
  readonly doc: PDFDocument;

  private constructor(acroButton: PDFAcroButton, doc: PDFDocument) {
    super(acroButton, doc);

    assertIs(acroButton, 'acroButton', [[PDFAcroButton, 'PDFAcroButton']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroButton;
    this.doc = doc;
  }
}
