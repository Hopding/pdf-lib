'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _pdfStructures = require('../pdf-structures');

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

var _parseArray = require('./parseArray');

var _parseArray2 = _interopRequireDefault(_parseArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable prettier/prettier */
var typeDict = function typeDict(dict) {
  if (dict.get('Linearized')) return _pdfStructures.PDFLinearizationParams.from(dict);
  switch (dict.get('Type')) {
    case _pdfObjects.PDFName.from('Catalog'):
      return _pdfStructures.PDFCatalog.from(dict);
    case _pdfObjects.PDFName.from('Pages'):
      return _pdfStructures.PDFPageTree.from(dict);
    case _pdfObjects.PDFName.from('Page'):
      return _pdfStructures.PDFPage.from(dict);
    default:
      return dict;
  }
};
/* eslint-enable prettier/prettier */

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Dictionary.

If so, returns a tuple containing (1) an object representing the parsed
PDFDictionary and (2) a subarray of the input with the characters making up the
parsed header removed. The "onParseDict" parse handler will also be called with
the PDFDictionary object.

If not, null is returned.

Note that the entries of the PDF Dictionary are recursively parsed, so the
appropriate parse handlers will be called when each entry of the dictionary is
parsed. The returned PDFDictionary's keys will be PDFName objects, and its
values will be PDFObjects.
*/
var parseDict = function parseDict(input) {
  var parseHandlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var trimmed = (0, _utils.trimArray)(input);
  if ((0, _utils.arrayToString)(trimmed, 0, 2) !== '<<') return null;
  var pdfDict = _pdfObjects.PDFDictionary.from();

  // Recursively parse each entry in the dictionary
  var remainder = (0, _utils.trimArray)(trimmed.subarray(2));
  while ((0, _utils.arrayToString)((0, _utils.trimArray)(remainder), 0, 2) !== '>>') {
    // Parse the key for this entry
    var _ref = (0, _parseName2.default)(remainder) || (0, _utils.error)('Failed to parse dictionary key'),
        _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        r1 = _ref2[1];

    remainder = r1;

    // Parse the value for this entry

    var _ref3 = (0, _parseName2.default)(remainder, parseHandlers) || parseDict(remainder, parseHandlers) || (0, _parseArray2.default)(remainder, parseHandlers) || (0, _parseString2.default)(remainder, parseHandlers) || (0, _parseIndirectRef2.default)(remainder, parseHandlers) || (0, _parseNumber2.default)(remainder, parseHandlers) || (0, _parseHexString2.default)(remainder, parseHandlers) || (0, _parseBool2.default)(remainder, parseHandlers) || (0, _parseNull2.default)(remainder, parseHandlers) || (0, _utils.error)('Failed to parse dictionary value'),
        _ref4 = _slicedToArray(_ref3, 2),
        pdfObject = _ref4[0],
        r2 = _ref4[1];

    pdfDict.set(key, pdfObject);
    remainder = r2;
  }
  var remainderTrim = (0, _utils.trimArray)(remainder);

  // Make sure the brackets are paired
  (0, _validate.validate)((0, _utils.arrayToString)(remainderTrim, 0, 2), (0, _validate.isIdentity)('>>'), 'Mismatched brackets!');

  remainder = (0, _utils.trimArray)(remainderTrim.subarray(2)); // Remove ending '>>' pair

  var typedDict = typeDict(pdfDict);
  if (parseHandlers.onParseDict) parseHandlers.onParseDict(typedDict);
  return [typedDict, remainder];
};

exports.default = parseDict;