'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DoubleQuote = exports.SingleQuote = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _PDFOperator3 = require('../../PDFOperator');

var _PDFOperator4 = _interopRequireDefault(_PDFOperator3);

var _pdfObjects = require('../../../pdf-objects');

var _utils = require('../../../../utils');

var _validate = require('../../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable new-cap */


/**
Move to the next line and show a text string.
This operator shall have the same effect as the code:
T*
string Tj
*/
var SingleQuote = exports.SingleQuote = function (_PDFOperator) {
  _inherits(SingleQuote, _PDFOperator);

  function SingleQuote(string) {
    _classCallCheck(this, SingleQuote);

    var _this = _possibleConstructorReturn(this, (SingleQuote.__proto__ || Object.getPrototypeOf(SingleQuote)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(string, (0, _utils.or)((0, _validate.isInstance)(_pdfObjects.PDFString), (0, _validate.isInstance)(_pdfObjects.PDFHexString), _lodash2.default.isString), '\' operator arg "string" must be one of: PDFString, PDFHexString, String');
    if (_lodash2.default.isString(string)) {
      _this.string = _pdfObjects.PDFString.fromString(string);
    } else _this.string = string;
    return _this;
  }

  return SingleQuote;
}(_PDFOperator4.default);

/**
Move to the next line and show a text string, using aw as the word spacing
and ac as the character spacing (setting the corresponding parameters in the
text state). aw and ac shall be numbers expressed in unscaled text space units.
This operator shall have the same effect as this code:
aw Tw
ac Tc
string '
*/


SingleQuote.of = function (string) {
  return new SingleQuote(string);
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.toString = function () {
    return _this3.string.toString() + ' \'\n';
  };

  this.bytesSize = function () {
    return _this3.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this3.toString(), buffer);
  };
};

var DoubleQuote = exports.DoubleQuote = function (_PDFOperator2) {
  _inherits(DoubleQuote, _PDFOperator2);

  function DoubleQuote(aw, ac, string) {
    _classCallCheck(this, DoubleQuote);

    var _this2 = _possibleConstructorReturn(this, (DoubleQuote.__proto__ || Object.getPrototypeOf(DoubleQuote)).call(this));

    _initialiseProps2.call(_this2);

    (0, _validate.validate)(aw, _validate.isNumber, '" operator arg "aw" must be a Number');
    (0, _validate.validate)(ac, _validate.isNumber, '" operator arg "ac" must be a Number');
    (0, _validate.validate)(string, (0, _utils.or)((0, _validate.isInstance)(_pdfObjects.PDFString), (0, _validate.isInstance)(_pdfObjects.PDFHexString), _lodash2.default.isString), '" operator arg "string" must be one of: PDFString, PDFHexString, String');
    if (_lodash2.default.isString(string)) {
      _this2.string = _pdfObjects.PDFString.fromString(string);
    } else _this2.string = string;
    return _this2;
  }

  return DoubleQuote;
}(_PDFOperator4.default);

DoubleQuote.of = function (aw, ac, string) {
  return new DoubleQuote(string);
};

var _initialiseProps2 = function _initialiseProps2() {
  var _this4 = this;

  this.toString = function () {
    return _this4.aw + ' ' + _this4.ac + ' ' + _this4.string.toString() + ' "\n';
  };

  this.bytesSize = function () {
    return _this4.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this4.toString(), buffer);
  };
};