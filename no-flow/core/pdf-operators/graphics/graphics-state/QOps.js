'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFOperator = require('../../PDFOperator');

var _PDFOperator2 = _interopRequireDefault(_PDFOperator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  /**
  Save the current graphics state on the graphics state stack
  */
  q: _PDFOperator2.default.createSingletonOp('q'),
  /**
  Restore the graphics state by removing the most recently saved state from the
  stack and making it the current state
  */
  Q: _PDFOperator2.default.createSingletonOp('Q')
};