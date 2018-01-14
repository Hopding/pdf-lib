'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTrailerWithoutDict = exports.parseTrailer = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _pdfStructures = require('../pdf-structures');

var _utils = require('../../utils');

var _parseDict = require('./parseDict');

var _parseDict2 = _interopRequireDefault(_parseDict);

var _parseNumber = require('./parseNumber');

var _parseNumber2 = _interopRequireDefault(_parseNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Trailer.

If so, returns a tuple containing (1) an object representing the parsed PDF
Trailer and (2) a subarray of the input with the characters making up the parsed
trailer removed. The "onParseTrailer" parse handler will be called with the
PDFTrailer object. The "onParseDict" parse handler will be called with the
dictionary of the PDFTrailer, and the "onParseNumber" parse handler will be
called with the "lastXRefOffset" of the PDFTrailer.

If not, null is returned.
*/
var parseTrailer = function parseTrailer(input) {
  var parseHandlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var trimmed = (0, _utils.trimArray)(input);
  var trailerRegex = /^trailer[\n|\r| ]*([^]+)startxref[\n|\r| ]+?(\d+)[\n|\r| ]+?%%EOF/;

  // Find the nearest "%%EOF" of the input and match the regex up to that index
  var eofIdx = (0, _utils.arrayIndexOf)(trimmed, '%%EOF');
  var result = (0, _utils.arrayToString)(trimmed, 0, eofIdx + 5).match(trailerRegex);
  if (!result) return null;

  var _result = _slicedToArray(result, 3),
      fullMatch = _result[0],
      dictStr = _result[1],
      lastXRefOffsetStr = _result[2];

  // Parse the dictionary string into a PDFDictionary


  var dictBytes = new Uint8Array(dictStr.split('').map(_utils.charCode));

  var _ref = (0, _parseDict2.default)(dictBytes, parseHandlers) || (0, _utils.error)('Failed to parse trailer dictionary'),
      _ref2 = _slicedToArray(_ref, 1),
      dict = _ref2[0];

  // Parse the xref offset string value into a PDFNumber


  var offsetBytes = new Uint8Array(lastXRefOffsetStr.split('').map(_utils.charCode));

  var _ref3 = (0, _parseNumber2.default)(offsetBytes, parseHandlers) || (0, _utils.error)('Failed to parse lastXRefOffset of trailer'),
      _ref4 = _slicedToArray(_ref3, 1),
      lastXRefOffset = _ref4[0];

  var trailer = _pdfStructures.PDFTrailer.from(lastXRefOffset.number, dict);
  if (parseHandlers.onParseTrailer) parseHandlers.onParseTrailer(trailer);
  return [trailer, trimmed.subarray(fullMatch.length)];
};

/**
Same as "parseTrailer" function, except does not look for the complete trailer.
Specifically, the "trailer" keyword and the trailer's dictionary are not parsed.

Documents that have such a trailer do not meet the official specification, but
they do appear in the wild sometimes. This function allows us to handle them.
*/
var parseTrailerWithoutDict = function parseTrailerWithoutDict(input) {
  var parseHandlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var trimmed = (0, _utils.trimArray)(input);
  var trailerRegex = /^startxref[\n|\r| ]+?(\d+)[\n|\r| ]+?%%EOF/;

  // Find the nearest "%%EOF" of the input and match the regex up to that index
  var eofIdx = (0, _utils.arrayIndexOf)(trimmed, '%%EOF');
  var result = (0, _utils.arrayToString)(trimmed, 0, eofIdx + 5).match(trailerRegex);
  if (!result) return null;

  var _result2 = _slicedToArray(result, 2),
      fullMatch = _result2[0],
      lastXRefOffsetStr = _result2[1];

  // Parse the xref offset string value into a PDFNumber


  var offsetBytes = new Uint8Array(lastXRefOffsetStr.split('').map(_utils.charCode));

  var _ref5 = (0, _parseNumber2.default)(offsetBytes, parseHandlers) || (0, _utils.error)('Failed to parse lastXRefOffset of trailer'),
      _ref6 = _slicedToArray(_ref5, 1),
      lastXRefOffset = _ref6[0];

  var trailer = _pdfStructures.PDFTrailer.from(lastXRefOffset.number, _pdfObjects.PDFDictionary.from({}));
  if (parseHandlers.onParseTrailer) parseHandlers.onParseTrailer(trailer);
  return [trailer, trimmed.subarray(fullMatch.length)];
};

exports.parseTrailer = parseTrailer;
exports.parseTrailerWithoutDict = parseTrailerWithoutDict;