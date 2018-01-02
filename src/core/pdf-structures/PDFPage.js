/* @flow */
import { PDFContentStream } from '.';
import PDFDocument from '../pdf-document/PDFDocument';
import {
  PDFDictionary,
  PDFStream,
  PDFArray,
  PDFIndirectObject,
} from '../pdf-objects';
import { validate, isInstance } from '../../utils/validate';

class PDFPage extends PDFDictionary {
  pdfDocument: PDFDocument;

  static validKeys = Object.freeze([
    'Type',
    'Parent',
    'LastModified',
    'Resources',
    'MediaBox',
    'CropBox',
    'BleedBox',
    'TrimBox',
    'ArtBox',
    'BoxColorInfo',
    'Contents',
    'Rotate',
    'Group',
    'Thumb',
    'B',
    'Dur',
    'Trans',
    'Annots',
    'AA',
    'Metadata',
    'PieceInfo',
    'StructParents',
    'ID',
    'PZ',
    'SeparationInfo',
    'Tabs',
    'TemplateInstantiated',
    'PresSteps',
    'UserUnit',
    'VP',
  ]);

  static from = (object: PDFDictionary) => new PDFPage(object);

  setPdfDocument = (doc: PDFDocument) => {
    validate(doc, isInstance(PDFDocument), 'PDFPage.doc must be PDFDocument');
    this.pdfDocument = doc;
    return this;
  };

  getContentStreams = (): Array<PDFStream> => {
    const contents = this.get('Contents');

    // Could be either a PDFStream or PDFArray reference
    if (contents instanceof PDFIndirectObject) {
      if (contents.pdfObject instanceof PDFStream) {
        return [contents.pdfObject];
      } else if (contents.pdfObject instanceof PDFArray) {
        return contents.pdfObject.array;
      }
    } else if (contents instanceof PDFArray) {
      return contents.array;
    }

    // This page has no "Contents"
    return [];
  };

  addContentStream = (contentStream: PDFContentStream) => {
    if (!(contentStream instanceof PDFContentStream)) {
      throw new Error('Argument must be instance of PDFContentStreams');
    }
    const indirectObject = this.pdfDocument.createIndirectObject(contentStream);

    const contents = this.get('Contents');

    // Could be either a PDFStream or PDFArray reference
    if (contents instanceof PDFIndirectObject) {
      if (contents.pdfObject instanceof PDFStream) {
        this.set('Contents', PDFArray.fromArray([contents, indirectObject]));
      } else if (contents.pdfObject instanceof PDFArray) {
        contents.pdfObject.push(indirectObject);
      }
    } else if (contents instanceof PDFArray) {
      contents.push(indirectObject);
    } else {
      // Page currently has no "Contents"
      this.set('Contents', indirectObject);
    }
  };
}

export default PDFPage;
