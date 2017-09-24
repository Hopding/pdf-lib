import _ from 'lodash';

import { charCode, isString } from '../utils';
import PDFNameObject from './PDFNameObject';
import PDFString from './PDFString';
import dedent from 'dedent';

const EntryStr = ([ offset, generationNum, isInUse ]) =>
  `${_.padStart(String(offset), 10, '0')} ` +
  `${_.padStart(String(generationNum), 5, '0')} ` +
  `${isInUse ? 'n' : 'f'} \n`;

const SubsectionStr = ([ firstObjNum, entries ]) => dedent(`
  ${firstObjNum} ${entries.length}
  ${entries.map(EntryStr).join('')}
`);

/*
Represents a PDF Cross-Reference Table.

From PDF 1.7 Specification, "7.5.4 Cross-Reference Table"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):

  The cross-reference table contains information that permits random access to indirect objects within the file so that the entire file need not be read to locate any particular object. The table shall contain a one-line entry for each indirect object, specifying the byte offset of that object within the body of the file. (Beginning with PDF 1.5, some or all of the cross-reference information may alternatively be contained in cross-reference streams; see 7.5.8, "Cross-Reference Streams.")

  The table comprises one or more cross-reference sections. Initially, the entire table consists of a single section (or two sections if the file is linearized; see Annex F). One additional section shall be added each time the file is incrementally updated (see 7.5.6, "Incremental Updates").
*/
/**
 * PDFCrossRefTable([
 *  [ 0, [
 *    [ 10, 1, true ],
 *    [ 15, 1, false ],
 *  ]],
 * ]);
 */
export default (outline=[]) => dedent(`
  xref
  ${outline.map(SubsectionStr)}
`);
