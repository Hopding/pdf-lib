/* @flow */
import _ from 'lodash';

import {
  PDFObject,
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

import { error } from '../../utils';

import type { PDFLinearization } from './parseLinearization';

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
  onParseIndirectObj?: (PDFIndirectObject<*>) => any,
  onParseHeader?: PDFHeader => any,
  onParseXRefTable?: PDFXRef.Table => any,
  onParseTrailer?: PDFTrailer => any,
  onParseLinearization?: PDFLinearization => any,
};

export type ParsedPDF = {
  arrays: PDFArray[],
  dictionaries: PDFDictionary[],
  original: {
    header: PDFHeader,
    linearization: ?PDFLinearization,
    body: Map<PDFIndirectReference, PDFIndirectObject<*>>,
    xRefTable: PDFXRef.Table,
    trailer: PDFTrailer,
  },
  updates: {
    body: Map<PDFIndirectReference, PDFIndirectObject<*>>,
    xRefTable?: PDFXRef.Table,
    trailer: PDFTrailer,
  }[],
};

class PDFParser {
  activelyParsing = false;

  arrays: PDFArray[] = [];
  dictionaries: PDFDictionary[] = [];
  catalog: PDFCatalog = null;

  header: PDFHeader = null;
  body: Map<PDFIndirectReference, PDFIndirectObject<*>> = new Map();
  xRefTable: PDFXRef.Table = null;
  trailer: PDFTrailer = null;

  linearization: ?PDFLinearization = null;

  updates: {
    body: Map<PDFIndirectReference, PDFIndirectObject<*>>,
    xRefTable: PDFXRef.Table,
    trailer: PDFTrailer,
  }[] = [];

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
      onParseLinearization: this.handleLinearization,
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
      if (this.updates.length > 0) {
        _.last(this.updates).body.set(indirectObj.getReference(), indirectObj);
      } else {
        this.body.set(indirectObj.getReference(), indirectObj);
      }
    });
  };

  handleIndirectObj = (indirectObj: PDFIndirectObject<*>) => {
    if (indirectObj.pdfObject.is(PDFCatalog)) {
      console.log('Found catalog!');
    }
    if (this.updates.length > 0) {
      _.last(this.updates).body.set(indirectObj.getReference(), indirectObj);
    } else {
      this.body.set(indirectObj.getReference(), indirectObj);
    }
  };

  handleHeader = (header: PDFHeader) => {
    this.header = header;
  };

  handleXRefTable = (xRefTable: PDFXRef.Table) => {
    if (!this.trailer) this.xRefTable = xRefTable;
    else _.last(this.updates).xRefTable = xRefTable;
  };

  handleTrailer = (trailer: PDFTrailer) => {
    if (!this.trailer) this.trailer = trailer;
    else _.last(this.updates).trailer = trailer;

    this.updates.push({ body: new Map(), xRefTable: null, trailer: null });
  };

  handleLinearization = (linearization: PDFLinearization) => {
    this.linearization = linearization;
  };

  parse = (bytes: Uint8Array): ParsedPDF => {
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
      parseDocument(bytes, this.parseHandlers);
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
  };
}

export default PDFParser;
