import parseHeader from './parseHeader';
import parseIndirectObj from './parseIndirectObj';
import parseXRefTable from './parseXRefTable';
import parseTrailer from './parseTrailer';
import removeComments from './removeComments';

// const parseDocument = (input, parseHandlers) => {
//   const cleaned = removeComments(input);
//   const { pdfObject: header, remainder: r1 } = parseHeader(cleaned, parseHandlers);
//
//   let remainder = r1;
//   while (true) {
//     const result = parseIndirectObj(remainder, parseHandlers);
//     if (!result) break;
//
//     const { pdfObject, remainder: r2 } = result;
//     remainder = r2;
//   }
//
//   const { pdfObject: xref, remainder: r3 } = parseXRefTable(remainder, parseHandlers);
//   const { pdfObject: trailer, remainder: r4 } = parseTrailer(r3, parseHandlers);
// }
import StringView from '../StringView';
const parseDocument = (input, parseHandlers) => {
  console.log('parsing document')

  // TODO: Figure out way to clean comments without stream content messing it up
  // const cleaned = removeComments(input);
  // console.log('comments removed')

  const cleaned = input;
  const [header, s1] = parseHeader(cleaned, 0, parseHandlers);

  let stopIdx = s1;
  while (true) {
    console.log('LOOPING')
    const result = parseIndirectObj(cleaned, stopIdx, parseHandlers);
    if (!result) break;
    const [indirectObj, s2 ] = result;
    stopIdx = s2;
  }

  console.log('Parsing XRef table with:', (new StringView(input)).subview(stopIdx, stopIdx + 25).toString());
  const [xref, s3] = parseXRefTable(cleaned, stopIdx, parseHandlers);
  // console.log('XRef table:', xref);
  console.log('Parsing trailer')
  const [trailer, s4] = parseTrailer(cleaned, s3, parseHandlers);
  // console.log('Trailer:', trailer);
  console.log('done')
}

export default parseDocument;
