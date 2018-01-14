'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pdfObjects = require('../pdf-objects');

var _validate = require('../../utils/validate');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PDFObjectStream = function (_PDFObject) {
  _inherits(PDFObjectStream, _PDFObject);

  function PDFObjectStream(dictionary, objects) {
    _classCallCheck(this, PDFObjectStream);

    var _this = _possibleConstructorReturn(this, (PDFObjectStream.__proto__ || Object.getPrototypeOf(PDFObjectStream)).call(this));

    (0, _validate.validate)(dictionary, (0, _validate.isInstance)(_pdfObjects.PDFDictionary), 'PDFObjectStream.dictionary must be a PDFDictionary');
    (0, _validate.validateArr)(objects, (0, _validate.isInstance)(_pdfObjects.PDFIndirectObject), 'PDFObjectStream.objects must be an array of PDFIndirectObject');
    _this.objects = objects;
    return _this;
  }

  return PDFObjectStream;
}(_pdfObjects.PDFObject);

PDFObjectStream.from = function (dictionary, objects) {
  return new PDFObjectStream(dictionary, objects);
};

exports.default = PDFObjectStream;