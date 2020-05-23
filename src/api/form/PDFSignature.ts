import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroSignature } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';

/**
 * Represents a signature field of a [[PDFForm]].
 */
export default class PDFSignature extends PDFField {
  static of = (acroSignature: PDFAcroSignature, doc: PDFDocument) =>
    new PDFSignature(acroSignature, doc);

  /** The low-level PDFAcroSignature wrapped by this signature. */
  readonly acroField: PDFAcroSignature;

  /** The document to which this signature belongs. */
  readonly doc: PDFDocument;

  private constructor(acroSignature: PDFAcroSignature, doc: PDFDocument) {
    super(acroSignature, doc);

    assertIs(acroSignature, 'acroSignature', [
      [PDFAcroSignature, 'PDFAcroSignature'],
    ]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroSignature;
    this.doc = doc;
  }
}
