import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroPushButton } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';

/**
 * Represents a button field of a [[PDFForm]].
 */
export default class PDFButton extends PDFField {
  static of = (acroPushButton: PDFAcroPushButton, doc: PDFDocument) =>
    new PDFButton(acroPushButton, doc);

  /** The low-level PDFAcroPushButton wrapped by this button. */
  readonly acroField: PDFAcroPushButton;

  /** The document to which this button belongs. */
  readonly doc: PDFDocument;

  private constructor(acroPushButton: PDFAcroPushButton, doc: PDFDocument) {
    super(acroPushButton, doc);

    assertIs(acroPushButton, 'acroButton', [
      [PDFAcroPushButton, 'PDFAcroPushButton'],
    ]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroPushButton;
    this.doc = doc;
  }
}
