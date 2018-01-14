'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfStructures = require('../pdf-structures');

var _utils = require('../../utils');

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Header.

If so, returns a tuple containing (1) an object representing the parsed PDF
Header and (2) a subarray of the input with the characters making up the parsed
header removed. The "onParseHeader" parse handler will also be called with the
PDFHeader obect.

If not, null is returned.
*/
var parseHeader = function parseHeader(input) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      onParseHeader = _ref.onParseHeader;

  var trimmed = (0, _utils.trimArray)(input);
  var fileHeaderRegex = /^%PDF-(\d+)\.(\d+)/;

  // Search for first character that isn't part of a header
  var idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[%PDF-\d.]/)) {
    idx += 1;
  } // Try to match the regex up to that character to see if we've got a header
  var result = (0, _utils.arrayToString)(trimmed, 0, idx).match(fileHeaderRegex);
  if (!result) return null;

  var _result = _slicedToArray(result, 3),
      fullMatch = _result[0],
      major = _result[1],
      minor = _result[2];

  var withoutVersion = (0, _utils.trimArray)(trimmed.subarray(fullMatch.length));
  var returnArray = withoutVersion;

  // Check for a comment with binary characters
  if ((0, _utils.arrayCharAt)(withoutVersion, 0) === '%') {
    var nextNewline = (0, _utils.arrayIndexOf)(withoutVersion, '\n');
    returnArray = withoutVersion.subarray(nextNewline);
  }

  var pdfHeader = _pdfStructures.PDFHeader.forVersion(Number(major), Number(minor));
  if (onParseHeader) onParseHeader(pdfHeader);
  return [pdfHeader, returnArray];
};

exports.default = parseHeader;