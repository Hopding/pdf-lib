'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFOperator = require('../../PDFOperator');

var _PDFOperator2 = _interopRequireDefault(_PDFOperator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Close the current subpath by appending a straight line segment from the current
point to the starting point of the subpath. If the current subpath is already
closed, h shall do nothing. This operator terminates the current subpath.
Appending another segment to the current path shall begin a new subpath, even if
the new segment begins at the endpoint reached by the h operation.
*/
exports.default = _PDFOperator2.default.createSingletonOp('h');
/* eslint-disable new-cap */