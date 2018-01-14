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
Set the text matrix, Tm, and the text line matrix, T_lm:
             |a b 0|
T_m = T_lm = |c d 0|
             |e f 1|
The operands shall all be numbers, and the initial value for Tm and Tlm shall be
the identity matrix, [1 0 0 1 0 0]. Although the operands specify a matrix, they
shall be passed to Tm as six separate numbers, not as an array. The matrix
specified by the operands shall not be concatenated onto the current text
matrix, but shall replace it.
*/
var Tm = function (_PDFOperator) {
  _inherits(Tm, _PDFOperator);

  function Tm(a, b, c, d, e, f) {
    _classCallCheck(this, Tm);

    var _this = _possibleConstructorReturn(this, (Tm.__proto__ || Object.getPrototypeOf(Tm)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validateArr)([a, b, c, d, e, f], _validate.isNumber, 'Tm operator args "a b c d e f" must all be numbers.');
    _this.a = a;
    _this.b = b;
    _this.c = c;
    _this.d = d;
    _this.e = e;
    _this.f = f;
    return _this;
  }

  return Tm;
}(_PDFOperator3.default);

Tm.of = function (a, b, c, d, e, f) {
  return new Tm(a, b, c, d, e, f);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.a + ' ' + _this2.b + ' ' + _this2.c + ' ' + _this2.d + ' ' + _this2.e + ' ' + _this2.f + ' Tm\n';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = Tm;