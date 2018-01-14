'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TJ = exports.Tj = undefined;

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
Show a text string.
*/
var Tj = exports.Tj = function (_PDFOperator) {
  _inherits(Tj, _PDFOperator);

  function Tj(string) {
    _classCallCheck(this, Tj);

    var _this = _possibleConstructorReturn(this, (Tj.__proto__ || Object.getPrototypeOf(Tj)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(string, (0, _utils.or)((0, _validate.isInstance)(_pdfObjects.PDFString), (0, _validate.isInstance)(_pdfObjects.PDFHexString), _lodash2.default.isString), 'Tj operator arg "string" must be one of: PDFString, PDFHexString, String');
    if (_lodash2.default.isString(string)) {
      _this.string = _pdfObjects.PDFString.fromString(string);
    } else _this.string = string;
    return _this;
  }

  return Tj;
}(_PDFOperator4.default);

/**
Show one or more text strings, allowing individual glyph positioning.
Each element of array shall be either a string or a number. If the element is a
string, this operator shall show the string. If it is a number, the operator
shall adjust the text position by that amount; that is, it shall translate the
text matrix, Tm. The number shall be expressed in thousandths of a unit of text
space. This amount shall be subtracted from the current horizontal or vertical
coordinate, depending on the writing mode. In the default coordinate system, a
positive adjustment has the effect of moving the next glyph painted either to
the left or down by the given amount. Figure 46 shows an example of the effect
of passing offsets to TJ.
*/


Tj.of = function (string) {
  return new Tj(string);
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.toString = function () {
    return _this3.string.toString() + ' Tj\n';
  };

  this.bytesSize = function () {
    return _this3.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this3.toString(), buffer);
  };
};

var TJ = exports.TJ = function (_PDFOperator2) {
  _inherits(TJ, _PDFOperator2);

  function TJ(array) {
    _classCallCheck(this, TJ);

    var _this2 = _possibleConstructorReturn(this, (TJ.__proto__ || Object.getPrototypeOf(TJ)).call(this));

    _initialiseProps2.call(_this2);

    (0, _validate.validateArr)(array, (0, _utils.or)((0, _validate.isInstance)(_pdfObjects.PDFString), (0, _validate.isInstance)(_pdfObjects.PDFHexString), (0, _validate.isInstance)(_pdfObjects.PDFNumber), _lodash2.default.isString, _validate.isNumber), 'TJ operator arg "array" elements must be one of: PDFString, PDFHexString, PDFNumber, String, Number');
    _this2.array = array.map(function (elem) {
      if (_lodash2.default.isString(elem)) return _pdfObjects.PDFString.fromString(elem);else if (_lodash2.default.isNumber(elem)) return _pdfObjects.PDFNumber.fromNumber(elem);
      return elem;
    });
    return _this2;
  } // "...<array> TJ\n"

  return TJ;
}(_PDFOperator4.default);

TJ.of = function (array) {
  return new TJ(array);
};

var _initialiseProps2 = function _initialiseProps2() {
  var _this4 = this;

  this.bytesSize = function () {
    return _this4.array.bytesSize() + 4;
  };

  this.copyBytesInto = function (buffer) {
    var remaining = _this4.array.copyBytesInto(buffer);
    remaining = (0, _utils.addStringToBuffer)(' TJ\n');
    return remaining;
  };
};