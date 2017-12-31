/* @flow */
import pako from 'pako';

import { writeToDebugFile } from '../utils';
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
  PDFPage,
  PDFPageTree,
  PDFTrailer,
  PDFXRef,
} from '../pdf-structures';

import parseDocument from './parseDocument';
import decodeStream from './encoding/decodeStream';

class PDFParser {
  indirectObjects: Map<PDFIndirectReference, PDFIndirectObject> = new Map();
  dictionaries: Array<PDFDictionary> = [];
  arrays: Array<PDFArray> = [];
  catalog: PDFObject;
  pdfDoc: PDFDocument = new PDFDocument();

  handleBool = PDFBoolean.fromString;
  handleHexString = PDFHexString.fromString;
  handleName = PDFName.forString;
  handleNull = PDFNull.fromNull;
  handleNumber = PDFNumber.fromString;
  handleString = PDFString.fromString;

  handleArray = (arrayObj: Array<*>) => {
    const array = PDFArray.fromArray(arrayObj);
    this.arrays.push(array);
    return array;
  };

  handleDict = (dictObj: Object) => {
    let dict;
    switch (dictObj.Type) {
      case PDFName.forString('Catalog'):
        dict = PDFCatalog.fromObject(dictObj);
        break;
      case PDFName.forString('Pages'):
        dict = PDFPageTree.fromObject(dictObj);
        break;
      case PDFName.forString('Page'):
        dict = PDFPage.fromObject(this.pdfDoc, dictObj);
        break;
      default:
        dict = PDFDictionary.fromObject(dictObj);
    }

    this.dictionaries.push(dict);
    return dict;
  };

  handleStream = ({
    dict,
    contents,
  }: {
    dict: PDFDictionary,
    contents: Uint8Array,
  }) => new PDFStream(dict, contents);

  handleObjectStream = (indirectObjects: PDFIndirectObject[]) => {
    indirectObjects.forEach(indirectObj => {
      this.indirectObjects.set(indirectObj.getReference(), indirectObj);
    });
  };

  handleIndirectRef = ({
    objNum,
    genNum,
  }: {
    objNum: string,
    genNum: string,
  }) => PDFIndirectReference.forNumbers(Number(objNum), Number(genNum));

  handleIndirectObj = ({
    objNum,
    genNum,
    contentObj,
  }: {
    objNum: number,
    genNum: number,
    contentObj: PDFObject,
  }) => {
    const obj = new PDFIndirectObject(contentObj).setReferenceNumbers(
      objNum,
      genNum,
    );

    if (obj.pdfObject instanceof PDFCatalog) this.catalog = obj;

    this.indirectObjects.set(
      PDFIndirectReference.forNumbers(objNum, genNum),
      obj,
    );
    return obj;
  };

  handleHeader = header => {};

  handleXRefTable = sections => {};

  handleTrailer = ({ dict, lastXRefOffset }) => {};

  normalize = () => {
    this.dictionaries.forEach(dict => dict.dereference(this.indirectObjects));
    this.arrays.forEach(arr => arr.dereference(this.indirectObjects));

    let objNum = 1;
    this.indirectObjects.forEach(obj => {
      obj.setReferenceNumbers(objNum, 0);
      objNum += 1;
    });
  };

  parse = (bytes: Uint8Array): PDFDocument => {
    const parseHandlers = {
      onParseBool: this.handleBool,
      onParseArray: this.handleArray,
      onParseDict: this.handleDict,
      onParseHexString: this.handleHexString,
      onParseName: this.handleName,
      onParseNull: this.handleNull,
      onParseNumber: this.handleNumber,
      onParseString: this.handleString,
      onParseStream: this.handleStream,
      onParseObjectStream: this.handleObjectStream,
      onParseIndirectRef: this.handleIndirectRef,
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
