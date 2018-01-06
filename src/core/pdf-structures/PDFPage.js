/* @flow */
import { PDFContentStream } from '.';
import {
  PDFDictionary,
  PDFArray,
  PDFRawStream,
  PDFIndirectObject,
} from '../pdf-objects';
import { validate, isInstance } from '../../utils/validate';

const VALID_KEYS = Object.freeze([
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

class PDFPage extends PDFDictionary {
  static from = (object: PDFDictionary) => new PDFPage(object);

  static validKeys = VALID_KEYS;

  /**
  There are three possibilities, the page can:
    (1) have no "Contents"
    (2) have an array of indirect objects as its "Contents"
    (3) have a standalone indirect object as its "Contents"
  */
  get contentStreams(): Array<PDFRawStream | PDFContentStream> {
    let streams;
    if (!this.get('Contents')) streams = [];
    const contents = this.get('Contents').object;
    streams = contents.is(PDFArray) ? contents.array : [contents];
    return Object.freeze(streams.slice());
  }

  /** Convert "Contents" to array if it exists and is not already */
  normalizeContents = () => {
    if (this.get('Contents')) {
      const contents = this.get('Contents');
      if (!contents.object.is(PDFArray)) {
        this.set('Contents', PDFArray.fromArray([contents]));
      }
    }
  };

  addContentStream = (contentStream: PDFIndirectObject<PDFContentStream>) => {
    validate(
      contentStream,
      isInstance(PDFIndirectObject),
      '"contentStream" must be of type PDFIndirectObject<PDFContentStream>',
    );
    validate(
      contentStream.pdfObject,
      isInstance(PDFContentStream),
      '"contentStream" must be of type PDFIndirectObject<PDFContentStream>',
    );

    this.normalizeContents();
    if (!this.get('Contents')) {
      this.set('Contents', PDFArray.fromArray([contentStream]));
    } else {
      this.get('Contents').object.push(contentStream);
    }
  };
}

export default PDFPage;
