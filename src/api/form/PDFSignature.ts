import PDFDocument from 'src/api/PDFDocument';
import PDFField from 'src/api/form/PDFField';

import { PDFRef, PDFAcroSignature } from 'src/core';
import { assertIs } from 'src/utils';

/**
 * Represents a signature field of a [[PDFForm]].
 */
export default class PDFSignature extends PDFField {
  static of = (
    acroSignature: PDFAcroSignature,
    ref: PDFRef,
    doc: PDFDocument,
  ) => new PDFSignature(acroSignature, ref, doc);

  /** The low-level PDFAcroSignature wrapped by this signature. */
  readonly acroField: PDFAcroSignature;

  private constructor(
    acroSignature: PDFAcroSignature,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    super(acroSignature, ref, doc);

    assertIs(acroSignature, 'acroSignature', [
      [PDFAcroSignature, 'PDFAcroSignature'],
    ]);

    this.acroField = acroSignature;
  }
}
