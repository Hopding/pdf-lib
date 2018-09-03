import { PDFXRef } from 'core/pdf-structures';
import { arrayToString, trimArray } from 'utils';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an string as input. Repeatedly applies a regex to the input that matches
 * against entries of PDF Cross Reference Table subsections.
 *
 * If entries are found, then an array of Entry will be returned.
 *
 * If not, null is returned.
 */
const parseEntries = (input: string): PDFXRef.Entry[] | void => {
  const trimmed = input.trim();
  const entryRegex = /^(\d{10}) (\d{5}) (n|f)/;

  const entriesArr = [];
  let remainder = trimmed;
  while (remainder.length > 0) {
    const result = remainder.match(entryRegex);
    if (!result) return undefined;

    const [fullMatch, offset, genNum, isInUse] = result;

    entriesArr.push(
      PDFXRef.Entry.create()
        .setOffset(Number(offset))
        .setGenerationNum(Number(genNum))
        .setIsInUse(isInUse === 'n'),
    );
    remainder = remainder.substring(fullMatch.length).trim();
  }

  return entriesArr;
};

/**
 * Accepts an string as input. Repeatedly applies a regex to the input that matches
 * against subsections of PDF Cross Reference Tables.
 *
 * If subsections are found, then an array of Subsection will be returned.
 *
 * If not, null is returned.
 */
const parseSubsections = (input: string): PDFXRef.Subsection[] | void => {
  const trimmed = input.trim();
  const sectionsRegex = /^(\d+) (\d+)((\n|\r| )*(\d{10} \d{5} (n|f)(\n|\r| )*)+)/;

  const sectionsArr = [];
  let remainder = trimmed;
  while (remainder.length > 0) {
    const result = remainder.match(sectionsRegex);
    if (!result) return undefined;

    const [fullMatch, firstObjNum, _objCount, entriesStr] = result;
    const entries = parseEntries(entriesStr);
    if (!entries) return undefined;

    sectionsArr.push(
      PDFXRef.Subsection.from(entries).setFirstObjNum(Number(firstObjNum)),
    );
    remainder = remainder.substring(fullMatch.length).trim();
  }

  return sectionsArr;
};

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in the
 * trimmed input make up a PDF Cross Reference Table.
 *
 * If so, returns a tuple containing (1) an object representing the parsed PDF
 * Cross Reference Table and (2) a subarray of the input with the characters making
 * up the parsed cross reference table removed. The "onParseXRefTable" parse
 * handler will also be called with the Table object.
 *
 * If not, null is returned.
 */
const parseXRefTable = (
  input: Uint8Array,
  { onParseXRefTable }: IParseHandlers = {},
): [PDFXRef.Table, Uint8Array] | void => {
  const trimmed = trimArray(input);
  const xRefTableRegex = /^xref[\n|\r| ]*([\d|\n|\r| |f|n]+)/;

  // Search for first character that isn't part of an xref table
  let idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[xref \n\r\dfn]/)) idx += 1;

  // Try to match the regex up to that character to see if we've got an xref table
  const result1 = arrayToString(trimmed, 0, idx).match(xRefTableRegex);
  if (!result1) return undefined;

  // Parse the subsections of the xref table
  const [fullMatch, contents] = result1;
  const subsections = parseSubsections(contents);
  if (!subsections) return undefined;

  const xRefTable = PDFXRef.Table.from(subsections);
  if (onParseXRefTable) onParseXRefTable(xRefTable);

  return [xRefTable, trimmed.subarray(fullMatch.length)];
};

export default parseXRefTable;
