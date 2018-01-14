'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Indirect Reference.

If so, returns a tuple containing (1) an object representing the parsed PDF
Indirect Reference and (2) a subarray of the input with the characters making up
the parsed indirect reference removed. The "onParseIndirectRef" parse handler
will also be called with the PDFIndirectReference.

If not, null is returned.
*/
var parseIndirectRef = function parseIndirectRef(input) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      onParseIndirectRef = _ref.onParseIndirectRef;

  var trimmed = (0, _utils.trimArray)(input);
  var indirectRefRegex = /^(\d+) (\d+) R/;

  // Check that initial characters make up an indirect reference
  var rIdx = (0, _utils.arrayIndexOf)(trimmed, 'R');
  var result = (0, _utils.arrayToString)(trimmed, 0, rIdx + 1).match(indirectRefRegex);
  if (!result) return null;

  var _result = _slicedToArray(result, 3),
      fullMatch = _result[0],
      objNum = _result[1],
      genNum = _result[2];

  var ref = _pdfObjects.PDFIndirectReference.forNumbers(Number(objNum), Number(genNum));
  if (onParseIndirectRef) onParseIndirectRef(ref);
  return [ref, trimmed.subarray(fullMatch.length)];
};

exports.default = parseIndirectRef;