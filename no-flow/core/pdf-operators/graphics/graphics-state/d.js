'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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
Set the line dash pattern in the graphics state
*/
var d = function (_PDFOperator) {
  _inherits(d, _PDFOperator);

  function d(dashArray, dashPhase) {
    _classCallCheck(this, d);

    var _this = _possibleConstructorReturn(this, (d.__proto__ || Object.getPrototypeOf(d)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validateArr)(dashArray, _validate.isNumber, 'd operator arg "dashArray" must be composed of numbers.');
    (0, _validate.validate)(dashPhase, _validate.isNumber, 'd operator arg "dashPhase" must be a number.');
    _this.dashArray = dashArray;
    _this.dashPhase = dashPhase;
    return _this;
  }

  return d;
}(_PDFOperator3.default);

d.of = function (dashArray, dashPhase) {
  return new d(dashArray, dashPhase);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _lodash2.default.isNil(_this2.dashArray[0]) && _lodash2.default.isNil(_this2.dashArray[1]) ? '[] ' + _this2.dashPhase + ' d\n' : '[' + String(_this2.dashArray[0]) + ' ' + String(_this2.dashArray[1]) + '] ' + (_this2.dashPhase + ' d\n');
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = d;