'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Null value.

If so, returns a tuple containing (1) an object representing the parsed PDF Null
value and (2) a subarray of the input with the characters making up the parsed
null value removed. The "onParseNull" parse handler will also be called with the
PDFNull object.

If not, null is returned.
*/
var parseNull = function parseNull(input) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      onParseNull = _ref.onParseNull;

  var trimmed = (0, _utils.trimArray)(input);
  if ((0, _utils.arrayToString)(trimmed, 0, 4) !== 'null') return null;

  if (onParseNull) onParseNull(_pdfObjects.PDFNull.instance);
  return [_pdfObjects.PDFNull.instance, trimmed.subarray(4)];
};

exports.default = parseNull;