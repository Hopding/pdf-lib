
import _ from 'lodash';
import {
  validate,
  validateArr,
  isInstance,
  isIdentity,
  optional,
} from 'utils/validate';
import { PDFContentStream } from 'core/pdf-structures';
import {
  PDFObject,
  PDFDictionary,
  PDFArray,
  PDFName,
  PDFNumber,
  PDFIndirectReference,
  PDFStream,
} from 'core/pdf-objects';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

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
  static create = (
    index: PDFObjectIndex,
    size: [number, number],
    resources?: PDFDictionary,
  ) => {
    validate(size.length, isIdentity(2), 'size tuple must have two elements');
    validate(size[0], _.isNumber, 'size tuple entries must be Numbers.');
    validate(size[1], _.isNumber, 'size tuple entries must be Numbers.');
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
        MediaBox: PDFArray.fromArray(mediaBox.map(PDFNumber.fromNumber), index),
      },
      index,
      PDFPage.validKeys,
    );
    if (resources) page.set('Resources', resources);
    return page;
  };

  static fromDict = (dict: PDFDictionary) => {
    validate(dict, isInstance(PDFDictionary), '"dict" must be a PDFDictionary');
    return new PDFPage(dict.map, dict.index, PDFPage.validKeys);
  };

  static validKeys = VALID_KEYS;

  get Resources() {
    return this.index.lookup(this.get('Resources')) as PDFDictionary;
  }

  get Contents() {
    return this.index.lookup(this.get('Contents')) as PDFArray<PDFContentStream | PDFIndirectReference<PDFContentStream>>;
  }

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
  normalizeContents = () => {
    const Contents = this.get('Contents');
    if (Contents) {
      const contents: PDFObject = this.index.lookup(Contents);
      if (!(contents instanceof PDFArray)) {
        this.set('Contents', PDFArray.fromArray([Contents], this.index));
      }
    }
  };

  normalizeResources = ({
    Font,
    XObject,
  }: {
    Font?: boolean,
    XObject?: boolean,
  }) => {
    if (!this.get('Resources')) {
      this.set('Resources', PDFDictionary.from(new Map(), this.index));
    }

    if (Font && !this.Resources.get('Font')) {
      this.Resources.set('Font', PDFDictionary.from(new Map(), this.index));
    }
    if (XObject && !this.Resources.get('XObject')) {
      this.Resources.set('XObject', PDFDictionary.from(new Map(), this.index));
    }
  };

  // TODO: Consider allowing *insertion* of content streams so order can be changed
  addContentStreams = (
    ...contentStreams: PDFIndirectReference<PDFContentStream>[]
  ) => {
    validateArr(
      contentStreams,
      isInstance(PDFIndirectReference),
      '"contentStream" must be of type PDFIndirectReference<PDFContentStream>',
    );

    this.normalizeContents();
    if (!this.get('Contents')) {
      this.set('Contents', PDFArray.fromArray(contentStreams, this.index));
    } else {
      this.Contents.push(...contentStreams);
    }

    return this;
  };

  addFontDictionary = (
    key: string, // TODO: Allow PDFName objects to be passed too
    fontDict: PDFIndirectReference<PDFDictionary>, // Allow PDFDictionaries as well
  ) => {
    validate(key, _.isString, '"key" must be a string');
    validate(
      fontDict,
      isInstance(PDFIndirectReference),
      '"fontDict" must be an instance of PDFIndirectReference',
    );

    this.normalizeResources({ Font: true });
    const Font = this.index.lookup(this.Resources.get('Font')) as PDFDictionary;
    Font.set(key, fontDict);

    return this;
  };

  addXObject = (key: string, xObject: PDFIndirectReference<PDFStream>) => {
    validate(key, _.isString, '"key" must be a string');
    validate(
      xObject,
      isInstance(PDFIndirectReference),
      '"xObject" must be an instance of PDFIndirectReference',
    );

    this.normalizeResources({ XObject: true });
    const XObject = this.index.lookup(this.Resources.get('XObject')) as PDFDictionary;
    XObject.set(key, xObject);

    return this;
  };
}

export default PDFPage;
