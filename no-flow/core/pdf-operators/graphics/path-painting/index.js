'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _PDFOperator = require('../../PDFOperator');

var _PDFOperator2 = _interopRequireDefault(_PDFOperator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  /**
  Stroke the path.
  */
  S: _PDFOperator2.default.createSingletonOp('S'),
  /**
  Close and stroke the path. This operator shall have the same effect as the sequence h S.
  */
  s: _PDFOperator2.default.createSingletonOp('s'),
  f: _extends({}, _PDFOperator2.default.createSingletonOp('f'), {
    /**
    Fill the path, using the even-odd rule to determine the region to fill.
    */
    asterisk: _PDFOperator2.default.createSingletonOp('f*')
  }),
  /**
  Equivalent to f; included only for compatibility. Although PDF reader
  applications shall be able to accept this operator, PDF writer applications
  should use f instead.
  */
  F: _PDFOperator2.default.createSingletonOp('F'),
  B: _extends({}, _PDFOperator2.default.createSingletonOp('B'), {
    /**
    Fill and then stroke the path, using the even-odd rule to determine the
    region to fill. This operator shall produce the same result as B, except
    that the path is filled as if with f* instead of f.
    */
    asterisk: _PDFOperator2.default.createSingletonOp('B*')
  }),
  b: _extends({}, _PDFOperator2.default.createSingletonOp('b'), {
    /**
    Close, fill, and then stroke the path, using the even-odd rule to determine
    the region to fill. This operator shall have the same effect as
    the sequence h B*.
    */
    asterisk: _PDFOperator2.default.createSingletonOp('b*')
  }),
  /**
  End the path object without filling or stroking it. This operator shall be a
  path-painting no-op, used primarily for the side effect of changing the
  current clipping path
  */
  n: _PDFOperator2.default.createSingletonOp('n')
};