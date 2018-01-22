/* @flow */
import PDFDictionary from 'core/pdf-objects/PDFDictionary';
import {
  PDFName,
  PDFObject,
  PDFIndirectReference,
  PDFPageTree,
} from 'core/pdf-objects';
import { validate, isInstance } from 'utils/validate';

import type { PDFObjectLookup } from 'core/pdf-document/PDFObjectIndex';

const VALID_KEYS = Object.freeze([
  'Type',
  'Version',
  'Extensions',
  'Pages',
  'PageLabels',
  'Names',
  'Dests',
  'ViewerPreferences',
  'PageLayout',
  'PageMode',
  'Outlines',
  'Threads',
  'OpenAction',
  'AA',
  'URI',
  'AcroForm',
  'Metadata',
  'StructTreeRoot',
  'MarkInfo',
  'Lang',
  'SpiderInfo',
  'OutputIntents',
  'PieceInfo',
  'OCProperties',
  'Perms',
  'Legal',
  'Requirements',
  'Collection',
  'NeedsRendering',
]);

class PDFCatalog extends PDFDictionary {
  static create = (
    pageTree: PDFIndirectReference<PDFPageTree>,
    lookup: PDFObjectLookup,
  ): PDFCatalog => {
    validate(
      pageTree,
      isInstance(PDFIndirectReference),
      '"pageTree" must be an indirect reference',
    );
    return new PDFCatalog(
      {
        Type: PDFName.from('Catalog'),
        Pages: pageTree,
      },
      lookup,
    );
  };

  static fromObject = (
    object: { [string]: PDFObject },
    lookup: PDFObjectLookup,
  ): PDFCatalog => new PDFCatalog(object, lookup, VALID_KEYS);

  static fromDict = (dict: PDFDictionary) => {
    validate(dict, isInstance(PDFDictionary), '"dict" must be a PDFDictionary');
    return new PDFCatalog(dict.map, dict.lookup, VALID_KEYS);
  };

  get Pages(): PDFPageTree {
    return this.lookup(this.get('Pages'));
  }
}

export default PDFCatalog;
