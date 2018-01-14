'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _parseStream = require('./parseStream');

var _parseStream2 = _interopRequireDefault(_parseStream);

var _parseDict = require('./parseDict');

var _parseDict2 = _interopRequireDefault(_parseDict);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Dictionary. Then checks if the subsequent characters
make up a PDF Stream.

If a PDFDictionary is found, but no PDFStream, then the dictionary is returned.
If a PDFStream is also found, then it is instead returned. The second argument
of the returned tuple contains a subarray of the input with the characters
making up the parsed object removed.

If no PDFDictionary is found at all, null is returned.
*/
var parseDictOrStream = function parseDictOrStream(input) {
  var parseHandlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  // Attempt to parse a dictionary
  var dictMatch = (0, _parseDict2.default)(input, parseHandlers);
  if (!dictMatch) return null;

  var _dictMatch = _slicedToArray(dictMatch, 2),
      dict = _dictMatch[0],
      r = _dictMatch[1];

  // Attempt to parse a stream next


  var streamMatch = (0, _parseStream2.default)(r, dict, parseHandlers);

  // Return stream if one was parsed, otherwise return the dictionary
  if (streamMatch) return streamMatch;
  return [dict, r];
};

exports.default = parseDictOrStream;