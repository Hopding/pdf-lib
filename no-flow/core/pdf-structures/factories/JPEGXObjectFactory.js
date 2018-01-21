'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFDocument = require('../../pdf-document/PDFDocument');

var _PDFDocument2 = _interopRequireDefault(_PDFDocument);

var _pdfObjects = require('../../pdf-objects');

var _utils = require('../../../utils');

var _validate = require('../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MARKERS = [0xffc0, 0xffc1, 0xffc2, 0xffc3, 0xffc5, 0xffc6, 0xffc7, 0xffc8, 0xffc9, 0xffca, 0xffcb, 0xffcc, 0xffcd, 0xffce, 0xffcf];

/**
A note of thanks to the developers of https://github.com/devongovett/pdfkit, as
this class borrows heavily from:
https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/jpeg.coffee
*/

var JPEGXObjectFactory = function JPEGXObjectFactory(data) {
  _classCallCheck(this, JPEGXObjectFactory);

  _initialiseProps.call(this);

  (0, _validate.validate)(data, (0, _validate.isInstance)(Uint8Array), '"data" must be a Uint8Array');

  this.imgData = data;
  var dataView = new DataView(data.buffer);
  if (dataView.getUint16(0) !== 0xffd8) (0, _utils.error)('SOI not found in JPEG');

  var pos = 2;
  var marker = void 0;
  while (pos < dataView.byteLength) {
    marker = dataView.getUint16(pos);
    pos += 2;
    if (MARKERS.includes(marker)) break;
    pos += dataView.getUint16(pos);
  }

  if (!MARKERS.includes(marker)) (0, _utils.error)('Invalid JPEG');
  pos += 2;

  this.bits = dataView.getUint8(pos++);
  this.height = dataView.getUint16(pos);
  pos += 2;

  this.width = dataView.getUint16(pos);
  pos += 2;

  var channelMap = {
    '1': 'DeviceGray',
    '3': 'DeviceRGB',
    '4': 'DeviceCYMK'
  };
  var channels = dataView.getUint8(pos++);
  this.colorSpace = channelMap[channels] || (0, _utils.error)('Unknown JPEG channel.');
};

JPEGXObjectFactory.for = function (data) {
  return new JPEGXObjectFactory(data);
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.embedImageIn = function (document) {
    var xObjDict = _pdfObjects.PDFDictionary.from({
      Type: _pdfObjects.PDFName.from('XObject'),
      Subtype: _pdfObjects.PDFName.from('Image'),
      BitsPerComponent: _pdfObjects.PDFNumber.fromNumber(_this.bits),
      Width: _pdfObjects.PDFNumber.fromNumber(_this.width),
      Height: _pdfObjects.PDFNumber.fromNumber(_this.height),
      ColorSpace: _pdfObjects.PDFName.from(_this.colorSpace),
      Filter: _pdfObjects.PDFName.from('DCTDecode')
    });

    // Add extra decode params for CMYK images. By swapping the
    // min and max values from the default, we invert the colors. See
    // section 4.8.4 of the spec.
    if (_this.colorSpace === 'DeviceCYMK') {
      xObjDict.set('Decode', _pdfObjects.PDFArray.fromArray([_pdfObjects.PDFNumber.fromNumber(1.0), _pdfObjects.PDFNumber.fromNumber(0.0), _pdfObjects.PDFNumber.fromNumber(1.0), _pdfObjects.PDFNumber.fromNumber(0.0), _pdfObjects.PDFNumber.fromNumber(1.0), _pdfObjects.PDFNumber.fromNumber(0.0), _pdfObjects.PDFNumber.fromNumber(1.0), _pdfObjects.PDFNumber.fromNumber(0.0)]));
    }

    xObjDict.set('Length', _pdfObjects.PDFNumber.fromNumber(_this.imgData.length));
    var xObj = document.register(_pdfObjects.PDFRawStream.from(xObjDict, _this.imgData));
    return xObj;
  };
};

exports.default = JPEGXObjectFactory;