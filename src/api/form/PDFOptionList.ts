import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroListBox } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';

/**
 * Represents an option list field of a [[PDFForm]].
 */
export default class PDFOptionList extends PDFField {
  static of = (acroListBox: PDFAcroListBox, doc: PDFDocument) =>
    new PDFOptionList(acroListBox, doc);

  /** The low-level PDFAcroListBox wrapped by this option list. */
  readonly acroField: PDFAcroListBox;

  /** The document to which this option list belongs. */
  readonly doc: PDFDocument;

  private constructor(acroListBox: PDFAcroListBox, doc: PDFDocument) {
    super(acroListBox, doc);

    assertIs(acroListBox, 'acroListBox', [[PDFAcroListBox, 'PDFAcroListBox']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroListBox;
    this.doc = doc;
  }
}
