import parseHeader from './parseHeader';
import parseIndirectObj from './parseIndirectObj';
import parseXRefTable from './parseXRefTable';
import parseTrailer from './parseTrailer';
import removeComments from './removeComments';

// const parseDocument = (input, parseHandlers) => {
//   const doc = [];
//   const cleaned = removeComments(input);
//   const { pdfObject: header, remainder: r1 } = parseHeader(cleaned, parseHandlers);
//   doc.push(header);
//
//   let remainder = r1;
//   while (true) {
//     const result = parseIndirectObj(remainder, parseHandlers);
//     if (!result) break;
//
//     const { pdfObject, remainder: r2 } = result;
//     doc.push(pdfObject);
//     remainder = r2;
//   }
//
//   const { pdfObject: xref, remainder: r3 } = parseXRefTable(remainder, parseHandlers);
//   doc.push(xref);
//   const { pdfObject: trailer, remainder: r4 } = parseTrailer(r3, parseHandlers);
//   doc.push(trailer);
//
//   return doc;
// }

const parseDocument = (input, parseHandlers) => {
  const cleaned = removeComments(input);
  const { pdfObject: header, remainder: r1 } = parseHeader(cleaned, parseHandlers);

  let remainder = r1;
  while (true) {
    const result = parseIndirectObj(remainder, parseHandlers);
    if (!result) break;

    const { pdfObject, remainder: r2 } = result;
    remainder = r2;
  }

  const { pdfObject: xref, remainder: r3 } = parseXRefTable(remainder, parseHandlers);
  const { pdfObject: trailer, remainder: r4 } = parseTrailer(r3, parseHandlers);
}

export default parseDocument;
