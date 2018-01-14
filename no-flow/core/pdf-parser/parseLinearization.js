'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _pdfStructures = require('../pdf-structures');

var _utils = require('../../utils');

var _parseXRefTable = require('./parseXRefTable');

var _parseXRefTable2 = _interopRequireDefault(_parseXRefTable);

var _parseIndirectObj = require('./parseIndirectObj');

var _parseIndirectObj2 = _interopRequireDefault(_parseIndirectObj);

var _parseTrailer = require('./parseTrailer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Linearization Param Dict, followed by an xref table
or stream, and finally a trailer.

If so, returns a tuple containing (1) an object representing those three objects
and (2) a subarray of the input with the characters making up the parsed objects
removed. The "onParseDict" parse handler will be called with the linearization
param dict. The "onParseLinearization" parse handler will also be called with
objects representing the three parsed linearization objects.

If not, null is returned.
*/
var parseLinearization = function parseLinearization(input) {
  var parseHandlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var trimmed = (0, _utils.trimArray)(input);

  // Try to parse a dictionary from the input
  var paramDictMatch = (0, _parseIndirectObj2.default)(trimmed, parseHandlers);
  if (!paramDictMatch) return null;

  // Make sure it is a Linearization Param Dictionary

  var _paramDictMatch = _slicedToArray(paramDictMatch, 2),
      paramDict = _paramDictMatch[0],
      remaining1 = _paramDictMatch[1];

  if (!paramDict.pdfObject.is(_pdfStructures.PDFLinearizationParams)) return null;

  // TODO: Do the parseHandlers really need to be passed to parseIndirectObj?
  // Next we should find a cross reference stream or xref table
  var xrefMatch = (0, _parseXRefTable2.default)(remaining1) || (0, _parseIndirectObj2.default)(remaining1, parseHandlers) || (0, _utils.error)('Found Linearization param dict but no first page xref table or stream.');

  var _xrefMatch = _slicedToArray(xrefMatch, 2),
      xref = _xrefMatch[0],
      remaining2 = _xrefMatch[1];

  var trailerMatch = (0, _parseTrailer.parseTrailer)(remaining2) || (0, _parseTrailer.parseTrailerWithoutDict)(remaining2);

  // Per the PDF spec, a trailer should always be present - but some PDFs in the
  // wild are missing them anyways
  if (!trailerMatch) {
    console.warn('Found Linearization param dict and cross reference index, but no associated trailer.');
  }

  var _ref = trailerMatch || [],
      _ref2 = _slicedToArray(_ref, 2),
      trailer = _ref2[0],
      remaining3 = _ref2[1];

  var linearization = { paramDict: paramDict, xref: xref, trailer: trailer };
  if (parseHandlers.onParseLinearization) {
    parseHandlers.onParseLinearization(linearization);
  }
  return [linearization, remaining3 || remaining2];
};

exports.default = parseLinearization;