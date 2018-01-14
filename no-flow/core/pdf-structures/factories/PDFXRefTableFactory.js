'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pdfObjects = require('../../pdf-objects');

var _ = require('..');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFXRefTableFactory = function PDFXRefTableFactory() {
  _classCallCheck(this, PDFXRefTableFactory);
};

PDFXRefTableFactory.forIndirectObjects = function (header, sortedIndex) {
  var table = new _.PDFXRef.Table();
  var subsection = new _.PDFXRef.Subsection().setFirstObjNum(0);
  subsection.addEntry(_.PDFXRef.Entry.create().setOffset(0).setGenerationNum(65535).setIsInUse(false));
  table.addSubsection(subsection);

  var offset = header.bytesSize();
  sortedIndex.forEach(function (indirectObj, idx) {
    // Add new subsection if needed...
    var reference = indirectObj.reference;

    var _ref = sortedIndex[idx - 1] || indirectObj,
        prevReference = _ref.reference;

    if (reference.objectNumber - prevReference.objectNumber > 1) {
      subsection = new _.PDFXRef.Subsection().setFirstObjNum(indirectObj.reference.objectNumber);
      table.addSubsection(subsection);
    }

    subsection.addEntry(_.PDFXRef.Entry.create().setOffset(offset).setGenerationNum(0).setIsInUse(true));
    offset += indirectObj.bytesSize();
  });

  return [table, offset];
};

exports.default = PDFXRefTableFactory;