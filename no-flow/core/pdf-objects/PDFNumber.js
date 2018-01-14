'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

var _PDFObject2 = require('./PDFObject');

var _PDFObject3 = _interopRequireDefault(_PDFObject2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFNumber = function (_PDFObject) {
  _inherits(PDFNumber, _PDFObject);

  function PDFNumber(number) {
    _classCallCheck(this, PDFNumber);

    var _this = _possibleConstructorReturn(this, (PDFNumber.__proto__ || Object.getPrototypeOf(PDFNumber)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(number, _lodash2.default.isNumber, 'Can only construct PDFNumbers from Numbers');
    _this.number = number;
    return _this;
  }

  return PDFNumber;
}(_PDFObject3.default);

PDFNumber.fromNumber = function (number) {
  return new PDFNumber(number);
};

PDFNumber.fromString = function (numberStr) {
  return new PDFNumber(Number(numberStr));
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return _this2.number.toString();
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = PDFNumber;