import parseHeader from './parseHeader';
import parseIndirectObj from './parseIndirectObj';
import parseXRefTable from './parseXRefTable';
import parseTrailer from './parseTrailer';
import removeComments from './removeComments';

const parseDocument = (input) => {
  const doc = [];
  const cleaned = removeComments(input);
  const { pdfObject: header, remainder: r1 } = parseHeader(cleaned);
  doc.push(header);

  let remainder = r1;
  while (true) {
    const result = parseIndirectObj(remainder);
    if (!result) break;

    const { pdfObject, remainder: r2 } = result;
    doc.push(pdfObject);
    remainder = r2;
  }

  const { pdfObject: xref, remainder: r3 } = parseXRefTable(remainder);
  doc.push(xref);
  const { pdfObject: trailer, remainder: r4 } = parseTrailer(r3);
  doc.push(trailer);

  return doc;
}

export default parseDocument;
