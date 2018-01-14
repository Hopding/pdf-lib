'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Subsection = exports.Entry = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

var _utils = require('../../utils');

var _validate = require('../../utils/validate');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entry = exports.Entry = function Entry() {
  var _this = this;

  _classCallCheck(this, Entry);

  this.offset = null;
  this.generationNum = null;
  this.isInUse = null;

  this.setOffset = function (offset) {
    (0, _validate.validate)(offset, _lodash2.default.isNumber, 'offset must be a number');
    _this.offset = offset;
    return _this;
  };

  this.setGenerationNum = function (generationNum) {
    (0, _validate.validate)(generationNum, _lodash2.default.isNumber, 'generationNum must be a number');
    _this.generationNum = generationNum;
    return _this;
  };

  this.setIsInUse = function (isInUse) {
    (0, _validate.validate)(isInUse, _lodash2.default.isBoolean, 'isInUse must be a boolean');
    _this.isInUse = isInUse;
    return _this;
  };

  this.toString = function () {
    return _lodash2.default.padStart(String(_this.offset), 10, '0') + ' ' + (_lodash2.default.padStart(String(_this.generationNum), 5, '0') + ' ') + ((_this.isInUse ? 'n' : 'f') + ' \n');
  };

  this.bytesSize = function () {
    return _this.toString().length;
  };
};

Entry.create = function () {
  return new Entry();
};

var Subsection = exports.Subsection = function Subsection() {
  var _this2 = this;

  _classCallCheck(this, Subsection);

  this.entries = [];

  this.addEntry = function (entry) {
    _this2.entries.push(entry);
    return _this2;
  };

  this.setFirstObjNum = function (firstObjNum) {
    (0, _validate.validate)(firstObjNum, _lodash2.default.isNumber, 'firstObjNum must be a number');
    _this2.firstObjNum = firstObjNum;
    return _this2;
  };

  this.toString = function () {
    return (0, _dedent2.default)('\n    ' + _this2.firstObjNum + ' ' + _this2.entries.length + '\n    ' + _this2.entries.map(String).join('') + '\n  ');
  };

  this.bytesSize = function () {
    return (_this2.firstObjNum + ' ' + _this2.entries.length + '\n').length + (0, _lodash2.default)(_this2.entries).map(function (e) {
      return e.bytesSize();
    }).sum();
  };
};

Subsection.from = function (entries) {
  (0, _validate.validateArr)(entries, (0, _validate.isInstance)(Entry), 'PDFXRef.Subsection.entries must be an array of PDFXRef.Entry');

  var subsection = new Subsection();
  subsection.entries = entries;
  return subsection;
};

var Table = function Table() {
  var _this3 = this;

  _classCallCheck(this, Table);

  this.subsections = [];

  this.addSubsection = function (subsection) {
    _this3.subsections.push(subsection);
    return _this3;
  };

  this.toString = function () {
    return (0, _dedent2.default)('\n    xref\n    ' + _this3.subsections.map(String).join('\n') + '\n  ') + '\n';
  };

  this.bytesSize = function () {
    return 5 + // "xref\n"
    (0, _lodash2.default)(_this3.subsections).map(function (ss) {
      return ss.bytesSize() + 1;
    }).sum();
  };

  this.copyBytesInto = function (buffer) {
    var remaining = (0, _utils.addStringToBuffer)('xref\n', buffer);
    _this3.subsections.map(String).forEach(function (subsectionStr) {
      remaining = (0, _utils.addStringToBuffer)(subsectionStr + '\n', remaining);
    });
    return remaining;
  };
};

Table.from = function (subsections) {
  (0, _validate.validateArr)(subsections, (0, _validate.isInstance)(Subsection), 'subsections must be an array of PDFXRef.Subsection');

  var table = new Table();
  table.subsections = subsections;
  return table;
};

var PDFXRef = {
  Table: Table,
  Subsection: Subsection,
  Entry: Entry
};

exports.default = PDFXRef;