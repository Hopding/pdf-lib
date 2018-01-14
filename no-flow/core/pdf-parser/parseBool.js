'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

/**
Accepts an array of bytes as input. Checks to see if the first characters in the trimmed input make up a PDF Boolean.

If so, returns a tuple containing (1) an object representing the parsed PDF Header and (2) a subarray of the input with the characters making up the parsed header removed. The "onParseBool" parse handler will also be called with the PDFBoolean object.

If not, null is returned.
*/
var parseBool = function parseBool(input) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      onParseBool = _ref.onParseBool;

  var boolRegex = /^(?:[\n|\r| ]*)(true|false)((?= |\]|\n|\r))?/;

  // Search for first character that isn't part of a boolean
  var idx = 0;
  while (String.fromCharCode(input[idx]).match(/^[ \n\rtruefalse]/)) {
    idx += 1;
  } // Try to match the regex up to that character to see if we've got a boolean
  var result = (0, _utils.arrayToString)(input, 0, idx).match(boolRegex);
  if (!result) return null;

  var _result = _slicedToArray(result, 2),
      fullMatch = _result[0],
      bool = _result[1];

  var pdfBool = _pdfObjects.PDFBoolean.fromString(bool);
  if (onParseBool) onParseBool(pdfBool);
  return [pdfBool, input.subarray(fullMatch.length)];
};

exports.default = parseBool;