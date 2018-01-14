'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['\n    trailer\n    ', '\n    startxref\n    ', '\n    %%EOF\n  '], ['\n    trailer\n    ', '\n    startxref\n    ', '\n    %%EOF\n  ']);

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

var _PDFDictionary = require('../pdf-objects/PDFDictionary');

var _PDFDictionary2 = _interopRequireDefault(_PDFDictionary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFTrailer = function PDFTrailer(offset, dictionary) {
  _classCallCheck(this, PDFTrailer);

  _initialiseProps.call(this);

  (0, _validate.validate)(offset, _lodash2.default.isNumber, 'PDFTrailer offsets can only be Numbers');
  (0, _validate.validate)(dictionary, (0, _validate.isInstance)(_PDFDictionary2.default), 'PDFTrailer dictionaries can only be PDFDictionaries');

  this.offset = offset;
  this.dictionary = dictionary;
} // "%%EOF\n"

;

PDFTrailer.from = function (offset, dictionary) {
  return new PDFTrailer(offset, dictionary);
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.toString = function () {
    return (0, _dedent2.default)(_templateObject, _this.dictionary, _this.offset);
  };

  this.bytesSize = function () {
    return 8 + // "trailer\n"
    _this.dictionary.bytesSize() + 1 + // "\n"
    10 + // "startxref\n"
    String(_this.offset).length + 1 + // "\n"
    5;
  };

  this.copyBytesInto = function (buffer) {
    var remaining = (0, _utils.addStringToBuffer)('trailer\n', buffer);
    remaining = _this.dictionary.copyBytesInto(remaining);
    remaining = (0, _utils.addStringToBuffer)('\nstartxref\n' + _this.offset + '\n%%EOF\n', remaining);
    return remaining;
  };
};

exports.default = PDFTrailer;