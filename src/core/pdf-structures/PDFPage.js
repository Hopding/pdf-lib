/* @flow */
import _ from 'lodash';
import {
  validate,
  validateArr,
  isInstance,
  isIdentity,
  optional,
} from 'utils/validate';
import { PDFContentStream } from '.';
import {
  PDFObject,
  PDFDictionary,
  PDFArray,
  PDFName,
  PDFNumber,
  PDFIndirectReference,
} from '../pdf-objects';

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
  // get contentStreams(): Array<PDFRawStream | PDFContentStream> {
  //   let streams;
  //   if (!this.get('Contents')) streams = [];
  //   const contents = this.get('Contents').object;
  //   streams = contents.is(PDFArray) ? contents.array : [contents];
  //   return Object.freeze(streams.slice());
  // }

  /** Convert "Contents" to array if it exists and is not already */
  // TODO: See is this is inefficient...
  normalizeContents = (
    lookup: (PDFIndirectReference<*> | PDFObject) => PDFObject,
  ) => {
    if (this.get('Contents')) {
      const contents = lookup(this.get('Contents'));
      if (!contents.is(PDFArray)) {
        this.set('Contents', PDFArray.fromArray([this.get('Contents')]));
      }
    }
  };

  normalizeResources = () => {
    if (!this.get('Resources')) {
      this.set('Resources', PDFDictionary.from());
      this.get('Resources').set('Font', PDFDictionary.from());
    }
  };

  // TODO: Consider allowing *insertion* of content streams so order can be changed
  addContentStreams = (
    lookup: (PDFIndirectReference<*> | PDFObject) => PDFObject,
    ...contentStreams: PDFIndirectReference<PDFContentStream>[]
  ) => {
    validateArr(
      contentStreams,
      isInstance(PDFIndirectReference),
      '"contentStream" must be of type PDFIndirectReference<PDFContentStream>',
    );

    this.normalizeContents(lookup);
    if (!this.get('Contents')) {
      this.set('Contents', PDFArray.fromArray(contentStreams));
    } else {
      const Contents: PDFArray = lookup(this.get('Contents'));
      Contents.push(...contentStreams);
    }

    return this;
  };

  addFontDictionary = (
    lookup: (PDFIndirectReference<*> | PDFObject) => PDFObject,
    key: string, // TODO: Allow PDFName objects to be passed too
    fontDict: PDFIndirectReference<PDFDictionary>, // Allow PDFDictionaries as well
  ) => {
    validate(key, _.isString, '"key" must be a string');
    validate(
      fontDict,
      isInstance(PDFIndirectReference),
      '"fontDict" must be an instance of PDFIndirectReference',
    );

    this.normalizeResources();
    const Resources: PDFDictionary = lookup(this.get('Resources'));
    const Font: PDFDictionary = lookup(Resources.get('Font'));
    Font.set(key, fontDict);

    return this;
  };
}

export default PDFPage;
