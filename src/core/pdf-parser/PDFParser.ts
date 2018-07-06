import initial from 'lodash/initial';
import last from 'lodash/last';

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
  PDFXRef,
} from 'core/pdf-structures';
import { error } from 'utils';
import { isInstance, validate } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import parseDocument from './parseDocument';

import { IPDFLinearization } from './parseLinearization';

export interface IParseHandlers {
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
  onParseXRefTable?: (p: PDFXRef.Table) => any;
  onParseTrailer?: (p: PDFTrailer) => any;
  onParseLinearization?: (p: IPDFLinearization) => any;
}

export interface IParsedPDF {
  maxObjectNumber: number;
  catalog: PDFCatalog;
  arrays: PDFArray[];
  dictionaries: PDFDictionary[];
  original: {
    header: PDFHeader;
    linearization: IPDFLinearization;
    body: Map<PDFIndirectReference, PDFIndirectObject>;
    xRefTable: PDFXRef.Table;
    trailer: PDFTrailer;
  };
  updates: Array<{
    body: Map<PDFIndirectReference, PDFIndirectObject>;
    xRefTable?: PDFXRef.Table;
    trailer?: PDFTrailer;
  }>;
}

class PDFParser {
  private activelyParsing = false;

  private maxObjectNumber = -1;

  private arrays: PDFArray[] = [];
  private dictionaries: PDFDictionary[] = [];
  private catalog?: PDFCatalog;

  private header?: PDFHeader;
  private body: Map<PDFIndirectReference, PDFIndirectObject> = new Map();
  private xRefTable?: PDFXRef.Table;
  private trailer?: PDFTrailer;

  private linearization?: IPDFLinearization;

  private updates: Array<{
    body: Map<PDFIndirectReference, PDFIndirectObject>;
    xRefTable?: PDFXRef.Table;
    trailer?: PDFTrailer;
  }> = [];

  private parseHandlers: IParseHandlers;

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

  parse = (bytes: Uint8Array, index: PDFObjectIndex): IParsedPDF => {
    validate(
      index,
      isInstance(PDFObjectIndex),
      '"index" must be an instance of PDFObjectIndex',
    );

    if (this.activelyParsing) error('Cannot parse documents concurrently');
    this.activelyParsing = true;

    this.maxObjectNumber = -1;
    this.arrays = [];
    this.dictionaries = [];
    this.catalog = undefined;
    this.header = undefined;
    this.body = new Map();
    this.xRefTable = undefined;
    this.trailer = undefined;
    this.linearization = undefined;
    this.updates = [];

    try {
      parseDocument(bytes, index, this.parseHandlers);
      this.activelyParsing = false;
    } catch (e) {
      this.activelyParsing = false;
      throw e;
    }

    return {
      maxObjectNumber: this.maxObjectNumber!,
      catalog: this.catalog!,
      arrays: this.arrays,
      dictionaries: this.dictionaries,
      original: {
        header: this.header!,
        linearization: this.linearization!,
        body: this.body,
        xRefTable: this.xRefTable!,
        trailer: this.trailer!,
      },
      // Drop the last element, because it will always be empty:
      updates: initial(this.updates),
    };
  };

  private handleArray = (array: PDFArray) => {
    this.arrays.push(array);
  };

  private handleDict = (dict: PDFDictionary) => {
    this.dictionaries.push(dict);
    if (dict instanceof PDFCatalog) this.catalog = dict;
  };

  private handleObjectStream = ({ objects }: PDFObjectStream) => {
    objects.forEach((indirectObj) => {
      if (this.updates.length > 0) {
        last(this.updates)!.body.set(indirectObj.getReference(), indirectObj);
      } else {
        this.body.set(indirectObj.getReference(), indirectObj);
      }
    });
  };

  private handleIndirectObj = (indirectObj: PDFIndirectObject) => {
    if (this.updates.length > 0) {
      last(this.updates)!.body.set(indirectObj.getReference(), indirectObj);
    } else {
      this.body.set(indirectObj.getReference(), indirectObj);
    }

    if (indirectObj.reference.objectNumber > this.maxObjectNumber) {
      this.maxObjectNumber = indirectObj.reference.objectNumber;
    }
  };

  private handleHeader = (header: PDFHeader) => {
    this.header = header;
  };

  private handleXRefTable = (xRefTable: PDFXRef.Table) => {
    if (!this.trailer) this.xRefTable = xRefTable;
    else last(this.updates)!.xRefTable = xRefTable;
  };

  private handleTrailer = (trailer: PDFTrailer) => {
    if (!this.trailer) this.trailer = trailer;
    else last(this.updates)!.trailer = trailer;

    this.updates.push({
      body: new Map(),
      xRefTable: undefined,
      trailer: undefined,
    });
  };

  private handleLinearization = (linearization: IPDFLinearization) => {
    this.linearization = linearization;
  };
}

export default PDFParser;
