import PDFDocument from 'core/pdf-document/PDFDocument';
import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';
import {
  PDFArray,
  PDFIndirectReference,
  PDFName,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import PDFParser, { IParsedPDF } from 'core/pdf-parser/PDFParser';
import { PDFCatalog, PDFObjectStream, PDFPageTree } from 'core/pdf-structures';

class PDFDocumentFactory {
  public static create = (): PDFDocument => {
    const index = PDFObjectIndex.create();
    const refs = {
      catalog: PDFIndirectReference.forNumbers(1, 0),
      pageTree: PDFIndirectReference.forNumbers(2, 0),
    };

    const catalog = PDFCatalog.create(refs.pageTree, index);
    const pageTree = PDFPageTree.createRootNode(
      PDFArray.fromArray([], index),
      index,
    );

    index.set(refs.catalog, catalog);
    index.set(refs.pageTree, pageTree);

    return PDFDocument.fromIndex(index);
  };

  public static load = (data: Uint8Array): PDFDocument => {
    const index = PDFObjectIndex.create();
    const pdfParser = new PDFParser();

    console.time('ParsePDF');
    const parsedPdf = pdfParser.parse(data, index);
    console.timeEnd('ParsePDF');

    const indexMap = PDFDocumentFactory.normalize(parsedPdf);
    index.index = indexMap;

    return PDFDocument.fromIndex(index);
  };

  // TODO: Need to throw out objects with "free" obj numbers...
  public static normalize = ({
    dictionaries,
    arrays,
    original: { body },
    updates,
  }: IParsedPDF): Map<PDFIndirectReference, PDFObject> => {
    const index: Map<PDFIndirectReference, PDFObject> = new Map();

    // Remove Object Streams and Cross Reference Streams, because we've already
    // parsed the Object Streams into PDFIndirectObjects, and will just write
    // them as such and use normal xref tables to reference them.
    const shouldKeep = (object: PDFObject) =>
      !(object instanceof PDFObjectStream) &&
      !(
        object instanceof PDFStream &&
        object.dictionary.getMaybe('Type') === PDFName.from('XRef')
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
