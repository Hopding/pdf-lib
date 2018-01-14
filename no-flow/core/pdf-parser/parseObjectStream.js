'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _pdfStructures = require('../pdf-structures');

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

var _parseDict = require('./parseDict');

var _parseDict2 = _interopRequireDefault(_parseDict);

var _parseArray = require('./parseArray');

var _parseArray2 = _interopRequireDefault(_parseArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Accepts a PDFDictionary and an array of bytes as input. The PDFDictionary should
be a PDF Object Stream dictionary, and the array of bytes should be its content.

Attempts to parse the pairs of integers at the start of the input bytes. Each
pair describes one object within the Object Stream - its object number and byte
offset within the stream, respectively.

Returns an array of objects representing the parsed integer pairs.
*/
var parseObjData = function parseObjData(dict, input) {
  // Extract the value of the "N" entry from the dict
  var N = dict.get('N') || (0, _utils.error)('Object stream dict must have "N" entry');
  var numObjects = N.number;

  // Regex representing a pair of integers
  var objDatumRegex = /^ *(\d+) *(\d+) */;

  // Find the first non-numeric character (not including EOLs and spaces) in the
  // input bytes
  var firstNonNumIdx = (0, _utils.arrayFindIndexOf)(input, function (charByte) {
    return String.fromCharCode(charByte).match(/[^\d\n\r ]/);
  });

  // Convert the input bytes to a string, up to the first non-numeric character
  var objDatumsStr = (0, _utils.arrayToString)(input, 0, firstNonNumIdx);

  // Repeatedly apply the integer pair regex to the input string to build up an
  // array of the parsed integer pairs
  var objData = [];
  var i = 0;
  var remaining = objDatumsStr;
  while (i < numObjects) {
    var _remaining$match = remaining.match(objDatumRegex),
        _remaining$match2 = _slicedToArray(_remaining$match, 3),
        fullmatch = _remaining$match2[0],
        _objNum = _remaining$match2[1],
        _byteOffset = _remaining$match2[2];

    objData.push({ objNum: Number(_objNum), byteOffset: Number(_byteOffset) });

    remaining = remaining.substring(fullmatch.length);
    i += 1;
  }

  return objData;
};

/**
Accepts an a PDFDictionary and an array of bytes as input. The PDFDictionary
should be a PDF Object Stream dictionary, and the array of bytes should be its
content. *The array of bytes is expected to have been decoded (based on the
"Filter"s in the dictionary) prior to being passed to this function.*

After parsing the integer pairs from the start of the input bytes, the objects
themselves will be parsed from the remaining input bytes.

An PDFObjectStream will be returned, representing the objects parsed
from the Object Stream. The "onParseObjectStream" parse handler will also be
called with the PDFObjectStream.
*/
var parseObjectStream = function parseObjectStream(dict, input) {
  var parseHandlers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // Parse the pairs of integers from start of input bytes
  var objData = parseObjData(dict, input);

  // Extract the value of the "First" entry in the dict
  var First = dict.get('First') || (0, _utils.error)('Object stream dict must have "First" entry');
  var firstObjOffset = First.number;

  // Map each pair of integers to a PDFIndirectObject
  var indirectObjects = objData.map(function (_ref) {
    var objNum = _ref.objNum,
        byteOffset = _ref.byteOffset;

    var subarray = input.subarray(firstObjOffset + byteOffset);

    var _ref2 = (0, _parseDict2.default)(subarray, parseHandlers) || (0, _parseArray2.default)(subarray, parseHandlers) || (0, _parseName2.default)(subarray, parseHandlers) || (0, _parseString2.default)(subarray, parseHandlers) || (0, _parseIndirectRef2.default)(subarray, parseHandlers) || (0, _parseNumber2.default)(subarray, parseHandlers) || (0, _parseHexString2.default)(subarray, parseHandlers) || (0, _parseBool2.default)(subarray, parseHandlers) || (0, _parseNull2.default)(subarray, parseHandlers) || (0, _utils.error)('Failed to parse object in Object Stream'),
        _ref3 = _slicedToArray(_ref2, 1),
        pdfObject = _ref3[0];

    return _pdfObjects.PDFIndirectObject.of(pdfObject).setReferenceNumbers(objNum, 0);
  });

  var objectStream = _pdfStructures.PDFObjectStream.from(dict, indirectObjects);

  // Call the parse handler
  if (parseHandlers.onParseObjectStream) {
    parseHandlers.onParseObjectStream(objectStream);
  }

  return objectStream;
};

exports.default = parseObjectStream;