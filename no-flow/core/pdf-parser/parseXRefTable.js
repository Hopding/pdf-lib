'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfStructures = require('../pdf-structures');

var _utils = require('../../utils');

/**
Accepts an string as input. Repeatedly applies a regex to the input that matches
against entries of PDF Cross Reference Table subsections.

If entries are found, then an array of PDFXRef.Entry will be returned.

If not, null is returned.
*/
var parseEntries = function parseEntries(input) {
  var trimmed = input.trim();
  var entryRegex = /^(\d{10}) (\d{5}) (n|f)/;

  var entriesArr = [];
  var remainder = trimmed;
  while (remainder.length > 0) {
    var result = remainder.match(entryRegex);
    if (!result) return null;

    var _result = _slicedToArray(result, 4),
        fullMatch = _result[0],
        offset = _result[1],
        genNum = _result[2],
        isInUse = _result[3];

    entriesArr.push(_pdfStructures.PDFXRef.Entry.create().setOffset(Number(offset)).setGenerationNum(Number(genNum)).setIsInUse(isInUse === 'n'));
    remainder = remainder.substring(fullMatch.length).trim();
  }

  return entriesArr;
};

/**
Accepts an string as input. Repeatedly applies a regex to the input that matches
against subsections of PDF Cross Reference Tables.

If subsections are found, then an array of PDFXRef.Subsection will be returned.

If not, null is returned.
*/
var parseSubsections = function parseSubsections(input) {
  var trimmed = input.trim();
  var sectionsRegex = /^(\d+) (\d+)((\n|\r| )*(\d{10} \d{5} (n|f)(\n|\r| )*)+)/;

  var sectionsArr = [];
  var remainder = trimmed;
  while (remainder.length > 0) {
    var result = remainder.match(sectionsRegex);
    if (!result) return null;

    // eslint-disable-next-line no-unused-vars

    var _result2 = _slicedToArray(result, 4),
        fullMatch = _result2[0],
        firstObjNum = _result2[1],
        objCount = _result2[2],
        entriesStr = _result2[3];

    var entries = parseEntries(entriesStr);
    if (!entries) return null;

    sectionsArr.push(_pdfStructures.PDFXRef.Subsection.from(entries).setFirstObjNum(Number(firstObjNum)));
    remainder = remainder.substring(fullMatch.length).trim();
  }

  return sectionsArr;
};

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Cross Reference Table.

If so, returns a tuple containing (1) an object representing the parsed PDF
Cross Reference Table and (2) a subarray of the input with the characters making
up the parsed cross reference table removed. The "onParseXRefTable" parse
handler will also be called with the PDFXRef.Table object.

If not, null is returned.
*/
var parseXRefTable = function parseXRefTable(input) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      onParseXRefTable = _ref.onParseXRefTable;

  var trimmed = (0, _utils.trimArray)(input);
  var xRefTableRegex = /^xref[\n|\r| ]*([\d|\n|\r| |f|n]+)/;

  // Search for first character that isn't part of an xref table
  var idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[xref \n\r\dfn]/)) {
    idx += 1;
  } // Try to match the regex up to that character to see if we've got an xref table
  var result1 = (0, _utils.arrayToString)(trimmed, 0, idx).match(xRefTableRegex);
  if (!result1) return null;

  // Parse the subsections of the xref table

  var _result3 = _slicedToArray(result1, 2),
      fullMatch = _result3[0],
      contents = _result3[1];

  var subsections = parseSubsections(contents);
  if (!subsections) return null;

  var xRefTable = _pdfStructures.PDFXRef.Table.from(subsections);
  if (onParseXRefTable) onParseXRefTable(xRefTable);

  return [xRefTable, trimmed.subarray(fullMatch.length)];
};

exports.default = parseXRefTable;