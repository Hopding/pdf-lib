/* @flow */
import _ from 'lodash';
import { PDFContentStream } from '.';
import {
  PDFDictionary,
  PDFArray,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFIndirectObject,
  PDFIndirectReference,
} from '../pdf-objects';
import {
  validate,
  validateArr,
  isInstance,
  isIdentity,
  optional,
} from '../../utils/validate';

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
  static create = (size: [number, number], resources?: PDFDictionary) => {
    validate(size.length, isIdentity(2), 'size tuple must have two elements');
    validateArr(size, _.isNumber, 'size tuple entries must be Numbers.');
    validate(
      resources,
      optional(isInstance(PDFDictionary)),
      'resources must be a PDFDictionary',
    );

    const mediaBox = [0, 0, size[0], size[1]];
    const page = new PDFPage(
      {
        Type: PDFName.from('Page'),
        // TODO: Convert this to use PDFRectangle
        MediaBox: PDFArray.fromArray(mediaBox.map(PDFNumber.fromNumber)),
      },
      PDFPage.validKeys,
    );
    if (resources) page.set('Resources', resources);
    return page;
  };

  static from = (object: PDFDictionary) =>
    new PDFPage(object, PDFPage.validKeys);

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
  // TODO: See is this is inefficient...
  normalizeContents = () => {
    if (this.get('Contents')) {
      const contents = this.get('Contents');
      if (!contents.object.is(PDFArray)) {
        this.set('Contents', PDFArray.fromArray([contents]));
      }
    }
  };

  addContentStream = (
    contentStream: PDFIndirectReference<PDFContentStream>,
  ) => {
    validate(
      contentStream,
      isInstance(PDFIndirectReference),
      '"contentStream" must be of type PDFIndirectReference<PDFContentStream>',
    );
    // validate(
    //   contentStream.pdfObject,
    //   isInstance(PDFContentStream),
    //   '"contentStream" must be of type PDFIndirectObject<PDFContentStream>',
    // );

    this.normalizeContents();
    if (!this.get('Contents')) {
      this.set('Contents', PDFArray.fromArray([contentStream]));
    } else {
      this.get('Contents').object.push(contentStream);
    }

    return this;
  };
}

export default PDFPage;
