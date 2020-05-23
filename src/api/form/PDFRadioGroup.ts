import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroRadioButton } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';

/**
 * Represents a radio group field of a [[PDFForm]].
 */
export default class PDFRadioGroup extends PDFField {
  static of = (acroRadioButton: PDFAcroRadioButton, doc: PDFDocument) =>
    new PDFRadioGroup(acroRadioButton, doc);

  /** The low-level PDFAcroRadioButton wrapped by this radio group. */
  readonly acroField: PDFAcroRadioButton;

  /** The document to which this radio group belongs. */
  readonly doc: PDFDocument;

  private constructor(acroRadioButton: PDFAcroRadioButton, doc: PDFDocument) {
    super(acroRadioButton, doc);

    assertIs(acroRadioButton, 'acroRadioButton', [
      [PDFAcroRadioButton, 'PDFAcroRadioButton'],
    ]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroRadioButton;
    this.doc = doc;
  }
}
