'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
/* eslint-disable no-constant-condition */


var _utils = require('../../utils');

var _parseHeader = require('./parseHeader');

var _parseHeader2 = _interopRequireDefault(_parseHeader);

var _parseLinearization = require('./parseLinearization');

var _parseLinearization2 = _interopRequireDefault(_parseLinearization);

var _parseIndirectObj = require('./parseIndirectObj');

var _parseIndirectObj2 = _interopRequireDefault(_parseIndirectObj);

var _parseXRefTable = require('./parseXRefTable');

var _parseXRefTable2 = _interopRequireDefault(_parseXRefTable);

var _parseTrailer = require('./parseTrailer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Accepts an array of bytes as input. Parses indirect objects from the input bytes
until an xref table of trailer is found. The "onParseIndirectObj" parse
handler is called with each indirect object that is parsed.

Returns a subarray of the input bytes with the bytes making up the parsed
indirect objects removed.
*/

// import removeComments from './removeComments';

var parseBodySection = function parseBodySection(input, parseHandlers) {
  var remainder = input;
  while (true) {
    var result = (0, _parseIndirectObj2.default)(remainder, parseHandlers);
    if (!result) break;

    var _result = _slicedToArray(result, 2);

    remainder = _result[1];
  }
  return remainder;
};

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
input make up an xref table followed by a trailer, or just a trailer. The
"onParseXRefTable" and "onParseTrailer" parseHandlers will be called with the
parsed objects.

Returns a subarray of the input bytes with the bytes making up the parsed
objects removed.
*/
var parseFooterSection = function parseFooterSection(input, parseHandlers) {
  var remainder = input;

  // Try to parse the XRef table (some PDFs omit the XRef table)
  var parsedXRef = (0, _parseXRefTable2.default)(input, parseHandlers);
  if (parsedXRef) {
    ;

    var _parsedXRef = _slicedToArray(parsedXRef, 2);

    remainder = _parsedXRef[1];
  } // Try to parse the trailer with and without dictionary, because some
  // malformatted documents are missing the dictionary.
  var parsedTrailer = (0, _parseTrailer.parseTrailer)(remainder, parseHandlers) || (0, _parseTrailer.parseTrailerWithoutDict)(remainder, parseHandlers);
  if (!parsedTrailer) return null;

  var _parsedTrailer = _slicedToArray(parsedTrailer, 2);

  remainder = _parsedTrailer[1];

  return remainder;
};

/**
Accepts an array of bytes comprising a PDF document as input. Parses all the
objects in the file in a sequential fashion, beginning with the header and
ending with the last trailer. The XRef tables/streams in the input are not
used to locate and parse objects as needed. Rather, the whole document is
parsed and stored in memory at once.
*/
var parseDocument = function parseDocument(input, parseHandlers) {
  // TODO: Figure out way to clean comments without messing stream content up
  // const cleaned = removeComments(input);

  // Parse the document header
  var cleaned = input;

  var _ref = (0, _parseHeader2.default)(cleaned, parseHandlers) || (0, _utils.error)('PDF is missing a header'),
      _ref2 = _slicedToArray(_ref, 2),
      remainder = _ref2[1];

  // If document is linearized, we'll need to parse the linearization
  // dictionary and First-Page XRef table/stream next...


  var linearizationMatch = (0, _parseLinearization2.default)(remainder, parseHandlers);
  if (linearizationMatch) {
    ;

    var _linearizationMatch = _slicedToArray(linearizationMatch, 2);

    remainder = _linearizationMatch[1];
  } // Parse each body of the document and its corresponding footer.
  // (if document does not have update sections, loop will only occur once)
  while (remainder) {
    remainder = parseBodySection(remainder, parseHandlers);
    remainder = parseFooterSection(remainder, parseHandlers);
  }
};

exports.default = parseDocument;