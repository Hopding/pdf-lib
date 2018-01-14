'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fontkit = require('fontkit');

var _fontkit2 = _interopRequireDefault(_fontkit);

var _pngJs = require('png-js');

var _pngJs2 = _interopRequireDefault(_pngJs);

var _PNGImage = require('../PNGImage');

var _PNGImage2 = _interopRequireDefault(_PNGImage);

var _pdfObjects = require('../pdf-objects');

var _pdfStructures = require('../pdf-structures');

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var unsigned32Bit = '00000000000000000000000000000000';

/* eslint-disable prettier/prettier */
// Doing this by bit-twiddling a string and then parsing gets around JavaScript
// converting the results of bit-shifting ops back into 64-bit integers.
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

var PDFDocument = function PDFDocument(index) {
  var _this = this;

  _classCallCheck(this, PDFDocument);

  _initialiseProps.call(this);

  (0, _validate.validate)(index, (0, _validate.isInstance)(Map), 'index must be a Map<PDFIndirectReference, PDFObject>');
  index.forEach(function (obj, ref) {
    if (obj.is(_pdfStructures.PDFCatalog)) _this.catalog = obj;
    if (ref.objectNumber > _this.maxObjNum) _this.maxObjNum = ref.objectNumber;
  });
  this.index = index;
}

// TODO: Clean up unused objects when possible after removing page from tree
// TODO: Make sure "idx" is within required range


// TODO: Make sure "idx" is within required range


// TODO: validate args...


// TODO: This should be moved to some XObject class, probably
// TODO: Test this in the browser - might not work the same as in Node...
;

PDFDocument.fromIndex = function (index) {
  return new PDFDocument(index);
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.header = _pdfStructures.PDFHeader.forVersion(1, 7);
  this.maxObjNum = 0;

  this.lookup = function (ref) {
    return ref.is(_pdfObjects.PDFIndirectReference) ? _this2.index.get(ref) : ref;
  };

  this.register = function (object) {
    (0, _validate.validate)(object, (0, _validate.isInstance)(_pdfObjects.PDFObject), 'object must be a PDFObject');
    _this2.maxObjNum += 1;
    var ref = _pdfObjects.PDFIndirectReference.forNumbers(_this2.maxObjNum, 0);
    _this2.index.set(ref, object);
    return ref;
  };

  this.getPages = function () {
    var pageTree = _this2.catalog.getPageTree(_this2.lookup);
    var pages = [];
    pageTree.traverse(_this2.lookup, function (kid) {
      if (kid.is(_pdfStructures.PDFPage)) pages.push(kid);
    });
    return Object.freeze(pages);
  };

  this.addPage = function (page) {
    (0, _validate.validate)(page, (0, _validate.isInstance)(_pdfStructures.PDFPage), 'page must be a PDFPage');
    var pageTree = _this2.catalog.getPageTree(_this2.lookup);

    var lastPageTree = pageTree;
    var lastPageTreeRef = _this2.catalog.get('Pages');
    pageTree.traverseRight(_this2.lookup, function (kid, ref) {
      if (kid.is(_pdfStructures.PDFPageTree)) {
        lastPageTree = kid;
        lastPageTreeRef = ref;
      }
    });

    page.set('Parent', lastPageTreeRef);
    lastPageTree.addPage(_this2.lookup, _this2.register(page));
    return _this2;
  };

  this.removePage = function (idx) {
    (0, _validate.validate)(idx, _lodash2.default.isNumber, 'idx must be a number');
    var pageTreeRef = _this2.catalog.get('Pages');
    var pageTree = _this2.catalog.getPageTree(_this2.lookup);

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    var treeRef = pageTreeRef;
    var pageCount = 0;
    var kidNum = 0;
    pageTree.traverse(_this2.lookup, function (kid, ref) {
      if (pageCount !== idx) {
        if (kid.is(_pdfStructures.PDFPageTree)) kidNum = 0;
        if (kid.is(_pdfStructures.PDFPage)) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === idx) treeRef = kid.get('Parent');
        }
      }
    });

    var tree = _this2.lookup(treeRef);
    tree.removePage(_this2.lookup, kidNum);
    return _this2;
  };

  this.insertPage = function (idx, page) {
    (0, _validate.validate)(idx, _lodash2.default.isNumber, 'idx must be a number');
    (0, _validate.validate)(page, (0, _validate.isInstance)(_pdfStructures.PDFPage), 'page must be a PDFPage');
    var pageTreeRef = _this2.catalog.get('Pages');
    var pageTree = _this2.catalog.getPageTree(_this2.lookup);

    // TODO: Use a "stop" callback to avoid unneccesarily traversing whole page tree...
    var treeRef = pageTreeRef;
    var pageCount = 0;
    var kidNum = 0;
    pageTree.traverse(_this2.lookup, function (kid, ref) {
      if (pageCount !== idx) {
        if (kid.is(_pdfStructures.PDFPageTree)) kidNum = 0;
        if (kid.is(_pdfStructures.PDFPage)) {
          pageCount += 1;
          kidNum += 1;
          if (pageCount === idx) treeRef = kid.get('Parent');
        }
      }
    });

    page.set('Parent', treeRef);
    var tree = _this2.lookup(treeRef);
    tree.insertPage(_this2.lookup, kidNum, _this2.register(page));
    return _this2;
  };

  this.embedFont = function (name, fontData, flagOptions) {
    // TODO: Use diff header and stuff if is TrueType, not OpenType
    var fontStream = _this2.register(_pdfObjects.PDFRawStream.from(_pdfObjects.PDFDictionary.from({
      Subtype: _pdfObjects.PDFName.from('OpenType'),
      Length: _pdfObjects.PDFNumber.fromNumber(fontData.length)
      // TODO: Length1 might be required for TrueType fonts?
    }), fontData));

    var font = _fontkit2.default.create(fontData);
    var fontDescriptor = _this2.register(_pdfObjects.PDFDictionary.from({
      Type: _pdfObjects.PDFName.from('FontDescriptor'),
      FontName: _pdfObjects.PDFName.from(name),
      Flags: _pdfObjects.PDFNumber.fromNumber(fontFlags(flagOptions)),
      FontBBox: _pdfObjects.PDFArray.fromArray([_pdfObjects.PDFNumber.fromNumber(font.bbox.minX), _pdfObjects.PDFNumber.fromNumber(font.bbox.minY), _pdfObjects.PDFNumber.fromNumber(font.bbox.maxX), _pdfObjects.PDFNumber.fromNumber(font.bbox.maxY)]),
      ItalicAngle: _pdfObjects.PDFNumber.fromNumber(font.italicAngle),
      Ascent: _pdfObjects.PDFNumber.fromNumber(font.ascent),
      Descent: _pdfObjects.PDFNumber.fromNumber(font.descent),
      CapHeight: _pdfObjects.PDFNumber.fromNumber(font.capHeight),
      XHeight: _pdfObjects.PDFNumber.fromNumber(font.xHeight),
      // Not sure how to compute/find this, nor is anybody else really:
      // https://stackoverflow.com/questions/35485179/stemv-value-of-the-truetype-font
      StemV: _pdfObjects.PDFNumber.fromNumber(0),
      FontFile3: fontStream // Use different key for TrueType
    }));

    return _this2.register(_pdfObjects.PDFDictionary.from({
      Type: _pdfObjects.PDFName.from('Font'),
      // Handle the case of this actually being TrueType
      Subtype: _pdfObjects.PDFName.from('OpenType'),
      BaseFont: _pdfObjects.PDFName.from(name),
      FontDescriptor: fontDescriptor
    }));
  };

  this.addImage = function (imageData) {
    var pngImg = new _PNGImage2.default(imageData);
    return pngImg.embed(_this2);
  };
};

exports.default = PDFDocument;