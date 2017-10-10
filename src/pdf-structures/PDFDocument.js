/* @flow */
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFObject,
  PDFNumber,
} from '../pdf-objects';
import { PDFHeader, PDFXRef, PDFTrailer } from '.';

class PDFDocument {
  header: PDFHeader = new PDFHeader(1, 3);
  catalog: PDFObject;
  indirectObjects: Array<PDFIndirectObject> = [];

  setCatalog = (catalog: PDFObject) => {
    this.catalog = catalog;
    return this;
  };

  setIndirectObjects = (indirectObjects: Array<PDFIndirectObject>) => {
    this.indirectObjects = indirectObjects;
    return this;
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

  toBytes = (): Uint8Array => {
    const bytes = [...this.header.toBytes()];

    const table = new PDFXRef.Table();
    const subsection = new PDFXRef.Subsection().setFirstObjNum(0);
    subsection.addEntry(
      new PDFXRef.Entry()
        .setOffset(0)
        .setGenerationNum(65535)
        .setIsInUse(false),
    );

    this.sortIndirectObjects();
    this.indirectObjects.forEach(indirectObj => {
      const entry = new PDFXRef.Entry()
        .setOffset(bytes.length)
        .setGenerationNum(0)
        .setIsInUse(true);
      subsection.addEntry(entry);

      bytes.push(...indirectObj.toBytes());
    });
    table.addSubsection(subsection);

    const trailer = new PDFTrailer(
      bytes.length,
      PDFDictionary.fromObject({
        Size: new PDFNumber(this.indirectObjects.length + 1),
        Root: this.catalog,
      }),
    );

    bytes.push(...table.toBytes());
    bytes.push(...trailer.toBytes());
    return new Uint8Array(bytes);
  };
}

export default PDFDocument;
