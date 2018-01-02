import { writeToDebugFile, arrayToString } from '../../utils';
import parseHeader from './parseHeader';
import parseIndirectObj from './parseIndirectObj';
import parseXRefTable from './parseXRefTable';
import { parseTrailer, parseMalformattedTrailer } from './parseTrailer';
import removeComments from './removeComments';

const parseDocument = (input, parseHandlers) => {
  console.log('parsing document');

  // TODO: Figure out way to clean comments without stream content messing it up
  // const cleaned = removeComments(input);

  const cleaned = input;
  const [header, r1] = parseHeader(cleaned, parseHandlers);

  // If document is linearized, we'll need to parse the linearization
  // dictionary and First-Page XRef table next...
  let remainder;

  const [linDict, linRemainder] = parseIndirectObj(r1, parseHandlers);
  const firstPageXRefMatch = parseXRefTable(linRemainder, parseHandlers);
  if (firstPageXRefMatch) {
    const [firstPageXRef, xrefRemainder] = firstPageXRefMatch;
    const [firstPageTrailer, trailerRemainder] = parseTrailer(
      xrefRemainder,
      parseHandlers,
    );
    remainder = trailerRemainder;
  }

  remainder = remainder || r1;
  // let remainder = r1;
  while (true) {
    const result = parseIndirectObj(remainder, parseHandlers);
    if (!result) break;
    const [indirectObj, r2] = result;
    remainder = r2;
  }

  // Try to parse the XRef table (some PDFs omit the XRef table)
  const parsedXRef = parseXRefTable(remainder, parseHandlers);
  let xref;
  let r3;
  if (parsedXRef) [xref, r3] = parsedXRef;

  // Try to parse the trailer with and without dictionary, because some
  // malformatted documents are missing the dictionary.
  const [trailer, r4] =
    parseTrailer(r3 || remainder, parseHandlers) ||
    parseMalformattedTrailer(r3 || remainder, parseHandlers);
  console.log('done');
};

export default parseDocument;
