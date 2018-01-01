/* @flow */
import {
  PDFBoolean,
  PDFArray,
  PDFDictionary,
  PDFHexString,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFObject,
  PDFStream,
  PDFString,
} from '../pdf-objects';
import {
  PDFCatalog,
  PDFDocument,
  PDFHeader,
  PDFObjectStream,
  PDFPage,
  PDFPageTree,
  PDFTrailer,
  PDFXRef,
} from '../pdf-structures';
import parseDocument from './parseDocument';

import { writeToDebugFile } from '../utils';

export type ParsedPDF = {
  header: PDFHeader,
  indirectObjects: Map<PDFIndirectReference, PDFIndirectObject>,
  xRefTables: PDFXRef.Table[],
  trailers: PDFTrailer[],
};

export type ParseHandlers = {
  onParseBool?: PDFBoolean => any,
  onParseArray?: (PDFArray<PDFObject>) => any,
  onParseDict?: PDFDictionary => any,
  onParseHexString?: PDFHexString => any,
  onParseName?: PDFName => any,
  onParseNull?: PDFNull => any,
  onParseNumber?: PDFNumber => any,
  onParseString?: PDFString => any,
  onParseStream?: PDFStream => any,
  onParseObjectStream?: PDFObjectStream => any,
  onParseIndirectRef?: PDFIndirectReference => any,
  onParseIndirectObj?: PDFIndirectObject => any,
  onParseHeader?: PDFHeader => any,
  onParseXRefTable?: PDFXRef.Table => any,
  onParseTrailer?: PDFTrailer => any,
};

class PDFParser {
  parsedPdf = {
    header: null,
    indirectObjects: (new Map(): Map<PDFIndirectReference, PDFIndirectObject>),
    xRefTables: [],
    trailers: [],
  };
  indirectObjects: Map<PDFIndirectReference, PDFIndirectObject> = new Map();

  dictionaries: Array<PDFDictionary> = [];
  arrays: Array<PDFArray> = [];
  catalog: PDFObject;
  pdfDoc: PDFDocument = new PDFDocument();

  handleArray = (arrayObj: Array<*>) => {
    const array = PDFArray.fromArray(arrayObj);
    this.arrays.push(array);
    return array;
  };

  handleDict = (dictObj: Object) => {
    let dict;
    switch (dictObj.Type) {
      case PDFName.from('Catalog'):
        dict = PDFCatalog.fromObject(dictObj);
        break;
      case PDFName.from('Pages'):
        dict = PDFPageTree.fromObject(dictObj);
        break;
      case PDFName.from('Page'):
        dict = PDFPage.fromObject(this.pdfDoc, dictObj);
        break;
      default:
        dict = PDFDictionary.from(dictObj);
    }

    this.dictionaries.push(dict);
    return dict;
  };

  handleObjectStream = ({ objects }: PDFObjectStream) => {
    objects.forEach(indirectObj => {
      this.indirectObjects.set(indirectObj.getReference(), indirectObj);

      this.parsedPdf.indirectObjects.set(
        indirectObj.getReference(),
        indirectObj,
      );
    });
  };

  handleIndirectObj = (indirectObj: PDFIndirectObject) => {
    this.indirectObjects.set(indirectObj.getReference(), indirectObj);
    if (indirectObj.pdfObject.is(PDFCatalog)) this.catalog = indirectObj;

    this.parsedPdf.indirectObjects.set(indirectObj.getReference(), indirectObj);
  };

  handleHeader = (header: PDFHeader) => {
    this.parsedPdf.header = header;
  };

  handleXRefTable = (xRefTable: PDFXRef.Table) => {
    this.parsedPdf.xRefTables.push(xRefTable);
  };

  handleTrailer = (trailer: PDFTrailer) => {
    this.parsedPdf.trailers.push(trailer);
  };

  normalize = () => {
    this.dictionaries.forEach(dict => dict.dereference(this.indirectObjects));
    this.arrays.forEach(arr => arr.dereference(this.indirectObjects));

    // Remove Object Streams and Cross Reference Streams, because we've already
    // parsed the Object Streams into PDFIndirectObjects, and will just write
    // them as such and use normal xref tables to reference them.
    this.indirectObjects.forEach(({ pdfObject }, ref) => {
      if (pdfObject.is(PDFObjectStream)) this.indirectObjects.delete(ref);
      else if (
        pdfObject.is(PDFStream) &&
        pdfObject.dictionary.get('Type') === PDFName.from('XRef')
      ) {
        this.indirectObjects.delete(ref);
      }
    });

    let objNum = 1;
    this.indirectObjects.forEach(obj => {
      obj.setReferenceNumbers(objNum, 0);
      objNum += 1;
    });
  };

  parse = (bytes: Uint8Array): PDFDocument => {
    const parseHandlers = {
      onParseArray: this.handleArray,
      onParseDict: this.handleDict,

      onParseObjectStream: this.handleObjectStream,
      onParseIndirectObj: this.handleIndirectObj,
      onParseHeader: this.handleHeader,
      onParseXRefTable: this.handleXRefTable,
      onParseTrailer: this.handleTrailer,
    };

    parseDocument(bytes, parseHandlers);
    this.normalize();

    this.pdfDoc
      .setCatalog(this.catalog)
      .setIndirectObjects(Array.from(this.indirectObjects.values()));

    return this.pdfDoc;
  };
}

export default PDFParser;
