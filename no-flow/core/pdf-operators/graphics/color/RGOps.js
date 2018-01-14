'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rg = exports.RG = undefined;

var _PDFOperator3 = require('../../PDFOperator');

var _PDFOperator4 = _interopRequireDefault(_PDFOperator3);

var _utils = require('../../../../utils');

var _validate = require('../../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable new-cap */


/**
Set the stroking colour space to DeviceRGB (or the DefaultRGB colour space) and
set the colour to use for stroking operations. Each operand shall be a number
between 0.0 (minimum intensity) and 1.0 (maximum intensity).
*/
var RG = exports.RG = function (_PDFOperator) {
  _inherits(RG, _PDFOperator);

  function RG(r, g, b) {
    _classCallCheck(this, RG);

    var _this = _possibleConstructorReturn(this, (RG.__proto__ || Object.getPrototypeOf(RG)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(r, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'RG operator arg "r" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(g, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'RG operator arg "g" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(b, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'RG operator arg "b" must be a number between 0.0 and 1.0.');
    _this.r = r;
    _this.g = g;
    _this.b = b;
    return _this;
  }

  return RG;
}(_PDFOperator4.default);

/**
Same as RG but used for nonstroking operations.
*/


RG.of = function (r, g, b) {
  return new RG(r, g, b);
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.toString = function () {
    return _this3.r + ' ' + _this3.g + ' ' + _this3.b + ' RG\n';
  };

  this.bytesSize = function () {
    return _this3.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this3.toString(), buffer);
  };
};

var rg = exports.rg = function (_PDFOperator2) {
  _inherits(rg, _PDFOperator2);

  function rg(r, g, b) {
    _classCallCheck(this, rg);

    var _this2 = _possibleConstructorReturn(this, (rg.__proto__ || Object.getPrototypeOf(rg)).call(this));

    _initialiseProps2.call(_this2);

    (0, _validate.validate)(r, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'rg operator arg "r" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(g, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'rg operator arg "g" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(b, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'rg operator arg "b" must be a number between 0.0 and 1.0.');
    _this2.r = r;
    _this2.g = g;
    _this2.b = b;
    return _this2;
  }

  return rg;
}(_PDFOperator4.default);

rg.of = function (r, g, b) {
  return new rg(r, g, b);
};

var _initialiseProps2 = function _initialiseProps2() {
  var _this4 = this;

  this.toString = function () {
    return _this4.r + ' ' + _this4.g + ' ' + _this4.b + ' rg\n';
  };

  this.bytesSize = function () {
    return _this4.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this4.toString(), buffer);
  };
};