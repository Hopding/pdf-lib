/* @flow */
// import UpdatedPDFDocument from '../UpdatedPDFDocument';
// import PDFPage from '../PDFPage';
// import PDFDictionaryObject from '../PDFObjects/PDFDictionaryObject';
// import PDFArrayObject from '../PDFObjects/PDFArrayObject';
// import PDFNameObject from '../PDFObjects/PDFNameObject';
// import PDFString from '../PDFObjects/PDFString';
// import PDFIndirectRefObject from '../PDFObjects/PDFIndirectRefObject';
// import PDFIndirectObject from '../PDFObjects/PDFIndirectObject';
// import XRef from '../PDFObjects/PDFCrossRefTable';
// import PDFTrailer from '../PDFObjects/PDFTrailer';
// import { PDFHexString } from '../PDFObjects/PDFHexString';

// const parser = input => {
//   const pdfDoc = new UpdatedPDFDocument();
//   pdfDoc.setExistingContent(input);
//
//   const indirectObjects = {};
//   const pages = [];
//   const parseHandlers = {
//     onParseHeader: header => {},
//     onParseXRefTable: sections => {
//       const xRefTable = new XRef.Table();
//       console.log(sections);
//
//       sections.forEach(({ firstObjNum, objCount, entries }) => {
//         const subsection = new XRef.Subsection().setFirstObjNum(firstObjNum);
//
//         entries.forEach(({ offset, genNum, isInUse }) => {
//           const entry = new XRef.Entry()
//             .setOffset(offset)
//             .setGenerationNum(genNum)
//             .setIsInUse(isInUse === 'n');
//           subsection.addEntry(entry);
//         });
//
//         xRefTable.addSubsection(subsection);
//       });
//
//       pdfDoc.setUsedObjNums(xRefTable.getUsedObjNums());
//     },
//     onParseTrailer: ({ dict, lastXRefOffset }) => {
//       console.log({ dict, lastXRefOffset });
//       pdfDoc.setExistingTrailer(PDFTrailer(dict.object, lastXRefOffset));
//     },
//     onParseBool: bool => {},
//     onParseArray: PDFArrayObject,
//     onParseDict: PDFDictionaryObject,
//     onParseHexString: PDFHexString,
//     onParseIndirectObj: indirectObj => {
//       const { objNum, genNum, contentObj } = indirectObj;
//       console.log(indirectObj);
//
//       indirectObjects[`${objNum} ${genNum} R`] = PDFIndirectObject(
//         objNum,
//         genNum,
//         indirectObj.contentObj,
//       );
//
//       if (contentObj.isPDFDictionaryObject) {
//         if (contentObj.object.Type && contentObj.object.Type.key === 'Page') {
//           pages.push(indirectObj);
//         }
//       }
//     },
//     onParseIndirectRef: ({ objNum, genNum }) =>
//       PDFIndirectRefObject(objNum, genNum),
//     onParseName: PDFNameObject,
//     onParseNull: () => null,
//     onParseNumber: Number,
//     onParseStream: strm => {},
//     onParseString: PDFString,
//   };
//
//   parseDocument(input, parseHandlers);
//
//   // console.log(indirectObjects)
//   pdfDoc.setExistingObjs(indirectObjects);
//
//   const firstPage = pages[0];
//   const { objNum, genNum, contentObj } = firstPage;
//   const page = new PDFPage(objNum, genNum, pdfDoc, contentObj, true);
//   pdfDoc.addExistingPage(page);
//
//   pages.slice(1).forEach(({ objNum, genNum, contentObj }) => {
//     const page = new PDFPage(objNum, genNum, pdfDoc, contentObj);
//     pdfDoc.addExistingPage(page);
//   });
//
//   return pdfDoc;
// };
//
// export default parser;

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
  PDFDocument,
  PDFHeader,
  PDFPage,
  PDFPageTree,
  PDFTrailer,
  PDFXRef,
} from '../pdf-structures';
import parseDocument from './parseDocument';

class PDFParser {
  indirectObjects: Array<PDFIndirectObject> = [];
  catalog: PDFObject;

  handleBool = PDFBoolean.fromString;
  handleArray = PDFArray.fromArray;
  handleDict = PDFDictionary.fromObject;
  handleHexString = PDFHexString.fromString;
  handleName = PDFName.forString;
  handleNull = PDFNull.fromNull;
  handleNumber = PDFNumber.fromString;
  handleString = PDFString.fromString;

  handleStream = ({
    dict,
    contents,
  }: {
    dict: PDFDictionary,
    contents: Uint8Array,
  }) => new PDFStream(dict, contents);

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
    objNum: string,
    genNum: string,
    contentObj: PDFObject,
  }) => {
    const obj = new PDFIndirectObject(contentObj).setReferenceNumbers(
      Number(objNum),
      Number(genNum),
    );
    console.log(obj);
    if (
      obj.pdfObject instanceof PDFDictionary &&
      obj.pdfObject.get('Type') === PDFName.forString('Catalog')
    ) {
      this.catalog = obj;
    }
    this.indirectObjects.push(obj);
    return obj;
  };

  handleHeader = header => {};

  handleXRefTable = sections => {};

  handleTrailer = ({ dict, lastXRefOffset }) => {};

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
      onParseIndirectRef: this.handleIndirectRef,
      onParseIndirectObj: this.handleIndirectObj,
      onParseHeader: this.handleHeader,
      onParseXRefTable: this.handleXRefTable,
      onParseTrailer: this.handleTrailer,
    };

    parseDocument(bytes, parseHandlers);
    console.log('Total Parsed IndirectObjects: ', this.indirectObjects.length);

    const pdfDoc = new PDFDocument()
      .setCatalog(this.catalog)
      .setIndirectObjects(this.indirectObjects);
    return pdfDoc;
  };
}

export default PDFParser;
