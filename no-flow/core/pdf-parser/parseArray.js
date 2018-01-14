'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

var _parseNull = require('./parseNull');

var _parseNull2 = _interopRequireDefault(_parseNull);

var _parseIndirectRef = require('./parseIndirectRef');

var _parseIndirectRef2 = _interopRequireDefault(_parseIndirectRef);

var _parseString = require('./parseString');

var _parseString2 = _interopRequireDefault(_parseString);

var _parseHexString = require('./parseHexString');

var _parseHexString2 = _interopRequireDefault(_parseHexString);

var _parseName = require('./parseName');

var _parseName2 = _interopRequireDefault(_parseName);

var _parseBool = require('./parseBool');

var _parseBool2 = _interopRequireDefault(_parseBool);

var _parseNumber = require('./parseNumber');

var _parseNumber2 = _interopRequireDefault(_parseNumber);

var _parseDict = require('./parseDict');

var _parseDict2 = _interopRequireDefault(_parseDict);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Array.

If so, returns a tuple containing (1) an object representing the parsed PDFArray
and (2) a subarray of the input with the characters making up the parsed header
removed. The "onParseArray" parse handler will also be called with the PDFArray
object.

If not, null is returned.

Note that the elements of the PDF Array are recursively parsed, so the
appropriate parse handlers will be called when each element of the array is
parsed. The returned PDFArray's elements will be composed of PDFObjects.
*/
var parseArray = function parseArray(input) {
  var parseHandlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  // Make sure it is possible for this to be an array.
  var trimmed = (0, _utils.trimArray)(input);
  if ((0, _utils.arrayCharAt)(trimmed, 0) !== '[') return null;
  var pdfArray = _pdfObjects.PDFArray.fromArray([]);

  // Recursively parse each element of the array
  var remainder = trimmed.subarray(1); // Remove the '['
  while ((0, _utils.arrayCharAt)((0, _utils.trimArray)(remainder), 0) !== ']') {
    // Parse the value for this element
    var _ref = (0, _parseName2.default)(remainder, parseHandlers) || (0, _parseDict2.default)(remainder, parseHandlers) || parseArray(remainder, parseHandlers) || (0, _parseString2.default)(remainder, parseHandlers) || (0, _parseIndirectRef2.default)(remainder, parseHandlers) || (0, _parseNumber2.default)(remainder, parseHandlers) || (0, _parseHexString2.default)(remainder, parseHandlers) || (0, _parseBool2.default)(remainder, parseHandlers) || (0, _parseNull2.default)(remainder, parseHandlers) || (0, _utils.error)('Failed to parse array element'),
        _ref2 = _slicedToArray(_ref, 2),
        pdfObject = _ref2[0],
        r = _ref2[1];

    pdfArray.push(pdfObject);
    remainder = r;
  }
  var remainderTrim = (0, _utils.trimArray)(remainder);

  // Make sure the brackets are paired
  (0, _validate.validate)((0, _utils.arrayCharAt)(remainderTrim, 0), (0, _validate.isIdentity)(']'), 'Mismatched brackets!');
  remainder = (0, _utils.trimArray)(remainderTrim.subarray(1)); // Remove the ']'

  if (parseHandlers.onParseArray) parseHandlers.onParseArray(pdfArray);
  return [pdfArray, remainder];
};

exports.default = parseArray;