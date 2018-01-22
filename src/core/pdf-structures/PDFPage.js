/* @flow */
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

import type { PDFObjectLookup } from 'core/pdf-document/PDFObjectIndex';

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
    lookup: PDFObjectLookup,
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
        MediaBox: PDFArray.fromArray(
          mediaBox.map(PDFNumber.fromNumber),
          lookup,
        ),
      },
      lookup,
      PDFPage.validKeys,
    );
    if (resources) page.set('Resources', resources);
    return page;
  };

  static fromDict = (dict: PDFDictionary) => {
    validate(dict, isInstance(PDFDictionary), '"dict" must be a PDFDictionary');
    return new PDFPage(dict.map, dict.lookup, PDFPage.validKeys);
  };

  static validKeys = VALID_KEYS;

  get Resources(): PDFDictionary {
    return this.lookup(this.get('Resources'));
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
      const contents: PDFObject = this.lookup(Contents);
      if (!contents.is(PDFArray)) {
        this.set('Contents', PDFArray.fromArray([Contents], this.lookup));
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
      this.set('Resources', PDFDictionary.from(new Map(), this.lookup));
    }

    const Resources = this.lookup(this.get('Resources'));
    if (Font && !Resources.get('Font')) {
      Resources.set('Font', PDFDictionary.from(new Map(), this.lookup));
    }
    if (XObject && !Resources.get('XObject')) {
      Resources.set('XObject', PDFDictionary.from(new Map(), this.lookup));
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
      this.set('Contents', PDFArray.fromArray(contentStreams, this.lookup));
    } else {
      const Contents: PDFArray = this.lookup(this.get('Contents'));
      Contents.push(...contentStreams);
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
    const Resources: PDFDictionary = this.lookup(this.get('Resources'));
    const Font: PDFDictionary = this.lookup(Resources.get('Font'));
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
    // const Resources: PDFDictionary = this.lookup(this.get('Resources'));
    const { Resources } = this;
    const XObject: PDFDictionary = this.lookup(Resources.get('XObject'));
    XObject.set(key, xObject);

    return this;
  };
}

export default PDFPage;
