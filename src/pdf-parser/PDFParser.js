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
  PDFStream,
  PDFString,
} from '../pdf-objects';
import {
  PDFCatalog,
  PDFHeader,
  PDFObjectStream,
  PDFTrailer,
  PDFXRef,
} from '../pdf-structures';
import parseDocument from './parseDocument';

import { error, findInMap } from '../utils';

import type { Predicate } from '../utils';

export type ParsedPDF = {
  header: PDFHeader,
  catalog: PDFCatalog,
  indirectObjects: Map<PDFIndirectReference, PDFIndirectObject>,
  arrays: PDFArray[],
  dictionaries: PDFDictionary[],
  xRefTables: PDFXRef.Table[],
  trailers: PDFTrailer[],
  findObject: (Predicate<PDFIndirectObject>) => ?PDFIndirectObject,
};

export type ParseHandlers = {
  onParseBool?: PDFBoolean => any,
  onParseArray?: PDFArray => any,
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

let activelyParsing = false;

class PDFParser {
  header: PDFHeader = null;
  catalog: PDFCatalog = null;
  indirectObjects: Map<PDFIndirectReference, PDFIndirectObject> = new Map();
  arrays: PDFArray[] = [];
  dictionaries: PDFDictionary[] = [];
  xRefTables: PDFXRef.Table[] = [];
  trailers: PDFTrailer[] = [];

  parseHandlers: ParseHandlers;

  constructor() {
    this.parseHandlers = {
      onParseArray: this.handleArray,
      onParseDict: this.handleDict,
      onParseObjectStream: this.handleObjectStream,
      onParseIndirectObj: this.handleIndirectObj,
      onParseHeader: this.handleHeader,
      onParseXRefTable: this.handleXRefTable,
      onParseTrailer: this.handleTrailer,
    };
  }

  handleArray = (array: PDFArray) => {
    this.arrays.push(array);
  };

  handleDict = (dict: PDFDictionary) => {
    this.dictionaries.push(dict);
  };

  handleObjectStream = ({ objects }: PDFObjectStream) => {
    objects.forEach(indirectObj => {
      this.indirectObjects.set(indirectObj.getReference(), indirectObj);
    });
  };

  handleIndirectObj = (indirectObj: PDFIndirectObject) => {
    this.indirectObjects.set(indirectObj.getReference(), indirectObj);

    if (indirectObj.pdfObject.is(PDFCatalog)) this.catalog = indirectObj;
  };

  handleHeader = (header: PDFHeader) => {
    this.header = header;
  };

  handleXRefTable = (xRefTable: PDFXRef.Table) => {
    this.xRefTables.push(xRefTable);
  };

  handleTrailer = (trailer: PDFTrailer) => {
    this.trailers.push(trailer);
  };

  parse = (bytes: Uint8Array): ParsedPDF => {
    if (activelyParsing) error('Cannot parse documents concurrently');
    activelyParsing = true;

    this.header = null;
    this.catalog = null;
    this.indirectObjects = new Map();
    this.arrays = [];
    this.dictionaries = [];
    this.xRefTables = [];
    this.trailers = [];

    parseDocument(bytes, this.parseHandlers);
    activelyParsing = false;

    return {
      header: this.header,
      catalog: this.catalog,
      indirectObjects: this.indirectObjects,
      arrays: this.arrays,
      dictionaries: this.dictionaries,
      xRefTables: this.xRefTables,
      trailers: this.trailers,
      findObject(predicate) {
        return findInMap(this.indirectObjects, predicate);
      },
    };
  };
}

export default PDFParser;
