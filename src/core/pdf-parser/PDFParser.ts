import _ from 'lodash';

import {
  PDFArray,
  PDFBoolean,
  PDFDictionary,
  PDFHexString,
  PDFIndirectObject,
  PDFIndirectReference,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFStream,
  PDFString,
} from 'core/pdf-objects';
import {
  PDFCatalog,
  PDFHeader,
  PDFObjectStream,
  PDFTrailer,
} from 'core/pdf-structures';
import { Table as PDFXRefTable } from 'core/pdf-structures/PDFXRef';
import { error } from 'utils';
import { isInstance, validate } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import parseDocument from './parseDocument';

import { PDFLinearization } from './parseLinearization';

export interface ParseHandlers {
  onParseBool?: (p: PDFBoolean) => any;
  onParseArray?: (p: PDFArray) => any;
  onParseDict?: (p: PDFDictionary) => any;
  onParseHexString?: (p: PDFHexString) => any;
  onParseName?: (p: PDFName) => any;
  onParseNull?: (p: PDFNull) => any;
  onParseNumber?: (p: PDFNumber) => any;
  onParseString?: (p: PDFString) => any;
  onParseStream?: (p: PDFStream) => any;
  onParseObjectStream?: (p: PDFObjectStream) => any;
  onParseIndirectRef?: (p: PDFIndirectReference) => any;
  onParseIndirectObj?: (p: PDFIndirectObject) => any;
  onParseHeader?: (p: PDFHeader) => any;
  onParseXRefTable?: (p: PDFXRefTable) => any;
  onParseTrailer?: (p: PDFTrailer) => any;
  onParseLinearization?: (p: PDFLinearization) => any;
}

export interface ParsedPDF {
  arrays: PDFArray[];
  dictionaries: PDFDictionary[];
  original: {
    header: PDFHeader;
    linearization: PDFLinearization;
    body: Map<PDFIndirectReference, PDFIndirectObject>;
    xRefTable: PDFXRefTable;
    trailer: PDFTrailer;
  };
  updates: Array<{
    body: Map<PDFIndirectReference, PDFIndirectObject>;
    xRefTable?: PDFXRefTable;
    trailer: PDFTrailer;
  }>;
}

class PDFParser {
  public activelyParsing = false;

  public arrays: PDFArray[] = [];
  public dictionaries: PDFDictionary[] = [];
  public catalog: PDFCatalog = null;

  public header: PDFHeader = null;
  public body: Map<PDFIndirectReference, PDFIndirectObject> = new Map();
  public xRefTable: PDFXRefTable = null;
  public trailer: PDFTrailer = null;

  public linearization: PDFLinearization = null;

  public updates: Array<{
    body: Map<PDFIndirectReference, PDFIndirectObject>;
    xRefTable: PDFXRefTable;
    trailer: PDFTrailer;
  }> = [];

  public parseHandlers: ParseHandlers;

  constructor() {
    this.parseHandlers = {
      onParseArray: this.handleArray,
      onParseDict: this.handleDict,
      onParseObjectStream: this.handleObjectStream,
      onParseIndirectObj: this.handleIndirectObj,
      onParseHeader: this.handleHeader,
      onParseXRefTable: this.handleXRefTable,
      onParseTrailer: this.handleTrailer,
      onParseLinearization: this.handleLinearization,
    };
  }

  public handleArray = (array: PDFArray) => {
    this.arrays.push(array);
  }

  public handleDict = (dict: PDFDictionary) => {
    this.dictionaries.push(dict);
  }

  public handleObjectStream = ({ objects }: PDFObjectStream) => {
    objects.forEach((indirectObj) => {
      if (this.updates.length > 0) {
        _.last(this.updates).body.set(indirectObj.getReference(), indirectObj);
      } else {
        this.body.set(indirectObj.getReference(), indirectObj);
      }
    });
  }

  public handleIndirectObj = (indirectObj: PDFIndirectObject) => {
    if (this.updates.length > 0) {
      _.last(this.updates).body.set(indirectObj.getReference(), indirectObj);
    } else {
      this.body.set(indirectObj.getReference(), indirectObj);
    }
  }

  public handleHeader = (header: PDFHeader) => {
    this.header = header;
  }

  public handleXRefTable = (xRefTable: PDFXRefTable) => {
    if (!this.trailer) this.xRefTable = xRefTable;
    else _.last(this.updates).xRefTable = xRefTable;
  }

  public handleTrailer = (trailer: PDFTrailer) => {
    if (!this.trailer) this.trailer = trailer;
    else _.last(this.updates).trailer = trailer;

    this.updates.push({ body: new Map(), xRefTable: null, trailer: null });
  }

  public handleLinearization = (linearization: PDFLinearization) => {
    this.linearization = linearization;
  }

  public parse = (bytes: Uint8Array, index: PDFObjectIndex): ParsedPDF => {
    validate(
      index,
      isInstance(PDFObjectIndex),
      '"index" must be an instance of PDFObjectIndex',
    );

    if (this.activelyParsing) error('Cannot parse documents concurrently');
    this.activelyParsing = true;

    this.arrays = [];
    this.dictionaries = [];
    this.catalog = null;
    this.header = null;
    this.body = new Map();
    this.xRefTable = null;
    this.trailer = null;
    this.linearization = null;
    this.updates = [];

    try {
      parseDocument(bytes, index, this.parseHandlers);
      this.activelyParsing = false;
    } catch (e) {
      this.activelyParsing = false;
      throw e;
    }

    return {
      arrays: this.arrays,
      dictionaries: this.dictionaries,
      original: {
        header: this.header,
        linearization: this.linearization,
        body: this.body,
        xRefTable: this.xRefTable,
        trailer: this.trailer,
      },
      updates: _.initial(this.updates),
    };
  }
}

export default PDFParser;
