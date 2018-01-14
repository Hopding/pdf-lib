'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmped input make up a PDF Number.

If so, returns a tuple containing (1) an object representing the parsed PDF
Number and (2) a subarray of the input with the characters making up the parsed
number removed. The "onParseNumber" parse handler will also be called with the
PDFNumber object.

If not, null is returned.
*/
var parseNumber = function parseNumber(input) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      onParseNumber = _ref.onParseNumber;

  var trimmed = (0, _utils.trimArray)(input);
  var numRegex = /^(((\+{1}|-{1})?\d+(\.\d+)?)|((\+{1}|-{1})?\.\d+))/;

  // Search for the first character that isn't part of a number
  var idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[+-.\d]/)) {
    idx += 1;
  } // Try to match the regex up to that character to see if we've got a number
  var result = (0, _utils.arrayToString)(trimmed, 0, idx).match(numRegex);
  if (!result) return null;

  var _result = _slicedToArray(result, 2),
      fullMatch = _result[0],
      num = _result[1];

  var pdfNumber = _pdfObjects.PDFNumber.fromString(num);
  if (onParseNumber) onParseNumber(pdfNumber);
  return [pdfNumber, trimmed.subarray(fullMatch.length)];
};

exports.default = parseNumber;