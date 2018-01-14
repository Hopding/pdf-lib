'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _pdfObjects = require('../pdf-objects');

var _pdfStructures = require('../pdf-structures');

var _parseDocument = require('./parseDocument');

var _parseDocument2 = _interopRequireDefault(_parseDocument);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PDFParser = function PDFParser() {
  var _this = this;

  _classCallCheck(this, PDFParser);

  this.activelyParsing = false;
  this.arrays = [];
  this.dictionaries = [];
  this.catalog = null;
  this.header = null;
  this.body = new Map();
  this.xRefTable = null;
  this.trailer = null;
  this.linearization = null;
  this.updates = [];

  this.handleArray = function (array) {
    _this.arrays.push(array);
  };

  this.handleDict = function (dict) {
    _this.dictionaries.push(dict);
  };

  this.handleObjectStream = function (_ref) {
    var objects = _ref.objects;

    objects.forEach(function (indirectObj) {
      if (_this.updates.length > 0) {
        _lodash2.default.last(_this.updates).body.set(indirectObj.getReference(), indirectObj);
      } else {
        _this.body.set(indirectObj.getReference(), indirectObj);
      }
    });
  };

  this.handleIndirectObj = function (indirectObj) {
    if (_this.updates.length > 0) {
      _lodash2.default.last(_this.updates).body.set(indirectObj.getReference(), indirectObj);
    } else {
      _this.body.set(indirectObj.getReference(), indirectObj);
    }
  };

  this.handleHeader = function (header) {
    _this.header = header;
  };

  this.handleXRefTable = function (xRefTable) {
    if (!_this.trailer) _this.xRefTable = xRefTable;else _lodash2.default.last(_this.updates).xRefTable = xRefTable;
  };

  this.handleTrailer = function (trailer) {
    if (!_this.trailer) _this.trailer = trailer;else _lodash2.default.last(_this.updates).trailer = trailer;

    _this.updates.push({ body: new Map(), xRefTable: null, trailer: null });
  };

  this.handleLinearization = function (linearization) {
    _this.linearization = linearization;
  };

  this.parse = function (bytes) {
    if (_this.activelyParsing) (0, _utils.error)('Cannot parse documents concurrently');
    _this.activelyParsing = true;

    _this.arrays = [];
    _this.dictionaries = [];
    _this.catalog = null;
    _this.header = null;
    _this.body = new Map();
    _this.xRefTable = null;
    _this.trailer = null;
    _this.linearization = null;
    _this.updates = [];

    try {
      (0, _parseDocument2.default)(bytes, _this.parseHandlers);
      _this.activelyParsing = false;
    } catch (e) {
      _this.activelyParsing = false;
      throw e;
    }

    return {
      arrays: _this.arrays,
      dictionaries: _this.dictionaries,
      original: {
        header: _this.header,
        linearization: _this.linearization,
        body: _this.body,
        xRefTable: _this.xRefTable,
        trailer: _this.trailer
      },
      updates: _lodash2.default.initial(_this.updates)
    };
  };

  this.parseHandlers = {
    onParseArray: this.handleArray,
    onParseDict: this.handleDict,
    onParseObjectStream: this.handleObjectStream,
    onParseIndirectObj: this.handleIndirectObj,
    onParseHeader: this.handleHeader,
    onParseXRefTable: this.handleXRefTable,
    onParseTrailer: this.handleTrailer,
    onParseLinearization: this.handleLinearization
  };
};

exports.default = PDFParser;