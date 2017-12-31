/* @flow */
import _ from 'lodash';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFObject,
  PDFNumber,
} from '../pdf-objects';
import { PDFCatalog, PDFHeader, PDFPage, PDFXRef, PDFTrailer } from '.';
import { arrayToString } from '../utils';

class PDFDocument {
  header: PDFHeader = new PDFHeader(1, 6);
  catalog: PDFCatalog;
  indirectObjects: Array<PDFIndirectObject> = [];
  maxReferenceNumber: number;

  setCatalog = (catalog: PDFObject) => {
    this.catalog = catalog;
    return this;
  };

  setIndirectObjects = (indirectObjects: Array<PDFIndirectObject>) => {
    this.indirectObjects = indirectObjects;
    this.sortIndirectObjects();
    this.maxReferenceNumber = _.last(this.indirectObjects)
      .getReference()
      .getObjectNumber();
    return this;
  };

  createIndirectObject = (pdfObject: PDFObject): PDFIndirectObject => {
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

  getPages = () => {
    const pages = [];
    this.catalog.pdfObject.getPageTree().traverse(node => {
      if (node instanceof PDFPage) pages.push(node);
    });
    return pages;
  };

  sortIndirectObjects = () => {
    this.indirectObjects.sort((a, b) => {
      const aRefNum = a.getReference().getObjectNumber();
      const bRefNum = b.getReference().getObjectNumber();

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
      PDFDictionary.fromObject({
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
    const xRefOffset =
      this.header.bytesSize() +
      _(this.indirectObjects)
        .map(obj => obj.bytesSize())
        .sum();

    const xRefTable = this.buildXRefTable();
    const trailer = this.buildTrailer(xRefOffset);

    const bufferSize = this.bytesSize(xRefTable, trailer);
    const buffer = new Uint8Array(bufferSize);

    let remaining = this.header.addBytes(buffer);
    this.indirectObjects.forEach(obj => {
      remaining = obj.addBytes(remaining);
    });
    remaining = xRefTable.addBytes(remaining);
    remaining = trailer.addBytes(remaining);
    return buffer;
  };
}

export default PDFDocument;
