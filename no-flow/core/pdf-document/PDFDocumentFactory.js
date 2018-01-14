'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PDFDocument = require('./PDFDocument');

var _PDFDocument2 = _interopRequireDefault(_PDFDocument);

var _pdfObjects = require('../pdf-objects');

var _pdfStructures = require('../pdf-structures');

var _PDFParser = require('../pdf-parser/PDFParser');

var _PDFParser2 = _interopRequireDefault(_PDFParser);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFDocumentFactory = function PDFDocumentFactory() {
  _classCallCheck(this, PDFDocumentFactory);
};

PDFDocumentFactory.load = function (data) {
  var pdfParser = new _PDFParser2.default();

  console.time('ParsePDF');
  var parsedPdf = pdfParser.parse(data);
  console.timeEnd('ParsePDF');

  console.time('Normalize');
  var index = PDFDocumentFactory.normalize(parsedPdf);
  console.timeEnd('Normalize');

  return _PDFDocument2.default.fromIndex(index);
};

PDFDocumentFactory.normalize = function (_ref) {
  var dictionaries = _ref.dictionaries,
      arrays = _ref.arrays,
      body = _ref.original.body,
      updates = _ref.updates;

  var index = new Map();

  // Remove Object Streams and Cross Reference Streams, because we've already
  // parsed the Object Streams into PDFIndirectObjects, and will just write
  // them as such and use normal xref tables to reference them.
  var shouldKeep = function shouldKeep(object) {
    return !object.is(_pdfStructures.PDFObjectStream) && !(object.is(_pdfObjects.PDFStream) && object.dictionary.get('Type') === _pdfObjects.PDFName.from('XRef'));
  };

  // Initialize index with objects in the original body
  body.forEach(function (_ref2, ref) {
    var pdfObject = _ref2.pdfObject;

    if (shouldKeep(pdfObject)) index.set(ref, pdfObject);
  });

  // Update index with most recent version of each object
  // TODO: This could be omitted to recover a previous version of the document...
  updates.forEach(function (_ref3) {
    var updateBody = _ref3.body;

    updateBody.forEach(function (_ref4, ref) {
      var pdfObject = _ref4.pdfObject;

      if (shouldKeep(pdfObject)) index.set(ref, pdfObject);
    });
  });

  return index;
};

exports.default = PDFDocumentFactory;