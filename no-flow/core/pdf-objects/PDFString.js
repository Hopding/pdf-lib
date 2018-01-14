'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _PDFObject2 = require('./PDFObject');

var _PDFObject3 = _interopRequireDefault(_PDFObject2);

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFString = function (_PDFObject) {
  _inherits(PDFString, _PDFObject);

  function PDFString(string) {
    _classCallCheck(this, PDFString);

    var _this = _possibleConstructorReturn(this, (PDFString.__proto__ || Object.getPrototypeOf(PDFString)).call(this));

    _initialiseProps.call(_this);

    (0, _validate.validate)(string, _lodash2.default.isString, 'Can only construct PDFStrings from Strings');
    _this.string = string;
    return _this;
  }

  return PDFString;
}(_PDFObject3.default);

PDFString.fromString = function (string) {
  return new PDFString(string);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.toString = function () {
    return '(' + _this2.string + ')';
  };

  this.bytesSize = function () {
    return _this2.toString().length;
  };

  this.copyBytesInto = function (buffer) {
    return (0, _utils.addStringToBuffer)(_this2.toString(), buffer);
  };
};

exports.default = PDFString;