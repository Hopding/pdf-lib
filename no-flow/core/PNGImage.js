'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pngJs = require('png-js');

var _pngJs2 = _interopRequireDefault(_pngJs);

var _PDFDocument = require('./pdf-document/PDFDocument');

var _PDFDocument2 = _interopRequireDefault(_PDFDocument);

var _pdfObjects = require('./pdf-objects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* xxxxxxxxxxxxxxxxxxxx */
/* eslint-disable no-plusplus */


var PNGImage = function PNGImage(data) {
  var _this = this;

  _classCallCheck(this, PNGImage);

  this.embed = function (document) {
    return new Promise(function (resolve, reject) {
      _this.document = document;
      _this.xObjDict = _pdfObjects.PDFDictionary.from({
        Type: _pdfObjects.PDFName.from('XObject'),
        Subtype: _pdfObjects.PDFName.from('Image'),
        BitsPerComponent: _pdfObjects.PDFNumber.fromNumber(_this.image.bits),
        Width: _pdfObjects.PDFNumber.fromNumber(_this.width),
        Height: _pdfObjects.PDFNumber.fromNumber(_this.height)
      });

      if (!_this.image.hasAlphaChannel) {
        _this.xObjDict.set('Filter', _pdfObjects.PDFName.from('FlateDecode'));
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

      // TODO: HANDLE THE 'Filter' ENTRY IN THE XOBJECT DICT

      // if (this.image.transparency.grayscale)
      // if (this.image.transparency.rgb)
      if (_this.image.transparency.indexed) {
        _this.loadIndexedAlphaChannel(resolve);
      } else if (_this.image.hasAlphaChannel) {
        _this.splitAlphaChannel(resolve);
      } else {
        _this.finalize(resolve);
      }
    });
  };

  this.finalize = function (resolve) {
    if (_this.alphaChannel) {
      var smaskStream = _this.document.register(_pdfObjects.PDFRawStream.from(_pdfObjects.PDFDictionary.from({
        Type: _pdfObjects.PDFName.from('XObject'),
        Subtype: _pdfObjects.PDFName.from('Image'),
        Height: _pdfObjects.PDFNumber.fromNumber(_this.height),
        Width: _pdfObjects.PDFNumber.fromNumber(_this.width),
        BitsPerComponent: _pdfObjects.PDFNumber.fromNumber(8),
        // Filter: PDFName.from('FlateDecode'),
        ColorSpace: _pdfObjects.PDFName.from('DeviceGray'),
        Decode: _pdfObjects.PDFArray.fromArray([_pdfObjects.PDFNumber.fromNumber(0), _pdfObjects.PDFNumber.fromNumber(1)]),
        Length: _pdfObjects.PDFNumber.fromNumber(_this.alphaChannel.length)
      }), _this.alphaChannel));
      _this.xObjDict.set('SMask', smaskStream);
    }
    // if (this.imgData === this.image.imgData) {
    //   this.xObjDict.set('Filter', PDFName.from('FlateDecode'));
    // }
    _this.xObjDict.set('Length', _pdfObjects.PDFNumber.fromNumber(_this.imgData.length));
    var xObj = _this.document.register(_pdfObjects.PDFRawStream.from(_this.xObjDict, _this.imgData));
    resolve(xObj);
  };

  this.splitAlphaChannel = function (resolve) {
    _this.image.decodePixels(function (pixels) {
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
      _this.finalize(resolve);
    });
  };

  this.loadIndexedAlphaChannel = function (resolve) {
    var transparency = _this.image.transparency.indexed;
    _this.image.decodePixels(function (pixels) {
      _this.alphaChannel = new Uint8Array(_this.width * _this.height);
      // pixels.forEach((pixel, idx) => {
      // this.alphaChannel[idx] = transparency[pixel];
      // });
      // this.finalize();

      var i = 0;
      for (var j = 0; j < pixels.length; j++) {
        _this.alphaChannel[i++] = transparency[pixels[j]];
      }
      _this.finalize(resolve);
    });
  };

  this.image = new _pngJs2.default(data);
  this.width = this.image.width;
  this.height = this.image.height;
  this.imgData = this.image.imgData;
  this.xObjDict = null;
};

exports.default = PNGImage;