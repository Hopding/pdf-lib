import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroField } from 'src/core/acroform';
import { assertIs } from 'src/utils';

/**
 * Represents a field of a [[PDFForm]].
 */
export default class PDFField {
  /** The low-level PDFAcroField wrapped by this field. */
  readonly acroField: PDFAcroField;

  /** The document to which this field belongs. */
  readonly doc: PDFDocument;

  protected constructor(acroField: PDFAcroField, doc: PDFDocument) {
    assertIs(acroField, 'acroField', [[PDFAcroField, 'PDFAcroField']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroField;
    this.doc = doc;
  }

  getName(): string {
    return this.acroField.getFullyQualifiedName() ?? '';
  }
}
