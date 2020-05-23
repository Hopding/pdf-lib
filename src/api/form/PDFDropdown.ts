import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroComboBox } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';

/**
 * Represents a dropdown field of a [[PDFForm]].
 */
export default class PDFDropdown extends PDFField {
  static of = (acroComboBox: PDFAcroComboBox, doc: PDFDocument) =>
    new PDFDropdown(acroComboBox, doc);

  /** The low-level PDFAcroComboBox wrapped by this check box. */
  readonly acroField: PDFAcroComboBox;

  /** The document to which this dropdown belongs. */
  readonly doc: PDFDocument;

  private constructor(acroComboBox: PDFAcroComboBox, doc: PDFDocument) {
    super(acroComboBox, doc);

    assertIs(acroComboBox, 'acroComboBox', [
      [PDFAcroComboBox, 'PDFAcroComboBox'],
    ]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroComboBox;
    this.doc = doc;
  }
}
