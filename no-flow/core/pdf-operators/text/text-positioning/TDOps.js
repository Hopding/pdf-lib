'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TD = exports.Td = undefined;

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
Move to the start of the next line, offset from the start of the current line by
(tx, ty). tx and ty shall denote numbers expressed in unscaled text space units.
More precisely, this operator shall perform these assignments:
             |1   0   0|
T_m = T_lm = |0   1   0| × T_lm
             |t_x t_y 1|
*/
var Td = exports.Td = function (_PDFOperator) {
  _inherits(Td, _PDFOperator);

  function Td(tx, ty) {
    _classCallCheck(this, Td);

    var _this = _possibleConstructorReturn(this, (Td.__proto__ || Object.getPrototypeOf(Td)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(tx, _validate.isNumber, 'Td operator arg "tx" must be a number.');
    (0, _validate.validate)(ty, _validate.isNumber, 'Td operator arg "ty" must be a number.');
    _this.tx = tx;
    _this.ty = ty;
    return _this;
  }

  return Td;
}(_PDFOperator4.default);

/**
Move to the start of the next line, offset from the start of the current line by
(tx, ty). As a side effect, this operator shall set the leading parameter in the
text state. This operator shall have the same effect as this code:
−ty TL
tx ty Td
*/


Td.of = function (tx, ty) {
  return new Td(tx, ty);
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.toString = function () {
    return _this3.tx + ' ' + _this3.ty + ' Td\n';
  };

  this.bytesSize = function () {
    return _this3.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this3.toString(), buffer);
  };
};

var TD = exports.TD = function (_PDFOperator2) {
  _inherits(TD, _PDFOperator2);

  function TD(tx, ty) {
    _classCallCheck(this, TD);

    var _this2 = _possibleConstructorReturn(this, (TD.__proto__ || Object.getPrototypeOf(TD)).call(this));

    _initialiseProps2.call(_this2);

    (0, _validate.validate)(tx, _validate.isNumber, 'Td operator arg "tx" must be a number.');
    (0, _validate.validate)(ty, _validate.isNumber, 'Td operator arg "ty" must be a number.');
    _this2.tx = tx;
    _this2.ty = ty;
    return _this2;
  }

  return TD;
}(_PDFOperator4.default);

TD.of = function (tx, ty) {
  return new TD(tx, ty);
};

var _initialiseProps2 = function _initialiseProps2() {
  var _this4 = this;

  this.toString = function () {
    return _this4.tx + ' ' + _this4.ty + ' TD\n';
  };

  this.bytesSize = function () {
    return _this4.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this4.toString(), buffer);
  };
};