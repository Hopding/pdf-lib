import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroField, AcroFieldFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';
import { PDFRef } from 'src/core';

// TODO: Should fields always have refs? What about the PDFForm?
// TODO: Note in documentation that a single field can actually be rendered
//       in multiple locations and pages of a single document.

/**
 * Represents a field of a [[PDFForm]].
 */
export default class PDFField {
  /** The low-level PDFAcroField wrapped by this field. */
  readonly acroField: PDFAcroField;

  /** The unique reference assigned to this radio group within the document. */
  readonly ref: PDFRef;

  /** The document to which this field belongs. */
  readonly doc: PDFDocument;

  protected constructor(
    acroField: PDFAcroField,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    assertIs(acroField, 'acroField', [[PDFAcroField, 'PDFAcroField']]);
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroField;
    this.ref = ref;
    this.doc = doc;
  }

  /**
   * Returns the fully qualified name of this field as a string.
   */
  getName(): string {
    return this.acroField.getFullyQualifiedName() ?? '';
  }

  isReadOnly(): boolean {
    return this.acroField.hasFlag(AcroFieldFlags.ReadOnly);
  }

  setReadOnly(readOnly: boolean) {
    this.acroField.setFlagTo(AcroFieldFlags.ReadOnly, readOnly);
  }

  isRequired(): boolean {
    return this.acroField.hasFlag(AcroFieldFlags.Required);
  }

  setRequired(required: boolean) {
    this.acroField.setFlagTo(AcroFieldFlags.Required, required);
  }

  isExported(): boolean {
    return !this.acroField.hasFlag(AcroFieldFlags.NoExport);
  }

  setExported(exported: boolean) {
    this.acroField.setFlagTo(AcroFieldFlags.NoExport, !exported);
  }
}
