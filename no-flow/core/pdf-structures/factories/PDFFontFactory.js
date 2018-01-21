'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fontkit = require('fontkit');

var _fontkit2 = _interopRequireDefault(_fontkit);

var _PDFDocument = require('../../pdf-document/PDFDocument');

var _PDFDocument2 = _interopRequireDefault(_PDFDocument);

var _pdfObjects = require('../../pdf-objects');

var _utils = require('../../../utils');

var _validate = require('../../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('buffer/'),
    Buffer = _require.Buffer;

var unsigned32Bit = '00000000000000000000000000000000';

/* eslint-disable prettier/prettier */
/*
Doing this by bit-twiddling a string, and then parsing it, gets around
JavaScript converting the results of bit-shifting ops back into 64-bit integers.
*/
var fontFlags = function fontFlags(options) {
  var flags = unsigned32Bit;
  if (options.FixedPitch) flags = (0, _utils.setCharAt)(flags, 32 - 1, '1');
  if (options.Serif) flags = (0, _utils.setCharAt)(flags, 32 - 2, '1');
  if (options.Symbolic) flags = (0, _utils.setCharAt)(flags, 32 - 3, '1');
  if (options.Script) flags = (0, _utils.setCharAt)(flags, 32 - 4, '1');
  if (options.Nonsymbolic) flags = (0, _utils.setCharAt)(flags, 32 - 6, '1');
  if (options.Italic) flags = (0, _utils.setCharAt)(flags, 32 - 7, '1');
  if (options.AllCap) flags = (0, _utils.setCharAt)(flags, 32 - 17, '1');
  if (options.SmallCap) flags = (0, _utils.setCharAt)(flags, 32 - 18, '1');
  if (options.ForceBold) flags = (0, _utils.setCharAt)(flags, 32 - 19, '1');
  return parseInt(flags, 2);
};
/* eslint-enable prettier/prettier */

/**
This Factory supports TrueType and OpenType fonts. Note that the apparent
hardcoding of values for OpenType fonts does not actually affect TrueType fonts.

A note of thanks to the developers of https://github.com/devongovett/pdfkit, as
this class borrows heavily from:
https://github.com/devongovett/pdfkit/blob/e71edab0dd4657b5a767804ba86c94c58d01fbca/lib/font/embedded.coffee
*/

var PDFFontFactory = function PDFFontFactory(name, fontData, flagOptions) {
  _classCallCheck(this, PDFFontFactory);

  _initialiseProps.call(this);

  (0, _validate.validate)(name, _lodash2.default.isString, '"name" must be a string');
  (0, _validate.validate)(fontData, (0, _validate.isInstance)(Uint8Array), '"fontData" must be a Uint8Array');
  (0, _validate.validate)(flagOptions, _lodash2.default.isObject, '"flagOptions" must be an Object');

  // This has to work in browser & Node JS environments. And, unfortunately,
  // the "fontkit" package makes use of Node "Buffer" objects, instead of
  // standard JS typed arrays. So, for now we'll just use the "buffer" package
  // to convert the "data" to a "Buffer" object that "fontkit" can work with.
  var dataBuffer = Buffer.from(fontData);

  this.fontName = name;
  this.fontData = fontData;
  this.font = _fontkit2.default.create(dataBuffer);
  this.scale = 1000 / this.font.unitsPerEm;

  var _font = this.font,
      italicAngle = _font.italicAngle,
      ascent = _font.ascent,
      descent = _font.descent,
      capHeight = _font.capHeight,
      xHeight = _font.xHeight,
      bbox = _font.bbox;


  this.fontDescriptor = _pdfObjects.PDFDictionary.from({
    Type: _pdfObjects.PDFName.from('FontDescriptor'),
    FontName: _pdfObjects.PDFName.from(name),
    Flags: _pdfObjects.PDFNumber.fromNumber(fontFlags(flagOptions)),
    FontBBox: _pdfObjects.PDFArray.fromArray([_pdfObjects.PDFNumber.fromNumber(bbox.minX * this.scale), _pdfObjects.PDFNumber.fromNumber(bbox.minY * this.scale), _pdfObjects.PDFNumber.fromNumber(bbox.maxX * this.scale), _pdfObjects.PDFNumber.fromNumber(bbox.maxY * this.scale)]),
    ItalicAngle: _pdfObjects.PDFNumber.fromNumber(italicAngle),
    Ascent: _pdfObjects.PDFNumber.fromNumber(ascent * this.scale),
    Descent: _pdfObjects.PDFNumber.fromNumber(descent * this.scale),
    CapHeight: _pdfObjects.PDFNumber.fromNumber((capHeight || ascent) * this.scale),
    XHeight: _pdfObjects.PDFNumber.fromNumber((xHeight || 0) * this.scale),
    // Not sure how to compute/find this, nor is anybody else really:
    // https://stackoverflow.com/questions/35485179/stemv-value-of-the-truetype-font
    StemV: _pdfObjects.PDFNumber.fromNumber(0)
  });
}

/*
TODO: This is hardcoded for "Simple Fonts" with non-modified encodings, need
to broaden support to other fonts.
*/
;

PDFFontFactory.for = function (name, fontData, flagOptions) {
  return new PDFFontFactory(name, fontData, flagOptions);
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.embedFontIn = function (pdfDoc) {
    var fontStreamDict = _pdfObjects.PDFDictionary.from({
      Subtype: _pdfObjects.PDFName.from('OpenType'),
      Length: _pdfObjects.PDFNumber.fromNumber(_this.fontData.length)
    });
    var fontStream = pdfDoc.register(_pdfObjects.PDFRawStream.from(fontStreamDict, _this.fontData));

    _this.fontDescriptor.set('FontFile3', fontStream);

    return pdfDoc.register(_pdfObjects.PDFDictionary.from({
      Type: _pdfObjects.PDFName.from('Font'),
      Subtype: _pdfObjects.PDFName.from('OpenType'),
      BaseFont: _pdfObjects.PDFName.from(_this.fontName),
      FirstChar: _pdfObjects.PDFNumber.fromNumber(0),
      LastChar: _pdfObjects.PDFNumber.fromNumber(255),
      Widths: _this.getWidths(),
      FontDescriptor: pdfDoc.register(_this.fontDescriptor)
    }));
  };

  this.getWidths = function () {
    return _pdfObjects.PDFArray.fromArray(_lodash2.default.range(0, 256).map(_this.getCodePointWidth).map(_pdfObjects.PDFNumber.fromNumber));
  };

  this.getCodePointWidth = function (code) {
    return _this.font.characterSet.includes(code) ? _this.font.glyphForCodePoint(code).advanceWidth * _this.scale : 0;
  };
};

exports.default = PDFFontFactory;