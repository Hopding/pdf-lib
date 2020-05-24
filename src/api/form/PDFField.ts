import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroField, AcroFieldFlags } from 'src/core/acroform';
import { assertIs } from 'src/utils';

// TODO: Should fields always have refs? What about the PDFForm?
// TODO: Note in documentation that a single field can actually be rendered
//       in multiple locations and pages of a single document.

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
