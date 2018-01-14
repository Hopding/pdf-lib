'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('.');

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFRawStream = function (_PDFStream) {
  _inherits(PDFRawStream, _PDFStream);

  function PDFRawStream(dictionary, content) {
    _classCallCheck(this, PDFRawStream);

    var _this = _possibleConstructorReturn(this, (PDFRawStream.__proto__ || Object.getPrototypeOf(PDFRawStream)).call(this, dictionary));

    _initialiseProps.call(_this);

    (0, _validate.validate)(content, (0, _validate.isInstance)(Uint8Array), 'PDFRawStream.content must be a Uint8Array');
    _this.content = content;
    return _this;
  } // "\nendstream"

  return PDFRawStream;
}(_.PDFStream);

PDFRawStream.from = function (dictionary, content) {
  return new PDFRawStream(dictionary, content);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.bytesSize = function () {
    return _this2.dictionary.bytesSize() + 1 + // "\n"
    7 + // "stream\n"
    _this2.content.length + 10;
  };

  this.copyBytesInto = function (buffer) {
    _this2.validateDictionary();
    var remaining = _this2.dictionary.copyBytesInto(buffer);
    remaining = (0, _utils.addStringToBuffer)('\nstream\n', remaining);

    remaining.set(_this2.content, 0);
    remaining = remaining.subarray(_this2.content.length);

    remaining = (0, _utils.addStringToBuffer)('\nendstream', remaining);
    return remaining;
  };
};

exports.default = PDFRawStream;