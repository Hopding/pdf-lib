'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sc = exports.SC = undefined;

var _PDFOperator3 = require('../../PDFOperator');

var _PDFOperator4 = _interopRequireDefault(_PDFOperator3);

var _utils = require('../../../../utils');

var _validate = require('../../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable new-cap */


/**
Set the colour to use for stroking operations in a device, CIE-based
(other than ICCBased), or Indexed colour space. The number of operands required
and their interpretation depends on the current stroking colour space:

For DeviceGray, CalGray, and Indexed colour spaces, one operand shall be
required (n = 1).

For DeviceRGB, CalRGB, and Lab colour spaces, three operands shall be
required (n = 3).

For DeviceCMYK, four operands shall be required (n = 4).
*/
var SC = exports.SC = function (_PDFOperator) {
  _inherits(SC, _PDFOperator);

  function SC() {
    _classCallCheck(this, SC);

    var _this = _possibleConstructorReturn(this, (SC.__proto__ || Object.getPrototypeOf(SC)).call(this));

    _initialiseProps.call(_this);

    for (var _len = arguments.length, c = Array(_len), _key = 0; _key < _len; _key++) {
      c[_key] = arguments[_key];
    }

    (0, _validate.validateArr)(c, _validate.isNumber, 'SC operator args "c" must be a number.');
    _this.c = c;
    return _this;
  }

  return SC;
}(_PDFOperator4.default);

/**
Same as SC but used for nonstroking operations.
*/


SC.of = function () {
  for (var _len3 = arguments.length, c = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    c[_key3] = arguments[_key3];
  }

  return new (Function.prototype.bind.apply(SC, [null].concat(_toConsumableArray(c))))();
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.toString = function () {
    return _this3.c.join(' ') + ' SC\n';
  };

  this.bytesSize = function () {
    return _this3.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this3.toString(), buffer);
  };
};

var sc = exports.sc = function (_PDFOperator2) {
  _inherits(sc, _PDFOperator2);

  function sc() {
    _classCallCheck(this, sc);

    var _this2 = _possibleConstructorReturn(this, (sc.__proto__ || Object.getPrototypeOf(sc)).call(this));

    _initialiseProps2.call(_this2);

    for (var _len2 = arguments.length, c = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      c[_key2] = arguments[_key2];
    }

    (0, _validate.validateArr)(c, _validate.isNumber, 'sc operator args "c" must be a number.');
    _this2.c = c;
    return _this2;
  }

  return sc;
}(_PDFOperator4.default);

sc.of = function () {
  for (var _len4 = arguments.length, c = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    c[_key4] = arguments[_key4];
  }

  return new (Function.prototype.bind.apply(sc, [null].concat(_toConsumableArray(c))))();
};

var _initialiseProps2 = function _initialiseProps2() {
  var _this4 = this;

  this.toString = function () {
    return _this4.c.join(' ') + ' sc\n';
  };

  this.bytesSize = function () {
    return _this4.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this4.toString(), buffer);
  };
};