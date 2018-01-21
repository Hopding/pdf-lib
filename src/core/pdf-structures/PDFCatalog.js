/* @flow */
import PDFDictionary from 'core/pdf-objects/PDFDictionary';
import {
  PDFName,
  PDFObject,
  PDFIndirectReference,
  PDFPageTree,
} from 'core/pdf-objects';
import { validate, isInstance } from 'utils/validate';

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
  static create = (pageTree: PDFIndirectReference<PDFPageTree>): PDFCatalog => {
    validate(
      pageTree,
      isInstance(PDFIndirectReference),
      '"pageTree" must be an indirect reference',
    );
    return new PDFCatalog({
      Type: PDFName.from('Catalog'),
      Pages: pageTree,
    });
  };

  static from = (object: { [string]: PDFObject } | PDFDictionary): PDFCatalog =>
    new PDFCatalog(object, VALID_KEYS);

  getPageTree = (lookup: PDFIndirectReference => PDFObject): PDFPageTree =>
    lookup(this.get('Pages'));
}

export default PDFCatalog;
