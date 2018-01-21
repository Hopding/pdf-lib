'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _pdfObjects = require('../pdf-objects');

var _pdfStructures = require('../pdf-structures');

var _PNGXObjectFactory = require('../pdf-structures/factories/PNGXObjectFactory');

var _PNGXObjectFactory2 = _interopRequireDefault(_PNGXObjectFactory);

var _JPEGXObjectFactory = require('../pdf-structures/factories/JPEGXObjectFactory');

var _JPEGXObjectFactory2 = _interopRequireDefault(_JPEGXObjectFactory);

var _PDFFontFactory = require('../pdf-structures/factories/PDFFontFactory');

var _PDFFontFactory2 = _interopRequireDefault(_PDFFontFactory);

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    var fontFactory = _PDFFontFactory2.default.for(name, fontData, flagOptions);
    return fontFactory.embedFontIn(_this2);
  };

  this.addPNG = function (imageData) {
    var pngFactory = _PNGXObjectFactory2.default.for(imageData);
    return pngFactory.embedImageIn(_this2);
  };

  this.addJPG = function (imageData) {
    var jpgFactory = _JPEGXObjectFactory2.default.for(imageData);
    return jpgFactory.embedImageIn(_this2);
  };
};

exports.default = PDFDocument;