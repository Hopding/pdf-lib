'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.k = exports.K = undefined;

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
Set the stroking colour space to DeviceCMYK (or the DefaultCMYK colour space and
set the colour to use for stroking operations. Each operand shall be a number
between 0.0 (zero concentration) and 1.0 (maximum concentration). The behaviour
of this operator is affected by the overprint mode.
*/
var K = exports.K = function (_PDFOperator) {
  _inherits(K, _PDFOperator);

  function K(c, m, y, k) {
    _classCallCheck(this, K);

    var _this = _possibleConstructorReturn(this, (K.__proto__ || Object.getPrototypeOf(K)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(c, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'K operator arg "c" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(m, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'K operator arg "y" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(y, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'K operator arg "m" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(k, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'K operator arg "k" must be a number between 0.0 and 1.0.');
    _this.c = c;
    _this.m = m;
    _this.y = y;
    _this.k = k;
    return _this;
  }

  return K;
}(_PDFOperator4.default);

/**
Same as K but used for nonstroking operations.
*/


K.of = function (c, m, y, k) {
  return new K(c, m, y, k);
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.toString = function () {
    return _this3.c + ' ' + _this3.y + ' ' + _this3.m + ' ' + _this3.k + ' K\n';
  };

  this.bytesSize = function () {
    return _this3.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this3.toString(), buffer);
  };
};

var k = exports.k = function (_PDFOperator2) {
  _inherits(k, _PDFOperator2);

  function k(c, m, y, key) {
    _classCallCheck(this, k);

    var _this2 = _possibleConstructorReturn(this, (k.__proto__ || Object.getPrototypeOf(k)).call(this));

    _initialiseProps2.call(_this2);

    (0, _validate.validate)(c, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'k operator arg "c" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(m, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'k operator arg "y" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(y, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'k operator arg "m" must be a number between 0.0 and 1.0.');
    (0, _validate.validate)(key, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 1.1)), 'k operator arg "key" must be a number between 0.0 and 1.0.');
    _this2.c = c;
    _this2.m = m;
    _this2.y = y;
    _this2.k = key;
    return _this2;
  }

  return k;
}(_PDFOperator4.default);

k.of = function (c, m, y, key) {
  return new k(c, m, y, key);
};

var _initialiseProps2 = function _initialiseProps2() {
  var _this4 = this;

  this.toString = function () {
    return _this4.c + ' ' + _this4.y + ' ' + _this4.m + ' ' + _this4.k + ' k\n';
  };

  this.bytesSize = function () {
    return _this4.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this4.toString(), buffer);
  };
};