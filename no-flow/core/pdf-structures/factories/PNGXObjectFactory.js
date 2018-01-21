'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pngJs = require('png-js');

var _pngJs2 = _interopRequireDefault(_pngJs);

var _pako = require('pako');

var _pako2 = _interopRequireDefault(_pako);

var _PDFDocument = require('../../pdf-document/PDFDocument');

var _PDFDocument2 = _interopRequireDefault(_PDFDocument);

var _pdfObjects = require('../../pdf-objects');

var _validate = require('../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('buffer/'),
    Buffer = _require.Buffer;

/**
A note of thanks to the developers of https://github.com/devongovett/pdfkit, as
this class borrows heavily from:
https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee
*/


var PNGXObjectFactory = function PNGXObjectFactory(data) {
  _classCallCheck(this, PNGXObjectFactory);

  _initialiseProps.call(this);

  (0, _validate.validate)(data, (0, _validate.isInstance)(Uint8Array), '"data" must be an instance of Uint8Array');

  // This has to work in browser & Node JS environments. And, unfortunately,
  // the "png.js" package makes use of Node "Buffer" objects, instead of
  // standard JS typed arrays. So, for now we'll just use the "buffer" package
  // to convert the "data" to a "Buffer" object that "png.js" can work with.
  var dataBuffer = Buffer.from(data);

  this.image = new _pngJs2.default(dataBuffer);
  this.width = this.image.width;
  this.height = this.image.height;
  this.imgData = this.image.imgData;
};

PNGXObjectFactory.for = function (data) {
  return new PNGXObjectFactory(data);
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.embedImageIn = function (document) {
    _this.document = document;
    _this.xObjDict = _pdfObjects.PDFDictionary.from({
      Type: _pdfObjects.PDFName.from('XObject'),
      Subtype: _pdfObjects.PDFName.from('Image'),
      BitsPerComponent: _pdfObjects.PDFNumber.fromNumber(_this.image.bits),
      Width: _pdfObjects.PDFNumber.fromNumber(_this.width),
      Height: _pdfObjects.PDFNumber.fromNumber(_this.height),
      Filter: _pdfObjects.PDFName.from('FlateDecode')
    });

    if (!_this.image.hasAlphaChannel) {
      var params = _pdfObjects.PDFDictionary.from({
        Predictor: _pdfObjects.PDFNumber.fromNumber(15),
        Colors: _pdfObjects.PDFNumber.fromNumber(_this.image.colors),
        BitsPerComponent: _pdfObjects.PDFNumber.fromNumber(_this.image.bits),
        Columns: _pdfObjects.PDFNumber.fromNumber(_this.width)
      });
      _this.xObjDict.set('DecodeParms', params);
    }

    if (_this.image.palette.length === 0) {
      _this.xObjDict.set('ColorSpace', _pdfObjects.PDFName.from(_this.image.colorSpace));
    } else {
      var paletteStream = document.register(_pdfObjects.PDFRawStream.from(_pdfObjects.PDFDictionary.from({
        Length: _pdfObjects.PDFNumber.fromNumber(_this.image.palette.length)
      }), new Uint8Array(_this.image.palette)));
      _this.xObjDict.set('ColorSpace', _pdfObjects.PDFArray.fromArray([_pdfObjects.PDFName.from('Indexed'), _pdfObjects.PDFName.from('DeviceRGB'), _pdfObjects.PDFNumber.fromNumber(_this.image.palette.length / 3 - 1), paletteStream]));
    }

    // TODO: Handle the following two transparency types. They don't seem to be
    // fully handled in https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/image/png.coffee
    // if (this.image.transparency.grayscale)
    // if (this.image.transparency.rgb)

    /* eslint-disable prettier/prettier */
    return _this.image.transparency.indexed ? _this.loadIndexedAlphaChannel() : _this.image.hasAlphaChannel ? _this.splitAlphaChannel() : _this.finalize();
    /* eslint-enable prettier/prettier */
  };

  this.finalize = function () {
    if (_this.alphaChannel) {
      var alphaStreamDict = _pdfObjects.PDFDictionary.from({
        Type: _pdfObjects.PDFName.from('XObject'),
        Subtype: _pdfObjects.PDFName.from('Image'),
        Height: _pdfObjects.PDFNumber.fromNumber(_this.height),
        Width: _pdfObjects.PDFNumber.fromNumber(_this.width),
        BitsPerComponent: _pdfObjects.PDFNumber.fromNumber(8),
        Filter: _pdfObjects.PDFName.from('FlateDecode'),
        ColorSpace: _pdfObjects.PDFName.from('DeviceGray'),
        Decode: _pdfObjects.PDFArray.fromArray([_pdfObjects.PDFNumber.fromNumber(0), _pdfObjects.PDFNumber.fromNumber(1)]),
        Length: _pdfObjects.PDFNumber.fromNumber(_this.alphaChannel.length)
      });
      var smaskStream = _this.document.register(_pdfObjects.PDFRawStream.from(alphaStreamDict, _pako2.default.deflate(_this.alphaChannel)));
      _this.xObjDict.set('SMask', smaskStream);
    }

    _this.xObjDict.set('Length', _pdfObjects.PDFNumber.fromNumber(_this.imgData.length));
    var xObj = _this.document.register(_pdfObjects.PDFRawStream.from(_this.xObjDict, _this.imgData));
    return xObj;
  };

  this.splitAlphaChannel = function () {
    var pixels = _this.image.decodePixelsSync();
    var colorByteSize = _this.image.colors * _this.image.bits / 8;
    var pixelCount = _this.image.width * _this.image.height;
    _this.imgData = new Uint8Array(pixelCount * colorByteSize);
    _this.alphaChannel = new Uint8Array(pixelCount);
    var i = 0;
    var p = 0;
    var a = 0;
    while (i < pixels.length) {
      _this.imgData[p++] = pixels[i++];
      _this.imgData[p++] = pixels[i++];
      _this.imgData[p++] = pixels[i++];
      _this.alphaChannel[a++] = pixels[i++];
    }
    _this.imgData = _pako2.default.deflate(_this.imgData);
    return _this.finalize();
  };

  this.loadIndexedAlphaChannel = function () {
    var transparency = _this.image.transparency.indexed;
    var pixels = _this.image.decodePixelsSync();
    _this.alphaChannel = new Uint8Array(_this.width * _this.height);
    pixels.forEach(function (pixel, idx) {
      _this.alphaChannel[idx] = transparency[pixel];
    });
    return _this.finalize();
  };
};

exports.default = PNGXObjectFactory;