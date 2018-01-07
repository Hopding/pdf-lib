/* @flow */
import _ from 'lodash';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFObject,
  PDFNumber,
} from '../pdf-objects';
import {
  PDFCatalog,
  PDFHeader,
  PDFPage,
  PDFXRef,
  PDFTrailer,
  PDFPageTree,
} from '../pdf-structures';
import { error, validate, isInstance, isIdentity } from '../../utils/validate';

class PDFDocument {
  header: PDFHeader = PDFHeader.forVersion(1, 6);
  catalog: PDFCatalog;
  indirectObjects: Array<PDFIndirectObject<*>> = [];
  maxReferenceNumber: number;

  setCatalog = (catalog: PDFObject) => {
    this.catalog = catalog;
    return this;
  };

  setIndirectObjects = (indirectObjects: Array<PDFIndirectObject<*>>) => {
    this.indirectObjects = indirectObjects;
    this.sortIndirectObjects();
    this.maxReferenceNumber = _.last(
      this.indirectObjects,
    ).getReference().objectNumber;
    return this;
  };

  createIndirectObject = <T: $Subtype<PDFObject>>(
    pdfObject: T,
  ): PDFIndirectObject<T> => {
    if (!(pdfObject instanceof PDFObject)) {
      throw new Error('Can only create indirect objects for PDFObjects');
    }
    this.maxReferenceNumber += 1;
    const indirectObject = new PDFIndirectObject(pdfObject).setReferenceNumbers(
      this.maxReferenceNumber,
      0,
    );
    this.indirectObjects.push(indirectObject);
    return indirectObject;
  };

  findIndirectObjectFor = (obj: PDFObject) =>
    this.indirectObjects.find(({ pdfObject }) => pdfObject === obj);

  getPages = () => {
    console.time('PDFDoc.getPages()');
    const pages = [];
    this.catalog.pdfObject.getPageTree().traverse(node => {
      if (node instanceof PDFPage) pages.push(node);
    });
    console.timeEnd('PDFDoc.getPages()');
    return pages;
  };

  addPage = (page: PDFPage) => {
    validate(
      page,
      isInstance(PDFPage),
      'PDFDocument.addPage() required argument to be of type PDFPage',
    );
    const pageTree = this.catalog.pdfObject.getPageTree();
    const lastPageTree =
      _.last(pageTree.findMatches(kid => kid.is(PDFPageTree))) || pageTree;

    // TODO: HANDLE CASE OF 'Count' BEING AN INDIRECT REFERENCE
    lastPageTree.ascend((parent: PDFIndirectObject<PDFPageTree>) => {
      parent.pdfObject.get('Count').number += 1;
    });

    lastPageTree.addPage(this.createIndirectObject(page));
    page.set('Parent', this.findIndirectObjectFor(lastPageTree));
    return this;
  };

  // TODO: Validate idx and don't allow removal of last page...
  removePage = (idx: number) => {
    validate(
      idx,
      _.isNumber,
      'PDFDocument.removePage() required argument to be of type Number',
    );

    // Remove from page pageTree
    const pages = this.catalog.pdfObject
      .getPageTree()
      .findMatches(kid => kid.is(PDFPage));
    const page = pages[idx];
    if (!page) error(`No page with idx: ${idx}`);
    const pageParent = page.get('Parent').pdfObject;
    pageParent.ascend((parent: PDFIndirectObject<PDFPageTree>) => {
      parent.pdfObject.get('Count').number -= 1;
    });
    pageParent.removePage(page);

    // Remove indirect object

    return this;
  };

  // Validate that "idx" is in required range
  insertPage = (idx: number, page: PDFPage) => {
    validate(
      idx,
      _.isNumber,
      'PDFDocument.removePage() idx argument to be of type Number',
    );
    validate(
      page,
      isInstance(PDFPage),
      'PDFDocument.insertPage() page argument must be of type PDFPage',
    );

    // Remove from page pageTree
    const pages = this.catalog.pdfObject
      .getPageTree()
      .findMatches(kid => kid.is(PDFPage));
    const existingPage = pages[idx];
    if (!existingPage) error(`No page with idx: ${idx}`);
    const pageParent = existingPage.get('Parent').pdfObject;
    pageParent.ascend((parent: PDFIndirectObject<PDFPageTree>) => {
      console.log(
        `Changing: ${parent.pdfObject.get('Count')
          .number} to ${parent.pdfObject.get('Count').number + 1}`,
      );
      parent.pdfObject.get('Count').number += 1;
    });
    pageParent.insertPage(idx, this.createIndirectObject(page));
    page.set('Parent', this.findIndirectObjectFor(pageParent));

    // Remove indirect object

    return this;
  };

  sortIndirectObjects = () => {
    this.indirectObjects.sort((a, b) => {
      const aRefNum = a.getReference().objectNumber;
      const bRefNum = b.getReference().objectNumber;

      if (aRefNum < bRefNum) return -1;
      else if (aRefNum > bRefNum) return 1;
      return 0;
    });
  };

  buildXRefTable = (): PDFXRef.Table => {
    const table = new PDFXRef.Table();
    const subsection = new PDFXRef.Subsection().setFirstObjNum(0);
    subsection.addEntry(
      new PDFXRef.Entry()
        .setOffset(0)
        .setGenerationNum(65535)
        .setIsInUse(false),
    );

    let offset = this.header.bytesSize();
    this.sortIndirectObjects();
    this.indirectObjects.forEach(indirectObj => {
      const entry = new PDFXRef.Entry()
        .setOffset(offset)
        .setGenerationNum(0)
        .setIsInUse(true);
      subsection.addEntry(entry);

      offset += indirectObj.bytesSize();
    });
    table.addSubsection(subsection);

    return table;
  };

  buildTrailer = (xrefOffset: number): PDFTrailer =>
    new PDFTrailer(
      xrefOffset,
      PDFDictionary.from({
        Size: new PDFNumber(this.indirectObjects.length + 1),
        Root: this.catalog,
      }),
    );

  bytesSize = (table: PDFXRef.Table, trailer: PDFTrailer): number => {
    let size = 0;
    size += this.header.bytesSize();
    size += _(this.indirectObjects)
      .map(obj => obj.bytesSize())
      .sum();
    size += table.bytesSize();
    size += trailer.bytesSize();
    return size;
  };

  toBytes = () => {
    console.time('PDFDoc.toBytes()');
    const xRefOffset =
      this.header.bytesSize() +
      _(this.indirectObjects)
        .map(obj => obj.bytesSize())
        .sum();

    const xRefTable = this.buildXRefTable();
    const trailer = this.buildTrailer(xRefOffset);

    const bufferSize = this.bytesSize(xRefTable, trailer);
    const buffer = new Uint8Array(bufferSize);

    let remaining = this.header.copyBytesInto(buffer);
    this.indirectObjects.forEach(obj => {
      remaining = obj.copyBytesInto(remaining);
    });
    remaining = xRefTable.copyBytesInto(remaining);
    remaining = trailer.copyBytesInto(remaining);
    console.timeEnd('PDFDoc.toBytes()');
    return buffer;
  };
}

export default PDFDocument;
