'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFHeader = function PDFHeader(major, minor) {
  _classCallCheck(this, PDFHeader);

  _initialiseProps.call(this);

  (0, _validate.validate)(major, _lodash2.default.isNumber, 'PDFHeader.major must be a Number');
  (0, _validate.validate)(minor, _lodash2.default.isNumber, 'PDFHeader.minor must be a Number');

  this.major = major;
  this.minor = minor;
};

PDFHeader.forVersion = function (major, minor) {
  return new PDFHeader(major, minor);
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.toString = function () {
    return '\n    %PDF-' + _this.major + '.' + _this.minor + '\n    %<COMMENT_WITH_BINARY_CHARACTERS>\n  ';
  };

  this.bytesSize = function () {
    return ('%PDF-' + _this.major + '.' + _this.minor + '\n').length + 6;
  };

  this.copyBytesInto = function (buffer) {
    var remaining = (0, _utils.addStringToBuffer)('%PDF-' + _this.major + '.' + _this.minor + '\n', buffer);
    remaining.set([(0, _utils.charCode)('%'), 130, 130, 130, 130, (0, _utils.charCode)('\n')], 0);
    return remaining.subarray(6);
  };
};

exports.default = PDFHeader;