'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF String.

If so, returns a tuple containing (1) an object representing the parsed PDF
String and (2) a subarray of the input with the characters making up the parsed
string removed. The "onParseString" parse handler will also be called with the
PDFString object.

If not, returns null.
*/
var parseString = function parseString(input) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      onParseString = _ref.onParseString;

  var trimmed = (0, _utils.trimArray)(input);
  if ((0, _utils.arrayCharAt)(trimmed, 0) !== '(') return null;

  var parensStack = [];
  var isEscaped = false;
  for (var idx = 0; idx < trimmed.length; idx += 1) {
    var c = (0, _utils.arrayCharAt)(trimmed, idx);
    // Check for unescaped parenthesis
    if (!isEscaped) {
      if (c === '(') parensStack.push(c);else if (c === ')') parensStack.pop();
    }

    // Track whether current character is being escaped or not
    if (c === '\\') {
      if (!isEscaped) {
        isEscaped = true;
      } else {
        isEscaped = false;
      }
    } else if (isEscaped) isEscaped = false;

    // Once (if) the unescaped parenthesis balance out, return their contents
    if (parensStack.length === 0) {
      var str = (0, _utils.arrayToString)(trimmed, 1, idx);
      var pdfString = _pdfObjects.PDFString.fromString(str);
      if (onParseString) onParseString(pdfString);
      return [pdfString, trimmed.subarray(idx + 1)];
    }
  }
  return null; // Parenthesis didn't balance out
};

exports.default = parseString;