'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFOperator = require('../../PDFOperator');

var _PDFOperator2 = _interopRequireDefault(_PDFOperator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Move to the start of the next line.
This operator has the same effect as the code
0 -Tl Td
where Tl denotes the current leading parameter in the text state. The
negative of Tl is used here because Tl is the text leading expressed as a
positive number. Going to the next line entails decreasing the y coordinate.
*/
exports.default = _PDFOperator2.default.createSingletonOp('T*');