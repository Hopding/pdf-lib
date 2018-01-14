'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _pdfStructures = require('../pdf-structures');

var _decodeStream = require('./encoding/decodeStream');

var _decodeStream2 = _interopRequireDefault(_decodeStream);

var _parseObjectStream = require('./parseObjectStream');

var _parseObjectStream2 = _interopRequireDefault(_parseObjectStream);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Accepts an array of bytes and a PDFDictionary as input. Checks to see if the
first characters in the trimmed input make up a PDF Stream.

If so, the content of the stream is extracted into a subarray. A tuple
containing this subarray and a subarray of the input with the bytes making
up the content removed is returned.

If not, null is returned.
*/
var parseStream = function parseStream(input, dict) {
  var parseHandlers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // Check that the next bytes comprise the beginning of a stream
  var trimmed = (0, _utils.trimArray)(input);
  var startstreamIdx = void 0;
  if ((0, _utils.arrayToString)(trimmed, 0, 7) === 'stream\n') startstreamIdx = 7;else if ((0, _utils.arrayToString)(trimmed, 0, 8) === 'stream\r\n') startstreamIdx = 8;
  if (!startstreamIdx) return null;

  /*
  TODO: Make this more efficient by using the "Length" entry of the stream
  dictionary to jump to the end of the stream, instead of traversing each byte.
  */
  // Locate the end of the stream
  var endstreamIdx = (0, _utils.arrayIndexOf)(trimmed, '\nendstream') || (0, _utils.arrayIndexOf)(trimmed, '\rendstream');
  if (!endstreamIdx && endstreamIdx !== 0) (0, _utils.error)('Invalid Stream!');

  /*
  TODO: See if it makes sense to .slice() the stream contents, even though this
  would require more memory space.
  */
  // Extract the stream content bytes
  var contents = trimmed.subarray(startstreamIdx, endstreamIdx);

  // Verify that the next characters denote the end of the stream
  var endobjIdx = (0, _utils.arrayIndexOf)(trimmed, 'endobj', endstreamIdx);
  if ((0, _utils.arrayToString)(trimmed, endstreamIdx, endobjIdx).trim() !== 'endstream') {
    (0, _utils.error)('Invalid Stream!');
  }

  return [contents, trimmed.subarray(endstreamIdx + 10)];
};

/**
Accepts an array of bytes and a PDFDictionary as input. Checks to see if the
first characters in the trimmed input make up a PDF Stream.

If so, returns a tuple containing (1) a PDFObjectStream if it is an
Object Stream, otherwise a PDFStream and (2) a subarray of the input wih the
characters making up the parsed stream removed. The "onParseObjectStream" will
be called with the PDFObjectStream if it is an Object Stream. Otherwise
the "onParseStream" parse hander will be called.

If not, null is returned.
*/

exports.default = function (input, dict) {
  var parseHandlers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // Parse the input bytes into the stream dictionary and content bytes
  var res = parseStream(input, dict, parseHandlers);
  if (!res) return null;

  var _res = _slicedToArray(res, 2),
      contents = _res[0],
      remaining = _res[1];

  // If it's an Object Stream, parse it and return the indirect objects it contains


  if (dict.get('Type') === _pdfObjects.PDFName.from('ObjStm')) {
    if (dict.get('Filter') !== _pdfObjects.PDFName.from('FlateDecode')) {
      (0, _utils.error)('Cannot decode "' + dict.get('Filter') + '" Object Streams');
    }

    var decoded = (0, _decodeStream2.default)(dict, contents);
    var objectStream = (0, _parseObjectStream2.default)(dict, decoded, parseHandlers);
    if (parseHandlers.onParseObjectStream) {
      parseHandlers.onParseObjectStream(objectStream);
    }
    return [objectStream, remaining];
  }

  // Otherwise, return a PDFStream without parsing the content bytes
  var stream = _pdfObjects.PDFRawStream.from(dict, contents);
  if (parseHandlers.onParseStream) parseHandlers.onParseStream(stream);
  return [stream, remaining];
};