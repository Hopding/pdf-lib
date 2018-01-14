'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.g = exports.G = undefined;

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
Set the stroking colour space to DeviceGray (or the DefaultGray colour space)
and set the gray level to use for stroking operations. gray shall be a number
between 0.0 (black) and 1.0 (white).
*/
var G = exports.G = function (_PDFOperator) {
  _inherits(G, _PDFOperator);

  function G(gray) {
    _classCallCheck(this, G);

    var _this = _possibleConstructorReturn(this, (G.__proto__ || Object.getPrototypeOf(G)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(gray, (0, _utils.and)(_validate.isNumber, (0, _validate.isInRange)(0.0, 0.1)), 'G operator arg "gray" must be a number.');
    _this.gray = gray;
    return _this;
  }

  return G;
}(_PDFOperator4.default);

/**
Same as G but used for nonstroking operations.
*/


G.of = function (gray) {
  return new G(gray);
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.toString = function () {
    return _this3.gray + ' G\n';
  };

  this.bytesSize = function () {
    return _this3.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this3.toString(), buffer);
  };
};

var g = exports.g = function (_PDFOperator2) {
  _inherits(g, _PDFOperator2);

  function g(gray) {
    _classCallCheck(this, g);

    var _this2 = _possibleConstructorReturn(this, (g.__proto__ || Object.getPrototypeOf(g)).call(this));

    _initialiseProps2.call(_this2);

    (0, _validate.validate)(gray, _validate.isNumber, 'g operator arg "gray" must be a number.');
    _this2.gray = gray;
    return _this2;
  }

  return g;
}(_PDFOperator4.default);

g.of = function (gray) {
  return new g(gray);
};

var _initialiseProps2 = function _initialiseProps2() {
  var _this4 = this;

  this.toString = function () {
    return _this4.gray + ' g\n';
  };

  this.bytesSize = function () {
    return _this4.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this4.toString(), buffer);
  };
};