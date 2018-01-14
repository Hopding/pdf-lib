'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Hex String.

If so, returns a tuple containing (1) an object representing the parsed PDF Hex
String and (2) a subarray of the input with the characters making up the parsed
hex string removed. The "onParseHexString" parse handle will also be called with
the PDFHexString object.

If not, null is returned.
*/
var parseHexString = function parseHexString(input) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      onParseHexString = _ref.onParseHexString;

  var hexStringRegex = /^<([\dABCDEFabcdef]*)>/;
  var trimmed = (0, _utils.trimArray)(input);

  // Search for first character that isn't part of a hex string
  var idx = 0;
  while ((0, _utils.charFromCode)(trimmed[idx]).match(/^[<(\dABCDEFabcdef]/)) {
    idx += 1;
  } // Try to match the regex up to that character to see if we've got a hex string
  var result = (0, _utils.arrayToString)(trimmed, 0, idx + 2).match(hexStringRegex);
  if (!result) return null;

  var _result = _slicedToArray(result, 2),
      fullMatch = _result[0],
      hexString = _result[1];

  var pdfHexString = _pdfObjects.PDFHexString.fromString(hexString);
  if (onParseHexString) onParseHexString(pdfHexString);
  return [pdfHexString, trimmed.subarray(fullMatch.length)];
};

exports.default = parseHexString;