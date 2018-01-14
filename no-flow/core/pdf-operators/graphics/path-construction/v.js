'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFOperator2 = require('../../PDFOperator');

var _PDFOperator3 = _interopRequireDefault(_PDFOperator2);

var _utils = require('../../../../utils');

var _validate = require('../../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable new-cap */


/**
Append a cubic Bézier curve to the current path. The curve shall extend from the
current point to the point (x3, y3), using the current point and (x2, y2) as the
Bézier control points. The new current point shall be (x3, y3).
*/
var v = function (_PDFOperator) {
  _inherits(v, _PDFOperator);

  function v(x2, y2, x3, y3) {
    _classCallCheck(this, v);

    var _this = _possibleConstructorReturn(this, (v.__proto__ || Object.getPrototypeOf(v)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validateArr)([x2, y2, x3, y3], _validate.isNumber, 'c operator args "x2 y2 x3 y3" must all be numbers.');
    _this.x2 = x2;
    _this.y2 = y2;
    _this.x3 = x3;
    _this.y3 = y3;
    return _this;
  }

  return v;
}(_PDFOperator3.default);

v.of = function (x2, y2, x3, y3) {
  return new v(x2, y2, x3, y3);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.x2 + ' ' + _this2.y2 + ' ' + _this2.x3 + ' ' + _this2.y3 + ' c\n';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = v;