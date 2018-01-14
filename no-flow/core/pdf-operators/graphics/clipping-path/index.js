'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _PDFOperator = require('../../PDFOperator');

var _PDFOperator2 = _interopRequireDefault(_PDFOperator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  W: _extends({}, _PDFOperator2.default.createSingletonOp('W'), {
    /*
    Modify the current clipping path by intersecting it with the current path,
    using the nonzero winding number rule to determine which regions lie inside
    the clipping path.
    */
    asterisk: _PDFOperator2.default.createSingletonOp('W*')
  })
};