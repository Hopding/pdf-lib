/* @flow */
import PDFDocument from 'core/pdf-document/PDFDocument';

import {
  PDFObject,
  PDFIndirectReference,
  PDFName,
  PDFStream,
  PDFArray,
} from 'core/pdf-objects';
import { PDFCatalog, PDFPageTree, PDFObjectStream } from 'core/pdf-structures';
import PDFParser from 'core/pdf-parser/PDFParser';

import type { ParsedPDF } from '../pdf-parser/PDFParser';

class PDFDocumentFactory {
  static create = (): PDFDocument => {
    const index: Map<PDFIndirectReference, PDFObject> = new Map();
    const refs = {
      catalog: PDFIndirectReference.forNumbers(1, 0),
      pageTree: PDFIndirectReference.forNumbers(2, 0),
    };

    const catalog = PDFCatalog.create(refs.pageTree);
    const pageTree = PDFPageTree.createRootNode(PDFArray.fromArray([]));

    index.set(refs.catalog, catalog);
    index.set(refs.pageTree, pageTree);

    return PDFDocument.fromIndex(index);
  };

  static load = (data: Uint8Array): PDFDocument => {
    const pdfParser = new PDFParser();

    console.time('ParsePDF');
    const parsedPdf = pdfParser.parse(data);
    console.timeEnd('ParsePDF');

    console.time('Normalize');
    const index = PDFDocumentFactory.normalize(parsedPdf);
    console.timeEnd('Normalize');

    return PDFDocument.fromIndex(index);
  };

  // TODO: Need to throw out objects with "free" obj numbers...
  static normalize = ({
    dictionaries,
    arrays,
    original: { body },
    updates,
  }: ParsedPDF): Map<PDFIndirectReference, PDFObject> => {
    const index: Map<PDFIndirectReference, PDFObject> = new Map();

    // Remove Object Streams and Cross Reference Streams, because we've already
    // parsed the Object Streams into PDFIndirectObjects, and will just write
    // them as such and use normal xref tables to reference them.
    const shouldKeep = (object: PDFObject) =>
      !object.is(PDFObjectStream) &&
      !(
        object.is(PDFStream) &&
        object.dictionary.get('Type') === PDFName.from('XRef')
      );

    // Initialize index with objects in the original body
    body.forEach(({ pdfObject }, ref) => {
      if (shouldKeep(pdfObject)) index.set(ref, pdfObject);
    });

    // Update index with most recent version of each object
    // TODO: This could be omitted to recover a previous version of the document...
    updates.forEach(({ body: updateBody }) => {
      updateBody.forEach(({ pdfObject }, ref) => {
        if (shouldKeep(pdfObject)) index.set(ref, pdfObject);
      });
    });

    return index;
  };
}

export default PDFDocumentFactory;
