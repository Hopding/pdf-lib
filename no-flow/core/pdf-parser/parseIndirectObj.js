'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

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

var _parseDictOrStream = require('./parseDictOrStream');

var _parseDictOrStream2 = _interopRequireDefault(_parseDictOrStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Indirect Object.

If so, returns a tuple containing (1) an object representing the parsed PDF
Indirect Object and (2) a subarray of the input with the characters making up
the parsed indirect object removed. The "onParseIndirectObj" parse handler will
also be called with the PDFIndirectObject.

If not, null is returned.
*/
var parseIndirectObj = function parseIndirectObj(input) {
  var parseHandlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var trimmed = (0, _utils.trimArray)(input);
  var indirectObjRegex = /^(\d+) (\d+) obj/;

  // Check that initial characters make up an indirect object "header"
  var objIdx = (0, _utils.arrayIndexOf)(trimmed, 'obj');
  var result = (0, _utils.arrayToString)(trimmed.subarray(0, objIdx + 3)).match(indirectObjRegex);
  if (!result) return null;

  // eslint-disable-next-line no-unused-vars

  var _result = _slicedToArray(result, 3),
      fullMatch = _result[0],
      objNum = _result[1],
      genNum = _result[2];

  // Extract the bytes making up the object itself


  var endobjIdx = (0, _utils.arrayIndexOf)(trimmed, 'endobj', objIdx);
  var content = trimmed.subarray(objIdx + 3, endobjIdx);

  // Try to parse the object bytes

  var _ref = (0, _parseDictOrStream2.default)(content, parseHandlers) || (0, _parseArray2.default)(content, parseHandlers) || (0, _parseName2.default)(content, parseHandlers) || (0, _parseString2.default)(content, parseHandlers) || (0, _parseIndirectRef2.default)(content, parseHandlers) || (0, _parseNumber2.default)(content, parseHandlers) || (0, _parseHexString2.default)(content, parseHandlers) || (0, _parseBool2.default)(content, parseHandlers) || (0, _parseNull2.default)(content, parseHandlers) || (0, _utils.error)('Failed to parse object contents'),
      _ref2 = _slicedToArray(_ref, 2),
      contentObj = _ref2[0],
      r = _ref2[1];

  if ((0, _utils.trimArray)(r).length > 0) (0, _utils.error)('Incorrectly parsed object contents');

  var indirectObj = _pdfObjects.PDFIndirectObject.of(contentObj).setReferenceNumbers(Number(objNum), Number(genNum));
  if (parseHandlers.onParseIndirectObj) {
    parseHandlers.onParseIndirectObj(indirectObj);
  }
  return [indirectObj, trimmed.subarray(endobjIdx + 6)];
};

exports.default = parseIndirectObj;