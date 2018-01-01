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
  PDFObjectStream,
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

  // handleStream = ({
  //   dict,
  //   contents,
  // }: {
  //   dict: PDFDictionary,
  //   contents: Uint8Array,
  // }) => new PDFStream(dict, contents);

  handleObjectStream = ({ objects }: PDFObjectStream) => {
    // console.log('objects:', objects);
    objects.forEach(indirectObj => {
      console.log(`Reference: ${indirectObj.getReference().toString()}`);
      this.indirectObjects.set(indirectObj.getReference(), indirectObj);
      this.parsedPdf.indirectObjects.set(
        indirectObj.getReference(),
        indirectObj,
      );
    });
  };

  handleIndirectObj = (indirectObj: PDFIndirectObject) => {
    if (indirectObj.pdfObject instanceof PDFObjectStream) return;

    this.indirectObjects.set(indirectObj.getReference(), indirectObj);
    if (indirectObj.pdfObject instanceof PDFCatalog) this.catalog = indirectObj;

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
      // onParseStream: this.handleStream,
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
