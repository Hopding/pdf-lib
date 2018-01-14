'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _PDFDocument = require('./PDFDocument');

var _PDFDocument2 = _interopRequireDefault(_PDFDocument);

var _PDFXRefTableFactory = require('../pdf-structures/factories/PDFXRefTableFactory');

var _PDFXRefTableFactory2 = _interopRequireDefault(_PDFXRefTableFactory);

var _pdfStructures = require('../pdf-structures');

var _pdfObjects = require('../pdf-objects');

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFDocumentWriter = function PDFDocumentWriter() {
  _classCallCheck(this, PDFDocumentWriter);
};

PDFDocumentWriter.saveToBytes = function (pdfDoc) {
  var sortedIndex = PDFDocumentWriter.sortIndex(pdfDoc.index);

  var _ref = sortedIndex.find(function (_ref2) {
    var pdfObject = _ref2.pdfObject;
    return pdfObject.is(_pdfStructures.PDFCatalog);
  }) || (0, _utils.error)('Missing PDFCatalog'),
      catalogRef = _ref.reference;

  var _PDFXRefTableFactory$ = _PDFXRefTableFactory2.default.forIndirectObjects(pdfDoc.header, sortedIndex),
      _PDFXRefTableFactory$2 = _slicedToArray(_PDFXRefTableFactory$, 2),
      table = _PDFXRefTableFactory$2[0],
      tableOffset = _PDFXRefTableFactory$2[1];

  var trailer = _pdfStructures.PDFTrailer.from(tableOffset, _pdfObjects.PDFDictionary.from({
    // TODO: is "+1" necessary here?
    Size: _pdfObjects.PDFNumber.fromNumber(sortedIndex.length + 1),
    Root: catalogRef
  }));

  var bufferSize = tableOffset + table.bytesSize() + trailer.bytesSize();
  var buffer = new Uint8Array(bufferSize);

  var remaining = pdfDoc.header.copyBytesInto(buffer);
  sortedIndex.forEach(function (indirectObj) {
    remaining = indirectObj.copyBytesInto(remaining);
  });
  remaining = table.copyBytesInto(remaining);
  remaining = trailer.copyBytesInto(remaining);

  return buffer;
};

PDFDocumentWriter.sortIndex = function (index) {
  var indexArr = [];
  index.forEach(function (object, ref) {
    return indexArr.push(_pdfObjects.PDFIndirectObject.of(object).setReference(ref));
  });
  indexArr.sort(function (_ref3, _ref4) {
    var a = _ref3.reference;
    var b = _ref4.reference;
    return a.objectNumber - b.objectNumber;
  });
  return indexArr;
};

exports.default = PDFDocumentWriter;